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
import EditTaskDialog from '../../EditTaskDialog';

interface TaskListProps {
  search: string;
  status: 'all' | 'pending' | 'completed';
}

export default function TaskList({ search, status }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', search, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);

      const res = await api.get(`/tasks?${params.toString()}`);
      return res.data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/tasks/${id}`, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Task completed!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Task deleted');
    },
  });

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowEditDialog(true);
  };

  if (isLoading) return <div className="text-center py-12">Loading tasks...</div>;

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          No tasks found. Create a new task to get started!
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task: Task) => (
          <Card key={task.id} className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-start gap-4">
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={() => task.status === 'pending' && completeMutation.mutate(task.id)}
              />

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  <Badge variant={task.status === 'completed' ? "default" : "secondary"}>
                    {task.status}
                  </Badge>
                </div>

                {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}

                {task.dueDate && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due: {format(new Date(task.dueDate), 'dd MMM yyyy')}
                  </p>
                )}
              </div>

              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(task.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditTaskDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        task={editingTask}
      />
    </>
  );
}