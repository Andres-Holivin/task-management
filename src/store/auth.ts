import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useMemo } from 'react';
import type { LoginRequest, RegisterRequest, User, AuthState } from '@/types/auth';
import { toast } from 'sonner';
import { authService } from '@/services/auth';
import { th } from 'zod/v4/locales';

interface AuthActions {
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokenAction: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    checkAuth: () => Promise<void>;
    reset: () => void;
}

interface AuthStore extends AuthState, AuthActions { }

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,
            login: async (credentials: LoginRequest) => {
                toast.loading('Logging in...', { id: 'login' });
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.login(credentials);
                    localStorage.setItem('access_token', response.data.accessToken);
                    localStorage.setItem('refresh_token', response.data.refreshToken);

                    set({
                        user: response.data.user,
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    toast.success('Logged in successfully', { id: 'login' });
                } catch (error: any) {
                    console.error('Login error:', error);
                    const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';

                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage,
                    });
                    toast.error(errorMessage, { id: 'login' });
                    throw error;
                }
            },

            register: async (userData: RegisterRequest) => {
                try {
                    toast.loading('Registering...', { id: 'register' });
                    set({ isLoading: true, error: null });

                    const response = await authService.register(userData);

                    if ('success' in response.data && !response.data.success) {
                        throw new Error(response.data.message || 'Registration failed');
                    }

                    set({ isLoading: false, error: null });
                    toast.success('Account created successfully! Please log in.', { id: 'register' });
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed. Please try again.';

                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage,
                    });
                    toast.error(errorMessage, { id: 'register' });

                    throw error;
                }
            },

            logout: async () => {
                try {
                    toast.loading('Logging out...', { id: 'logout' });
                    set({ isLoading: true });

                    await authService.logout();

                    set({ ...initialState, isLoading: false });
                    toast.success('Logged out successfully', { id: 'logout' });
                } catch (error) {
                    console.error('Logout error:', error);
                    set({
                        ...initialState,
                        isLoading: false,
                    });
                    toast.success('Logged out successfully', { id: 'logout' });
                }
            },

            refreshTokenAction: async () => {
                try {
                    console.log('Refreshing token...');
                    const { refreshToken } = get();

                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    set({ isLoading: true, error: null });

                    const response = await authService.refreshToken(refreshToken);
                    localStorage.setItem('access_token', response.data.accessToken);
                    localStorage.setItem('refresh_token', response.data.refreshToken);

                    set({
                        user: response.data.user,
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    console.log('Token refreshed successfully');
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    set({
                        ...initialState,
                        isLoading: false,
                        error: 'Session expired. Please login again.',
                    });

                    throw error;
                }
            },
            fetchProfile: async () => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.getProfile();
                    console.log('Fetched user profile:', response.data);
                    set({
                        user: response.data,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch profile';

                    set({
                        isLoading: false,
                        error: errorMessage,
                    });

                    throw error;
                }
            },
            setUser: (user: User | null) => {
                set({ user, isAuthenticated: !!user });
            },

            setLoading: (isLoading: boolean) => {
                set({ isLoading });
            },

            setError: (error: string | null) => {
                set({ error });
            },

            clearError: () => {
                set({ error: null });
            },
            checkAuth: async () => {
                console.log('Checking auth status...');
                try {
                    const isAuthenticated = authService.isAuthenticated();
                    if (isAuthenticated) {
                        const accessToken = localStorage.getItem('access_token');
                        const refreshToken = localStorage.getItem('refresh_token');
                        await get().fetchProfile();
                        set({
                            isAuthenticated: true,
                            accessToken,
                            refreshToken,
                        });
                    } else {
                        set({
                            ...initialState,
                        });
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    set({
                        ...initialState,
                    });
                }
            },
            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);

export const useAuthActions = () => {
    const login = useAuthStore((state) => state.login);
    const register = useAuthStore((state) => state.register);
    const logout = useAuthStore((state) => state.logout);
    const refreshToken = useAuthStore((state) => state.refreshTokenAction);
    const fetchProfile = useAuthStore((state) => state.fetchProfile);
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const setUser = useAuthStore((state) => state.setUser);
    const setLoading = useAuthStore((state) => state.setLoading);
    const setError = useAuthStore((state) => state.setError);
    const clearError = useAuthStore((state) => state.clearError);
    const reset = useAuthStore((state) => state.reset);

    return useMemo(
        () => ({
            login,
            register,
            logout,
            refreshToken,
            fetchProfile,
            checkAuth,
            setUser,
            setLoading,
            setError,
            clearError,
            reset,
        }),
        [
            login,
            register,
            logout,
            refreshToken,
            fetchProfile,
            checkAuth,
            setUser,
            setLoading,
            setError,
            clearError,
            reset,
        ]
    );
};

export const useAuthState = () => {
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useMemo(
        () => ({
            isLoading,
            error,
            user,
            isAuthenticated,
        }),
        [isLoading, error, user, isAuthenticated]
    );
};
