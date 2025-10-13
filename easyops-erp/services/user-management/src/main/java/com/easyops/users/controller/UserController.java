package com.easyops.users.controller;

import com.easyops.users.dto.UserCreateRequest;
import com.easyops.users.dto.UserResponse;
import com.easyops.users.dto.UserUpdateRequest;
import com.easyops.users.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * User Controller
 * 
 * REST controller for user management operations.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Create a new user
     * 
     * @param request User creation request
     * @return Created user
     */
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /**
     * Get user by ID
     * 
     * @param id User ID
     * @return User details
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Get all users with pagination
     * 
     * @param pageable Pagination parameters
     * @return Page of users
     */
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Update user
     * 
     * @param id User ID
     * @param request User update request
     * @return Updated user
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable UUID id, 
                                                @Valid @RequestBody UserUpdateRequest request) {
        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(user);
    }

    /**
     * Delete user
     * 
     * @param id User ID
     * @return No content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Activate user
     * 
     * @param id User ID
     * @return Updated user
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserResponse> activateUser(@PathVariable UUID id) {
        UserResponse user = userService.activateUser(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Deactivate user
     * 
     * @param id User ID
     * @return Updated user
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable UUID id) {
        UserResponse user = userService.deactivateUser(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Search users
     * 
     * @param searchTerm Search term
     * @param pageable Pagination parameters
     * @return Page of users
     */
    @GetMapping("/search")
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam(name = "searchTerm", required = true) String searchTerm, 
            Pageable pageable) {
        Page<UserResponse> users = userService.searchUsers(searchTerm, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Get user statistics
     * 
     * @return User statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Object> getUserStats() {
        Object stats = userService.getUserStats();
        return ResponseEntity.ok(stats);
    }
}
