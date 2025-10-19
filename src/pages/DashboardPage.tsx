import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { TaskStatus, type Task, type CreateTaskDto, type UpdateTaskDto } from '@/types/task';
import {
    FileDown, Plus, LogOut, CheckCircle, Clock, ListTodo,
    Search, X, TrendingUp,
    Menu
} from 'lucide-react';
import { toast } from 'sonner';
import { TaskCard } from '@/components/custom/TaskCard';
import { TaskForm } from '@/components/custom/TaskForm';
import { generateTasksPDF } from '@/lib/pdf-generate';
import { useAuthActions, useAuthState } from '@/store/auth';
import { useTasksStore } from '@/store/tasks';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

type FilterMode = 'all' | 'todo' | 'in-progress' | 'done';

export function DashboardPage() {
    const navigate = useNavigate();
    const { tasks, isLoading, error, fetchTasks, createTask, updateTask, deleteTask } = useTasksStore();
    const { logout } = useAuthActions();
    const { user } = useAuthState();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<FilterMode>('all');

    useEffect(() => {
        fetchTasks().catch((err) => {
            toast.error('Failed to load tasks');
            console.error(err);
        });
    }, [fetchTasks]);

    const handleCreateTask = async (data: CreateTaskDto) => {
        try {
            await createTask(data);
            toast.success('Task created successfully');
            setShowCreateForm(false);
        } catch {
            toast.error('Failed to create task');
        }
    };

    const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
        const updateData: UpdateTaskDto = { status: newStatus };

        try {
            await updateTask(task.id, updateData);
            const statusLabels = {
                [TaskStatus.TODO]: 'To Do',
                [TaskStatus.IN_PROGRESS]: 'In Progress',
                [TaskStatus.DONE]: 'Complete',
            };
            toast.success(`Task moved to ${statusLabels[newStatus]}`);
        } catch {
            toast.error('Failed to update task');
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await deleteTask(taskId);
            toast.success('Task deleted successfully');
        } catch {
            toast.error('Failed to delete task');
        }
    };

    const handleDownloadReport = () => {
        if (tasks.length === 0) {
            toast.error('No tasks to generate report');
            return;
        }

        try {
            generateTasksPDF(tasks);
            toast.success('Report downloaded successfully');
        } catch {
            toast.error('Failed to generate report');
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };
    const filteredTasks = useMemo(() => {
        let result = tasks;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                task =>
                    task.title.toLowerCase().includes(query) ||
                    task.description?.toLowerCase().includes(query)
            );
        }
        if (filterMode !== 'all') {
            const statusMap: Record<FilterMode, TaskStatus | null> = {
                all: null,
                todo: TaskStatus.TODO,
                'in-progress': TaskStatus.IN_PROGRESS,
                done: TaskStatus.DONE,
            };
            const targetStatus = statusMap[filterMode];
            if (targetStatus) {
                result = result.filter(t => t.status === targetStatus);
            }
        }

        return result;
    }, [tasks, searchQuery, filterMode]);

    const todoTasks = filteredTasks.filter(t => t.status === TaskStatus.TODO);
    const inProgressTasks = filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
    const doneTasks = filteredTasks.filter(t => t.status === TaskStatus.DONE);

    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <ListTodo className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
                                    <p className="text-xs text-gray-600">
                                        {user ? `Welcome back, ${user.fullName}` : 'Manage your tasks efficiently'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>

                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Menu className="w-4 h-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={handleDownloadReport} >
                                        <FileDown className="w-4 h-4 mr-2" />
                                        Download Report
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} variant="destructive">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </DropdownMenuItem>

                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button onClick={() => setShowCreateForm(true)} size="sm" className="shadow-md">
                                <Plus className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">New Task</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogClose onClick={() => setShowCreateForm(false)} />
                        <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                            <DialogDescription>Add a new task to your list</DialogDescription>
                        </DialogHeader>
                        <DialogContent>
                            <TaskForm
                                onSubmit={handleCreateTask}
                                onCancel={() => setShowCreateForm(false)}
                            />
                        </DialogContent>
                    </DialogContent>
                </Dialog>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-purple-100 font-medium">Total Tasks</CardDescription>
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <CardTitle className="text-4xl font-bold">{totalTasks}</CardTitle>
                            <p className="text-xs text-purple-100 mt-1">{completionRate}% completed</p>
                        </CardHeader>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-blue-700 font-medium">To Do</CardDescription>
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <ListTodo className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <CardTitle className="text-4xl font-bold text-blue-900">{todoTasks.length}</CardTitle>
                            <p className="text-xs text-blue-600 mt-1">Pending tasks</p>
                        </CardHeader>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-amber-700 font-medium">In Progress</CardDescription>
                                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                            </div>
                            <CardTitle className="text-4xl font-bold text-amber-900">{inProgressTasks.length}</CardTitle>
                            <p className="text-xs text-amber-600 mt-1">Active work</p>
                        </CardHeader>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-green-700 font-medium">Completed</CardDescription>
                                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="text-4xl font-bold text-green-900">{doneTasks.length}</CardTitle>
                            <p className="text-xs text-green-600 mt-1">Finished tasks</p>
                        </CardHeader>
                    </Card>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
                        <p className="font-medium">Error loading tasks</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                {isLoading && (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                        <p className="mt-4 text-gray-600 font-medium">Loading your tasks...</p>
                    </div>
                )}

                {!isLoading && tasks.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-sm">
                        <div className="text-gray-300 mb-6">
                            <ListTodo className="w-20 h-20 mx-auto" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            Get started by creating your first task to organize your work and boost productivity!
                        </p>
                        <Button className="shadow-lg" size="lg" onClick={() => setShowCreateForm(true)}>
                            <Plus className="w-5 h-5 mr-2" />
                            Create Your First Task
                        </Button>
                    </div>
                )}

                {!isLoading && tasks.length > 0 && filteredTasks.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-gray-300 mb-4">
                            <Search className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-500 mb-4">
                            {searchQuery ? `No tasks match "${searchQuery}"` : 'No tasks in this category'}
                        </p>
                        <div className="flex gap-2 justify-center">
                            {searchQuery && (
                                <Button variant="outline" onClick={() => setSearchQuery('')}>
                                    <X className="w-4 h-4 mr-2" />
                                    Clear Search
                                </Button>
                            )}
                            {filterMode !== 'all' && (
                                <Button variant="outline" onClick={() => setFilterMode('all')}>
                                    Show All Tasks
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {!isLoading && filteredTasks.length > 0 && (
                    <div className="space-y-6">
                        {todoTasks.length > 0 && (
                            <div className="bg-white/50 rounded-xl p-6 border border-blue-100">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <ListTodo className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">To Do</h2>
                                            <p className="text-xs text-gray-500">{todoTasks.length} {todoTasks.length === 1 ? 'task' : 'tasks'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'}>
                                    {todoTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {inProgressTasks.length > 0 && (
                            <div className="bg-white/50 rounded-xl p-6 border border-amber-100">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">In Progress</h2>
                                            <p className="text-xs text-gray-500">{inProgressTasks.length} {inProgressTasks.length === 1 ? 'task' : 'tasks'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'}
                                >
                                    {inProgressTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {doneTasks.length > 0 && (
                            <div className="bg-white/50 rounded-xl p-6 border border-green-100">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">Completed</h2>
                                            <p className="text-xs text-gray-500">{doneTasks.length} {doneTasks.length === 1 ? 'task' : 'tasks'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'}
                                >
                                    {doneTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
