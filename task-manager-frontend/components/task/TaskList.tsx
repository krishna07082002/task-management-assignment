/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Task } from '@/types';
import { format } from 'date-fns';
import EditTaskDialog from './EditTaskDialog';  // ✅ import add kiya

interface TaskListProps {
  search: string;
  status: 'all' | 'pending' | 'completed';
}

export default function TaskList({ search, status }: TaskListProps) {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);  // ✅
  const [editOpen, setEditOpen] = useState(false);                       // ✅

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', search, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      const res = await api.get(`/tasks?${params.toString()}`);
      if (res.data?.data?.tasks) return res.data.data.tasks;
      if (Array.isArray(res.data?.tasks)) return res.data.tasks;
      if (Array.isArray(res.data)) return res.data;
      return [];
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/tasks/${id}`, { status: 'completed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Task marked as completed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Task deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete task');
      console.error(error);
    },
  });

  // ✅ Edit handler
  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setEditOpen(true);
  };

  if (isLoading) return <div className="text-center py-12">Loading tasks...</div>;

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No tasks found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task: Task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-start gap-4">
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={() => {
                  if (task.status === 'pending') completeMutation.mutate(task.id);
                }}
                disabled={task.status === 'completed'}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    Due: {format(new Date(task.dueDate), 'PPP')}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {/* ✅ onClick handler add kiya */}
                <Button variant="ghost" size="sm" onClick={() => handleEditClick(task)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(task._id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Dialog render kiya */}
      <EditTaskDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        task={selectedTask}
      />
    </>
  );
}