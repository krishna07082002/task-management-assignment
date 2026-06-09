'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import TaskList from '@/components/task/TaskList';
import CreateTaskDialog from '@/components/task/CreateTaskDialog';
import { Plus, LogOut, Search } from 'lucide-react';
import { TaskStats } from '@/types';
import api from '@/lib/api';           // ← Import api
import Cookies from 'js-cookie';       // ← For enabled check

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: user } = useCurrentUser();
  const logout = useLogout();

  // Fetch Stats using api (with automatic token)
  const { data: stats } = useQuery({
    queryKey: ['task-stats'],
    queryFn: async () => {
      const res = await api.get('/tasks/stats');
     return res.data.data as TaskStats;
    },
    enabled: !!Cookies.get('accessToken'),   // Only fetch if token exists
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Task Manager</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
<p className="text-4xl font-bold">{stats?.total || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">{stats?.completed  || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-orange-600">{stats?.pending || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-600">Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">
                {stats?.completionPercentage || 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Header + Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-3xl font-semibold">My Tasks</h2>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'completed'] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? "default" : "outline"}
              onClick={() => setStatusFilter(filter)}
              className="capitalize"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Task List */}
        <TaskList search={search} status={statusFilter} />
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}