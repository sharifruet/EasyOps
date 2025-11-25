import api from './api';
import axios from 'axios';
import {
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  ChangePasswordRequest,
} from '@types/index';

// Use API Gateway for auth service calls
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/auth/login', credentials);
    const data = response.data;

    // Store tokens and user info
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify({
      id: data.userId,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    }));

    // Fetch user's organizations and store the first one as current
    try {
      const orgsResponse = await api.get('/api/organizations?page=0&size=1');
      if (orgsResponse.data.content && orgsResponse.data.content.length > 0) {
        const firstOrg = orgsResponse.data.content[0];
        localStorage.setItem('currentOrganizationId', firstOrg.id);
        localStorage.setItem('currentOrganizationName', firstOrg.name);
      }
    } catch (error) {
      console.error('Failed to fetch user organizations:', error);
    }

    return data;
  }

  async logout(): Promise<void> {
    try {
      await authApi.post('/api/auth/logout');
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('currentOrganizationId');
      localStorage.removeItem('currentOrganizationName');
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  async resetPassword(data: PasswordResetRequest): Promise<void> {
    await api.post('/api/auth/password/reset', data);
  }

  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<void> {
    await api.post('/api/auth/password/reset/confirm', data);
  }

  async changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
    await api.post(`/api/auth/password/change/${userId}`, data);
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await api.get<{ valid: boolean }>('/api/auth/validate');
      return response.data.valid;
    } catch {
      return false;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getCurrentOrganizationId(): string | null {
    return localStorage.getItem('currentOrganizationId');
  }

  getCurrentOrganizationName(): string | null {
    return localStorage.getItem('currentOrganizationName');
  }

  setCurrentOrganization(organizationId: string, organizationName: string): void {
    localStorage.setItem('currentOrganizationId', organizationId);
    localStorage.setItem('currentOrganizationName', organizationName);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default new AuthService();

