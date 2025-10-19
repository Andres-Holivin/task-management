export const TaskStatus = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
}

export interface TaskSuggestion {
    title: string;
    description: string;
}
