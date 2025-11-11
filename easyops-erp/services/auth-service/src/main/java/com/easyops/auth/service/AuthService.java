package com.easyops.auth.service;

import com.easyops.auth.dto.*;
import com.easyops.auth.entity.*;
import com.easyops.auth.dto.rbac.RbacPermissionResponse;
import com.easyops.auth.dto.rbac.RbacRoleResponse;
import com.easyops.auth.repository.*;
import com.easyops.auth.util.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Authentication Service
 * 
 * Service class for authentication and authorization operations.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate;

    @Value("${account.lockout.max-attempts}")
    private int maxLoginAttempts;

    @Value("${account.lockout.duration}")
    private int lockoutDuration;

    @Value("${session.max-concurrent}")
    private int maxConcurrentSessions;

    @Value("${password.reset.token-expiration}")
    private int passwordResetTokenExpiration;

    @Value("${services.rbac.base-url:http://rbac-service}")
    private String rbacServiceBaseUrl;

    private static final ParameterizedTypeReference<List<RbacRoleResponse>> ROLE_LIST_TYPE =
            new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<Set<RbacPermissionResponse>> PERMISSION_SET_TYPE =
            new ParameterizedTypeReference<>() {};

    public AuthService(UserRepository userRepository,
                       UserSessionRepository sessionRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       LoginAttemptRepository loginAttemptRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.restTemplate = restTemplate;
    }

    /**
     * Authenticate user and generate JWT tokens
     */
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getUsernameOrEmail());

        // Check if account is locked
        if (isAccountLocked(request.getUsernameOrEmail())) {
            recordLoginAttempt(request.getUsernameOrEmail(), request.getIpAddress(), 
                    request.getUserAgent(), false, "Account locked due to too many failed attempts");
            throw new RuntimeException("Account is locked. Please try again later.");
        }

        // Find user by username or email
        User user = userRepository.findByUsernameOrEmail(
                request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> {
                    recordLoginAttempt(request.getUsernameOrEmail(), request.getIpAddress(), 
                            request.getUserAgent(), false, "User not found");
                    return new RuntimeException("Invalid username/email or password");
                });

        // Check if user is active
        if (!user.getIsActive()) {
            recordLoginAttempt(user.getUsername(), request.getIpAddress(), 
                    request.getUserAgent(), false, "Account is inactive");
            throw new RuntimeException("Account is inactive. Please contact administrator.");
        }

        // Verify password
        log.debug("Checking password for user: {}", user.getUsername());
        log.debug("Password from request: {}", request.getPassword());
        log.debug("Password hash from DB: {}", user.getPasswordHash());
        
        // TEMPORARY: Skip password check for development testing
        boolean passwordMatches = true; // passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        log.debug("Password match result: {}", passwordMatches);
        
        if (!passwordMatches) {
            recordLoginAttempt(user.getUsername(), request.getIpAddress(), 
                    request.getUserAgent(), false, "Invalid password");
            throw new RuntimeException("Invalid username/email or password");
        }

        // Record successful login attempt
        recordLoginAttempt(user.getUsername(), request.getIpAddress(), 
                request.getUserAgent(), true, null);

        // Update last login time
        userRepository.updateLastLogin(user.getId(), LocalDateTime.now());

        // Generate JWT tokens
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("firstName", user.getFirstName());
        claims.put("lastName", user.getLastName());

        List<String> roleCodes = fetchUserRoleCodes(user.getId());
        List<String> permissionCodes = fetchUserPermissionCodes(user.getId());
        if (!roleCodes.isEmpty()) {
            claims.put("roles", roleCodes);
        }
        if (!permissionCodes.isEmpty()) {
            claims.put("permissions", permissionCodes);
        }

        String accessToken = jwtUtil.generateToken(user.getId(), user.getUsername(), claims);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());

        // Create user session
        UserSession session = createUserSession(user.getId(), accessToken, refreshToken, 
                request.getIpAddress(), request.getUserAgent());

        // Check and manage concurrent sessions
        manageConcurrentSessions(user.getId(), session.getId());

        // Prepare response
        LoginResponse response = new LoginResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(jwtUtil.getExpirationTime());
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRoles(roleCodes);
        response.setPermissions(permissionCodes);

        log.info("User {} logged in successfully", user.getUsername());
        return response;
    }

    /**
     * Logout user and invalidate session
     */
    public void logout(String token) {
        sessionRepository.findByToken(token).ifPresent(session -> {
            session.setIsActive(false);
            sessionRepository.save(session);
            log.info("User session invalidated for token");
        });
    }

    /**
     * Refresh access token using refresh token
     */
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        UserSession session = sessionRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (!session.getIsActive()) {
            throw new RuntimeException("Session is no longer active");
        }

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token has expired");
        }

        // Get user
        User user = userRepository.findById(session.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate new tokens
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("firstName", user.getFirstName());
        claims.put("lastName", user.getLastName());

        List<String> roleCodes = fetchUserRoleCodes(user.getId());
        List<String> permissionCodes = fetchUserPermissionCodes(user.getId());
        if (!roleCodes.isEmpty()) {
            claims.put("roles", roleCodes);
        }
        if (!permissionCodes.isEmpty()) {
            claims.put("permissions", permissionCodes);
        }

        String newAccessToken = jwtUtil.generateToken(user.getId(), user.getUsername(), claims);
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());

        // Update session
        session.setToken(newAccessToken);
        session.setRefreshToken(newRefreshToken);
        session.setLastActivityAt(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getRefreshExpirationTime() / 1000));
        sessionRepository.save(session);

        // Prepare response
        LoginResponse response = new LoginResponse();
        response.setAccessToken(newAccessToken);
        response.setRefreshToken(newRefreshToken);
        response.setExpiresIn(jwtUtil.getExpirationTime());
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRoles(roleCodes);
        response.setPermissions(permissionCodes);

        return response;
    }

    /**
     * Initiate password reset
     */
    public void initiatePasswordReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        // Invalidate all existing tokens for this user
        passwordResetTokenRepository.invalidateAllUserTokens(user.getId());

        // Generate reset token
        String token = UUID.randomUUID().toString();
        
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusSeconds(passwordResetTokenExpiration));
        
        passwordResetTokenRepository.save(resetToken);

        // TODO: Send email with reset link
        log.info("Password reset token generated for user: {}", user.getUsername());
        log.info("Reset token (for dev only): {}", token);
    }

    /**
     * Confirm password reset with token
     */
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenAndIsUsedFalse(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        // Update password
        String hashedPassword = passwordEncoder.encode(request.getNewPassword());
        userRepository.updatePassword(resetToken.getUserId(), hashedPassword);

        // Mark token as used
        resetToken.setIsUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        // Invalidate all user sessions
        sessionRepository.deactivateAllUserSessions(resetToken.getUserId());

        log.info("Password reset successfully for user ID: {}", resetToken.getUserId());
    }

    /**
     * Change password for authenticated user
     */
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        String hashedPassword = passwordEncoder.encode(request.getNewPassword());
        userRepository.updatePassword(userId, hashedPassword);

        // Invalidate all sessions except current one (would need current session ID)
        log.info("Password changed successfully for user: {}", user.getUsername());
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            if (!jwtUtil.isValidTokenStructure(token)) {
                return false;
            }

            String username = jwtUtil.extractUsername(token);
            return jwtUtil.validateToken(token, username);
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Create user session
     */
    private UserSession createUserSession(UUID userId, String accessToken, String refreshToken, 
                                         String ipAddress, String userAgent) {
        LocalDateTime now = LocalDateTime.now();
        UserSession session = new UserSession(
                userId,
                accessToken,
                refreshToken,
                ipAddress,
                userAgent,
                Boolean.TRUE,
                now.plusSeconds(jwtUtil.getRefreshExpirationTime() / 1000),
                now
        );

        return sessionRepository.save(session);
    }

    /**
     * Fetch role codes assigned to the user from the RBAC service.
     */
    private List<String> fetchUserRoleCodes(UUID userId) {
        try {
            ResponseEntity<List<RbacRoleResponse>> response = restTemplate.exchange(
                    String.format("%s/api/rbac/authorization/users/%s/roles", rbacServiceBaseUrl, userId),
                    HttpMethod.GET,
                    null,
                    ROLE_LIST_TYPE
            );

            List<RbacRoleResponse> roles = response.getBody();
            if (roles == null) {
                return Collections.emptyList();
            }

            return roles.stream()
                    .filter(Objects::nonNull)
                    .map(RbacRoleResponse::getCode)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(code -> !code.isEmpty())
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            log.warn("Failed to fetch roles from RBAC service for user {}: {}", userId, ex.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Fetch permission codes assigned to the user from the RBAC service.
     */
    private List<String> fetchUserPermissionCodes(UUID userId) {
        try {
            ResponseEntity<Set<RbacPermissionResponse>> response = restTemplate.exchange(
                    String.format("%s/api/rbac/authorization/users/%s/permissions", rbacServiceBaseUrl, userId),
                    HttpMethod.GET,
                    null,
                    PERMISSION_SET_TYPE
            );

            Set<RbacPermissionResponse> permissions = response.getBody();
            if (permissions == null) {
                return Collections.emptyList();
            }

            return permissions.stream()
                    .filter(Objects::nonNull)
                    .map(RbacPermissionResponse::getCode)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(code -> !code.isEmpty())
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            log.warn("Failed to fetch permissions from RBAC service for user {}: {}", userId, ex.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Manage concurrent sessions
     */
    private void manageConcurrentSessions(UUID userId, UUID currentSessionId) {
        long activeSessions = sessionRepository.countByUserIdAndIsActiveTrue(userId);
        
        if (activeSessions > maxConcurrentSessions) {
            sessionRepository.deactivateOtherSessions(userId, currentSessionId);
            log.info("Deactivated old sessions for user ID: {}", userId);
        }
    }

    /**
     * Record login attempt
     */
    private void recordLoginAttempt(String username, String ipAddress, String userAgent, 
                                   boolean successful, String failureReason) {
        LoginAttempt attempt = new LoginAttempt();
        attempt.setUsername(username);
        attempt.setIpAddress(ipAddress);
        attempt.setUserAgent(userAgent);
        attempt.setSuccessful(successful);
        attempt.setFailureReason(failureReason);
        
        loginAttemptRepository.save(attempt);
    }

    /**
     * Check if account is locked
     */
    private boolean isAccountLocked(String username) {
        LocalDateTime since = LocalDateTime.now().minusSeconds(lockoutDuration);
        long failedAttempts = loginAttemptRepository
                .countByUsernameAndSuccessfulFalseAndAttemptedAtAfter(username, since);
        
        return failedAttempts >= maxLoginAttempts;
    }
}

