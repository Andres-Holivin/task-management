import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TaskStatus, type CreateTaskDto } from '@/types/task';
import { DatePickerWithTime } from './DatePicker';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import moment from 'moment';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  pic: z.string().optional(),
  deadline: z
    .date()
    .optional()
    .refine(
      (date) => !date || moment(date).isSameOrAfter(moment()),
      { message: "Deadline cannot be in the past" }
    ),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: CreateTaskDto) => Promise<void>;
  onCancel?: () => void;
  defaultValues?: Partial<TaskFormData>;
  submitLabel?: string;
}

export function TaskForm({ onSubmit, onCancel, defaultValues, submitLabel = 'Create Task' }: Readonly<TaskFormProps>) {
  const {
    handleSubmit,
    formState: { isSubmitting },
    control,
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      pic: '',
      deadline: undefined,
      status: TaskStatus.TODO,
    },
  });

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Failed to submit task form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="title">
              Title<span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              {...field}
              id="title"
              aria-invalid={fieldState.invalid}
              placeholder="Enter task title"

            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea

              {...field}
              id="description"
              aria-invalid={fieldState.invalid}
              placeholder="Enter task description (optional)"
              rows={4}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <Controller
        name="pic"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="pic">Person In Charge</FieldLabel>
            <Input
              {...field}
              id="pic"
              aria-invalid={fieldState.invalid}
              placeholder="Enter person in charge (optional)"
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <Controller
        name="deadline"
        control={control}
        render={({ field: { value, onChange }, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
            <DatePickerWithTime
              disablePastDates
              defaultValue={value} onChange={onChange}
              placeholder='Pick a date (optional)'
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <Controller
        name="status"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label={fieldState.invalid ? 'Invalid status' : 'Status'} id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
              </SelectContent>
            </Select>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : submitLabel}
        </Button>
      </div>
    </form >
  );
}
