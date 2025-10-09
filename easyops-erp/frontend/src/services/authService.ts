import api from './api';
import {
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  ChangePasswordRequest,
} from '@types/index';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', credentials);
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

    return data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/refresh', {
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

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default new AuthService();

