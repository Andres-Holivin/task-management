import { apiClient } from '@/lib/api-client';
import type { AuthResponse, LoginDto, RegisterDto, User, ApiResponse } from '@/types/auth';

export const authService = {
    login: async (data: LoginDto) => {
        return await apiClient.post<AuthResponse>('/auth/login', data);
    },

    register: async (data: RegisterDto) => {
        return await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    },

    getProfile: async () => {
        return await apiClient.get<User>('/auth/profile');
    },

    refreshToken: async (refreshToken: string) => {
        return await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    },

    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },
};

