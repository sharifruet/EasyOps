import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import authService from '@services/authService';
import rbacService from '@services/rbacService';
import { LoginRequest, LoginResponse, Permission, Role } from '@types/index';

interface AuthContextType {
  user: any | null;
  currentOrganizationId: string | null;
  currentOrganizationName: string | null;
  roles: string[];
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshAuth: () => void;
  setCurrentOrganization: (organizationId: string, organizationName: string) => void;
  hasRole: (roleCode: string) => boolean;
  hasPermission: (permissionCode: string) => boolean;
  hasAnyPermission: (permissionCodes: string[]) => boolean;
  canViewResource: (resource: string) => boolean;
  canManageResource: (resource: string) => boolean;
  reloadRbacState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);
  const [currentOrganizationName, setCurrentOrganizationName] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredRbacState = useCallback(() => {
    try {
      const storedRoles = localStorage.getItem('userRoles');
      if (storedRoles) {
        const parsedRoles = JSON.parse(storedRoles);
        if (Array.isArray(parsedRoles)) {
          setRoles(parsedRoles);
        }
      }
    } catch (error) {
      console.error('Failed to parse stored role data', error);
      setRoles([]);
    }

    try {
      const storedPermissions = localStorage.getItem('userPermissions');
      if (storedPermissions) {
        const parsedPermissions = JSON.parse(storedPermissions);
        if (Array.isArray(parsedPermissions)) {
          setPermissions(parsedPermissions);
        }
      }
    } catch (error) {
      console.error('Failed to parse stored permission data', error);
      setPermissions([]);
    }
  }, []);

  const syncRbacState = useCallback(
    async (userId: string) => {
      try {
        const [roleResponses, permissionResponses] = await Promise.all([
          rbacService.getUserRoles(userId),
          rbacService.getUserPermissions(userId),
        ]);

        const roleCodes = (roleResponses || [])
          .map((role: Role) => role.code)
          .filter((code): code is string => Boolean(code));

        setRoles(roleCodes);
        localStorage.setItem('userRoles', JSON.stringify(roleCodes));

        const permissionList = (permissionResponses || []).filter(
          (permission: Permission) => Boolean(permission?.code)
        );
        setPermissions(permissionList);
        localStorage.setItem('userPermissions', JSON.stringify(permissionList));
      } catch (error) {
        console.error('Failed to synchronize RBAC state', error);
        // Keep any previously cached value to avoid locking user out unexpectedly
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setIsLoading(true);

      const currentUser = authService.getCurrentUser();
      if (currentUser && isMounted) {
        setUser(currentUser);
      }

      loadStoredRbacState();

      const orgId = authService.getCurrentOrganizationId();
      const orgName = authService.getCurrentOrganizationName();
      if (isMounted) {
        setCurrentOrganizationId(orgId);
        setCurrentOrganizationName(orgName);
      }

      if (currentUser?.id) {
        try {
          await syncRbacState(currentUser.id);
        } catch (error) {
          // errors already logged inside syncRbacState
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [loadStoredRbacState, syncRbacState]);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await authService.login(credentials);
    setUser({
      id: response.userId,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
    });
    
    // Persist role codes from login response immediately
    const roleCodes = Array.isArray(response.roles) ? response.roles : [];
    setRoles(roleCodes);
    localStorage.setItem('userRoles', JSON.stringify(roleCodes));

    // Update organization info after login
    const orgId = authService.getCurrentOrganizationId();
    const orgName = authService.getCurrentOrganizationName();
    setCurrentOrganizationId(orgId);
    setCurrentOrganizationName(orgName);

    // Fetch full RBAC state (roles + permissions)
    if (response.userId) {
      await syncRbacState(response.userId.toString());
    } else {
      const permissionCodes = Array.isArray(response.permissions) ? response.permissions : [];
      const fallbackPermissions = permissionCodes.map((code) => ({
        id: code,
        name: code,
        code,
        resource: '',
        action: '',
        description: '',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      }));
      localStorage.setItem('userPermissions', JSON.stringify(fallbackPermissions));
      setPermissions(fallbackPermissions);
    }
    
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentOrganizationId(null);
    setCurrentOrganizationName(null);
    setRoles([]);
    setPermissions([]);
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userPermissions');
  };

  const refreshAuth = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    const orgId = authService.getCurrentOrganizationId();
    const orgName = authService.getCurrentOrganizationName();
    setCurrentOrganizationId(orgId);
    setCurrentOrganizationName(orgName);

    loadStoredRbacState();

    if (currentUser?.id) {
      syncRbacState(currentUser.id).catch(() => {
        // errors already logged
      });
    }
  };

  const setCurrentOrganization = (organizationId: string, organizationName: string) => {
    authService.setCurrentOrganization(organizationId, organizationName);
    setCurrentOrganizationId(organizationId);
    setCurrentOrganizationName(organizationName);
  };

  const hasRole = useCallback(
    (roleCode: string) => roles.includes(roleCode),
    [roles]
  );

  const hasPermission = useCallback(
    (permissionCode: string) => permissions.some((permission) => permission.code === permissionCode),
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (permissionCodes: string[]) =>
      permissionCodes.some((permission) =>
        permissions.some((userPermission) => userPermission.code === permission)
      ),
    [permissions]
  );

  const normalizedAction = (action?: string | null) => (action || '').toLowerCase();

  const canViewResource = useCallback(
    (resource: string) =>
      permissions.some(
        (permission) =>
          permission.isActive &&
          permission.resource === resource &&
          ['view', 'manage', 'admin'].includes(normalizedAction(permission.action))
      ),
    [permissions]
  );

  const canManageResource = useCallback(
    (resource: string) =>
      permissions.some(
        (permission) =>
          permission.isActive &&
          permission.resource === resource &&
          ['manage', 'admin'].includes(normalizedAction(permission.action))
      ),
    [permissions]
  );

  const value = {
    user,
    currentOrganizationId,
    currentOrganizationName,
    roles,
    permissions,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAuth,
    setCurrentOrganization,
    hasRole,
    hasPermission,
    hasAnyPermission,
    canViewResource,
    canManageResource,
    reloadRbacState: async () => {
      if (user?.id) {
        await syncRbacState(user.id);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

