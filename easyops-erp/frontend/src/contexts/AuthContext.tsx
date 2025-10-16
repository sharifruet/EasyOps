import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@services/authService';
import { LoginRequest, LoginResponse } from '@types/index';

interface AuthContextType {
  user: any | null;
  currentOrganizationId: string | null;
  currentOrganizationName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshAuth: () => void;
  setCurrentOrganization: (organizationId: string, organizationName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);
  const [currentOrganizationName, setCurrentOrganizationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    
    // Load organization info
    const orgId = authService.getCurrentOrganizationId();
    const orgName = authService.getCurrentOrganizationName();
    setCurrentOrganizationId(orgId);
    setCurrentOrganizationName(orgName);
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await authService.login(credentials);
    setUser({
      id: response.userId,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
    });
    
    // Update organization info after login
    const orgId = authService.getCurrentOrganizationId();
    const orgName = authService.getCurrentOrganizationName();
    setCurrentOrganizationId(orgId);
    setCurrentOrganizationName(orgName);
    
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentOrganizationId(null);
    setCurrentOrganizationName(null);
  };

  const refreshAuth = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    const orgId = authService.getCurrentOrganizationId();
    const orgName = authService.getCurrentOrganizationName();
    setCurrentOrganizationId(orgId);
    setCurrentOrganizationName(orgName);
  };

  const setCurrentOrganization = (organizationId: string, organizationName: string) => {
    authService.setCurrentOrganization(organizationId, organizationName);
    setCurrentOrganizationId(organizationId);
    setCurrentOrganizationName(organizationName);
  };

  const value = {
    user,
    currentOrganizationId,
    currentOrganizationName,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAuth,
    setCurrentOrganization,
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

