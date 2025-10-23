import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TaskStatus, type Task } from '@/types/task';
import { CheckCircle2, Circle, Clock, Trash2, ArrowRight, MoreVertical, Edit, PlayCircle, RotateCcw } from 'lucide-react';
import moment from 'moment';

interface TaskCardProps {
    task: Task;
    onStatusChange: (task: Task, newStatus: TaskStatus) => void;
    onDelete: (taskId: string) => void;
    onEdit?: (task: Task) => void;
}

const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.DONE:
            return <CheckCircle2 className="w-5 h-5 text-green-600" />;
        case TaskStatus.IN_PROGRESS:
            return <Clock className="w-5 h-5 text-blue-600" />;
        default:
            return <Circle className="w-5 h-5 text-gray-400" />;
    }
};

const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.DONE:
            return 'bg-green-100 text-green-800 border-green-200';
        case TaskStatus.IN_PROGRESS:
            return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getStatusLabel = (status: TaskStatus) => {
    return status.replace('_', ' ');
};

export function TaskCard({ task, onStatusChange, onDelete, onEdit }: Readonly<TaskCardProps>) {
    const isCompleted = task.status === TaskStatus.DONE;

    const getNextStatus = () => {
        switch (task.status) {
            case TaskStatus.TODO:
                return TaskStatus.IN_PROGRESS;
            case TaskStatus.IN_PROGRESS:
                return TaskStatus.DONE;
            case TaskStatus.DONE:
                return TaskStatus.TODO;
            default:
                return TaskStatus.TODO;
        }
    };

    const getStatusButtonLabel = () => {
        switch (task.status) {
            case TaskStatus.TODO:
                return 'Start';
            case TaskStatus.IN_PROGRESS:
                return 'Complete';
            case TaskStatus.DONE:
                return 'Reopen';
            default:
                return 'Update';
        }
    };

    const getStatusButtonIcon = () => {
        switch (task.status) {
            case TaskStatus.TODO:
                return <PlayCircle className="w-4 h-4" />;
            case TaskStatus.IN_PROGRESS:
                return <CheckCircle2 className="w-4 h-4" />;
            case TaskStatus.DONE:
                return <RotateCcw className="w-4 h-4" />;
            default:
                return <ArrowRight className="w-4 h-4" />;
        }
    };

    const getCardBorderClass = () => {
        switch (task.status) {
            case TaskStatus.TODO:
                return 'border-l-4 border-l-gray-300';
            case TaskStatus.IN_PROGRESS:
                return 'border-l-4 border-l-amber-400';
            case TaskStatus.DONE:
                return 'border-l-4 border-l-green-500';
            default:
                return '';
        }
    };
    const getDeadlineStyle = (due: number) => {
        if (due <= 0) {
            return 'text-destructive bg-red-100 rounded-md px-1 font-medium';
        } else if (due <= 3) {
            return 'text-yellow-600 bg-yellow-100 rounded-md px-1 font-medium';
        } else {
            return 'text-green-600 bg-green-100 rounded-md px-1 font-medium';
        }
    }

    const getDeadlineInfo = () => {
        if (task.status === TaskStatus.DONE) {
            return <div className="text-green-600">Completed</div>;
        }
        if (!task.deadline) {
            return <div className="text-gray-400">No Deadline</div>;
        }
        const deadlineDate = moment(task.deadline);
        const now = moment();
        const diffDays = deadlineDate.diff(now);
        if (diffDays < 0) {
            return <div className={getDeadlineStyle(diffDays)}>Overdue by {deadlineDate.fromNow(true)}</div>;
        } else {
            return <div className={getDeadlineStyle(deadlineDate.diff(now, 'days'))}>Due in {deadlineDate.fromNow(true)}</div>;
        }
    }

    return (
        <Card
            className={`transition-all hover:shadow-lg hover:-translate-y-1 ${getCardBorderClass()} ${isCompleted ? 'opacity-90 bg-gradient-to-br from-gray-50 to-white' : 'bg-white'
                }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-0.5">
                            {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 justify-between">
                                <CardTitle
                                    className={`text-base font-semibold leading-snug ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                                        }`}
                                >
                                    {task.title}
                                </CardTitle>
                                <div className="text-xs text-gray-400">
                                    {
                                        task.deadline
                                            ? `Due: ${moment(task.deadline).format('MMM D, YYYY HH:mm')}`
                                            : 'No Deadline'
                                    }
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadgeClass(task.status)}`}>
                                    {getStatusLabel(task.status)}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {getDeadlineInfo()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                <span className="sr-only">Open actions menu</span>
                                <MoreVertical className="w-4 h-4" />
                            </Button>

                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => onStatusChange(task, getNextStatus())}
                            >
                                {getStatusButtonIcon()}
                                {getStatusButtonLabel()}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => onStatusChange(task, TaskStatus.TODO)}
                                disabled={task.status === TaskStatus.TODO}
                            >
                                <Circle className="w-4 h-4" />
                                Move to To Do
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => onStatusChange(task, TaskStatus.IN_PROGRESS)}
                                disabled={task.status === TaskStatus.IN_PROGRESS}
                            >
                                <Clock className="w-4 h-4" />
                                Move to In Progress
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => onStatusChange(task, TaskStatus.DONE)}
                                disabled={task.status === TaskStatus.DONE}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Move to Done
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(task)} >
                                    <Edit className="w-4 h-4" />
                                    Edit Task
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                onClick={() => onDelete(task.id)}
                                variant="destructive"
                            >
                                <Trash2 className="w-4 h-4" />

                                Delete Task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            {task.description && (
                <CardContent className="pt-0 pb-3">
                    <CardDescription
                        className={`text-sm leading-relaxed ${isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}
                    >
                        {task.description}
                    </CardDescription>
                </CardContent>
            )}

            <CardFooter className="pt-3 border-t border-gray-100 flex gap-2">
                <Button
                    size="sm"
                    variant={task.status === TaskStatus.DONE ? 'outline' : 'default'}
                    onClick={() => onStatusChange(task, getNextStatus())}
                    className="flex-1"
                >
                    {getStatusButtonIcon()}
                    <span className="ml-1.5">{getStatusButtonLabel()}</span>
                </Button>
            </CardFooter>
        </Card>
    );
}
