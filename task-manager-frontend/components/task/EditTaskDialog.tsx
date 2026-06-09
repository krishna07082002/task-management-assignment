'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AxiosError } from 'axios';          // ✅ any ki jagah proper type
import api from '@/lib/api';
import { Task } from '@/types';

interface UpdateTaskPayload {               // ✅ any ki jagah interface
  title: string;
  description: string;
  dueDate?: string;
  status: 'pending' | 'completed';
}

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

// ✅ Inner form component — key prop se re-mount hoga, useEffect ki zarurat nahi
function EditTaskForm({
  task,
  onOpenChange,
}: {
  task: Task;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [status, setStatus] = useState<'pending' | 'completed'>(task.status);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updatedTask: UpdateTaskPayload) => {  // ✅ typed
      const res = await api.patch(`/tasks/${task._id}`, updatedTask);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Task updated successfully!');
      onOpenChange(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {  // ✅ typed
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    updateMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || undefined,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex gap-2">
          <Button type="button" variant={status === 'pending' ? 'default' : 'outline'} onClick={() => setStatus('pending')}>Pending</Button>
          <Button type="button" variant={status === 'completed' ? 'default' : 'outline'} onClick={() => setStatus('completed')}>Completed</Button>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Updating...' : 'Update Task'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function EditTaskDialog({ open, onOpenChange, task }: EditTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update your task details</DialogDescription>
        </DialogHeader>
        {/* ✅ key={task.id} — har naye task pe fresh state milega, useEffect nahi chahiye */}
        {task && <EditTaskForm key={task.id} task={task} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}