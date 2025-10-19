import type { ApiResponse } from '@/types/auth';
import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://task-board-server-andres.vercel.app';

class ApiClient {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = localStorage.getItem('access_token');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
        this.client.interceptors.response.use(
            (response: AxiosResponse<ApiResponse<unknown>>) => {
                if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
                    return {
                        ...response,
                        data: response.data.data,
                    } as AxiosResponse;
                }
                return response;
            },
            async (error) => {
                if (error.response?.status === 401) {
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (refreshToken) {
                        try {
                            const response = await axios.post<ApiResponse<{
                                accessToken: string;
                                refreshToken: string;
                            }>>(`${API_URL}/auth/refresh`, {
                                refreshToken: refreshToken,
                            });

                            let accessToken: string;
                            let newRefreshToken: string;

                            if (response.data && 'data' in response.data) {
                                accessToken = response.data.data.accessToken;
                                newRefreshToken = response.data.data.refreshToken;
                            } else {
                                accessToken = (response.data as any).accessToken;
                                newRefreshToken = (response.data as any).refreshToken;
                            }

                            localStorage.setItem('access_token', accessToken);
                            localStorage.setItem('refresh_token', newRefreshToken);

                            error.config.headers.Authorization = `Bearer ${accessToken}`;
                            return this.client.request(error.config);
                        } catch {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            window.location.href = '/login';
                        }
                    } else {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    get<T>(url: string, config?: any) {
        return this.client.get<T>(url, config);
    }

    post<T>(url: string, data?: any, config?: any) {
        return this.client.post<T>(url, data, config);
    }

    patch<T>(url: string, data?: any, config?: any) {
        return this.client.patch<T>(url, data, config);
    }

    delete<T>(url: string, config?: any) {
        return this.client.delete<T>(url, config);
    }
}

export const apiClient = new ApiClient();
