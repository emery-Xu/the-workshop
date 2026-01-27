'use client';

import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/use-polling';
import { Idea } from '@/types';
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

const categoryConfig = {
  tweet: { label: 'Tweet', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  product: { label: 'Product', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  other: { label: 'Other', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
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

type IdeaFormData = {
  title: string;
  description: string;
  category: Idea['category'];
};

export default function IdeasPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    description: '',
    category: 'other',
  });

  const fetchIdeas = useCallback(async () => {
    return await apiClient.get('/api/ideas');
  }, []);

  const { data, refetch } = usePolling(fetchIdeas, 2000);
  const ideas = data || [];

  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'other' });
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    await apiClient.post('/api/ideas', {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });

    setDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleDelete = async (id: string) => {
    await apiClient.delete(`/api/ideas/${id}`);
    refetch();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ideas</h1>
          <p className="text-sm text-muted-foreground">{ideas.length} ideas captured</p>
        </div>
        <Button onClick={openNewDialog} size="sm">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Add Idea</span>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea: Idea) => (
          <div
            key={idea.id}
            className="group rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-border/80"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <Badge variant="outline" className={cn('text-xs', categoryConfig[idea.category].color)}>
                {categoryConfig[idea.category].label}
              </Badge>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleDelete(idea.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <TrashIcon className="h-3 w-3 text-destructive" />
              </Button>
            </div>
            <h3 className="mb-2 text-sm font-medium">{idea.title}</h3>
            {idea.description && (
              <p className="text-xs text-muted-foreground line-clamp-3">{idea.description}</p>
            )}
          </div>
        ))}
        {ideas.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            No ideas yet. Capture your first idea!
          </p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Idea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Idea title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Idea description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Idea['category'] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tweet">Tweet</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
