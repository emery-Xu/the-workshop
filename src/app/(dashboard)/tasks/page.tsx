'use client';

import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/use-polling';
import { Task } from '@/types';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  done: { label: 'Done', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

const assigneeConfig = {
  zohan: { label: 'Zohan', color: 'bg-purple-500/20 text-purple-400' },
  jarvis: { label: 'Jarvis', color: 'bg-orange-500/20 text-orange-400' },
};

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

type TaskFormData = {
  title: string;
  description: string;
  status: Task['status'];
  assignee: Task['assignee'];
};

export default function TasksPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    assignee: 'jarvis',
  });

  const fetchTasks = useCallback(async () => {
    return await apiClient.get('/api/tasks');
  }, []);

  const { data, refetch } = usePolling(fetchTasks, 2000);
  const tasks = data || [];

  const resetForm = () => {
    setFormData({ title: '', description: '', status: 'todo', assignee: 'jarvis' });
    setEditingTask(null);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    if (editingTask) {
      await apiClient.put(`/api/tasks/${editingTask.id}`, { ...formData });
    } else {
      await apiClient.post('/api/tasks', {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleDelete = async (id: string) => {
    await apiClient.delete(`/api/tasks/${id}`);
    refetch();
  };

  const handleStatusChange = async (task: Task, status: Task['status']) => {
    await apiClient.put(`/api/tasks/${task.id}`, { ...task, status });
    refetch();
  };

  const groupedTasks = {
    todo: tasks.filter((t: Task) => t.status === 'todo'),
    'in-progress': tasks.filter((t: Task) => t.status === 'in-progress'),
    done: tasks.filter((t: Task) => t.status === 'done'),
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} total tasks</p>
        </div>
        <Button onClick={openNewDialog} size="sm">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </div>

      {/* Kanban columns */}
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(statusConfig) as Task['status'][]).map((status) => (
          <div key={status} className="rounded-lg border border-border bg-card/50 p-3">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="outline" className={cn('text-xs', statusConfig[status].color)}>
                {statusConfig[status].label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {groupedTasks[status].length}
              </span>
            </div>
            <div className="space-y-2">
              {groupedTasks[status].map((task: Task) => (
                <div
                  key={task.id}
                  className="group rounded-md border border-border bg-card p-3 transition-colors hover:border-border/80"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium leading-tight">{task.title}</h3>
                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditDialog(task)}
                      >
                        <PencilIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {task.description && (
                    <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className={cn('text-xs', assigneeConfig[task.assignee].color)}>
                      {assigneeConfig[task.assignee].label}
                    </Badge>
                    <Select
                      value={task.status}
                      onValueChange={(value) => handleStatusChange(task, value as Task['status'])}
                    >
                      <SelectTrigger className="h-6 w-auto gap-1 border-0 bg-transparent px-1 text-xs shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              {groupedTasks[status].length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Task description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignee</label>
                <Select
                  value={formData.assignee}
                  onValueChange={(value) => setFormData({ ...formData, assignee: value as Task['assignee'] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jarvis">Jarvis</SelectItem>
                    <SelectItem value="zohan">Zohan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingTask ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
