import { create } from 'zustand';
import { tasksApi } from '@/services/tasks';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/types/task';
import moment from 'moment';

interface TasksState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTasks: () => Promise<void>;
    createTask: (data: CreateTaskDto) => Promise<Task>;
    updateTask: (id: string, data: UpdateTaskDto) => Promise<Task>;
    deleteTask: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await tasksApi.getAll();
            set({ tasks: Array.isArray(response.data) ? response.data : [], isLoading: false });
        } catch (error: any) {
            let errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch tasks';
            set({
                tasks: [],
                error: errorMessage,
                isLoading: false,
            });
            throw error;
        }
    },

    createTask: async (data: CreateTaskDto) => {
        set({ error: null });
        try {
            if (data.deadline) {
                data.deadline = moment(data.deadline).toDate();
            }
            const response = await tasksApi.create(data);
            const task = response.data;
            set((state) => ({
                tasks: [task, ...state.tasks],
                isLoading: false,
                error: null,
            }));
            return task;
        } catch (error: any) {
            let errorMessage = error?.response?.data?.message || error?.message || 'Failed to create task';
            set({
                error: errorMessage,
                isLoading: false,
            });
            throw error;
        }
    },

    updateTask: async (id: string, data: UpdateTaskDto) => {
        set({ isLoading: true, error: null });
        try {
            const response = await tasksApi.update(id, data);
            const updatedTask = response.data;
            set((state) => ({
                tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
                isLoading: false,
                error: null,
            }));
            return updatedTask;
        } catch (error: any) {
            let errorMessage = error?.response?.data?.message || error?.message || 'Failed to update task';
            set({
                error: errorMessage,
                isLoading: false,
            });
            throw error;
        }
    },

    deleteTask: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await tasksApi.delete(id);
            set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== id),
                isLoading: false,
                error: null,
            }));
        } catch (error: any) {
            let errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete task';
            set({
                error: errorMessage,
                isLoading: false,
            });
            throw error;
        }
    },
}));
