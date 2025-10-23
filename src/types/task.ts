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
    pic: string | null;
    deadline: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    pic?: string;
    deadline?: Date;
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
