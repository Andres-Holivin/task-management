import { apiClient } from '@/lib/api-client';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskSuggestion } from '@/types/task';

export const tasksApi = {
    getAll: async () => {
        return await apiClient.get<Task[]>('/tasks');
    },

    getOne: async (id: string) => {
        return await apiClient.get<Task>(`/tasks/${id}`);
    },

    create: async (data: CreateTaskDto) => {
        return await apiClient.post<Task>('/tasks', data);
    },

    update: async (id: string, data: UpdateTaskDto) => {
        return await apiClient.patch<Task>(`/tasks/${id}`, data);
    },

    delete: async (id: string) => {
        await apiClient.delete(`/tasks/${id}`);
    },

    getSuggestions: async (context?: string) => {
        return await apiClient.get<TaskSuggestion[]>('/tasks/suggestions', {
            params: { context },
        });
    },
};
