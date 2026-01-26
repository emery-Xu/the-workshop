'use client';

import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/use-polling';
import { Idea, IdeasData } from '@/types';
import { Button } from '@/components/ui/button';
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
  product: { label: 'Product', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
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

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}

type IdeaFormData = {
  content: string;
  category: Idea['category'];
};

export default function IdeasPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [formData, setFormData] = useState<IdeaFormData>({
    content: '',
    category: 'other',
  });
  const [filterCategory, setFilterCategory] = useState<Idea['category'] | 'all'>('all');

  const fetchIdeas = useCallback(async () => {
    const res = await fetch('/api/ideas');
    return res.json() as Promise<IdeasData>;
  }, []);

  const { data, refetch } = usePolling(fetchIdeas, 2000);
  const ideas = data?.ideas || [];

  const filteredIdeas = filterCategory === 'all'
    ? ideas
    : ideas.filter((idea) => idea.category === filterCategory);

  const resetForm = () => {
    setFormData({ content: '', category: 'other' });
    setEditingIdea(null);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (idea: Idea) => {
    setEditingIdea(idea);
    setFormData({
      content: idea.content,
      category: idea.category,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) return;

    if (editingIdea) {
      await fetch('/api/ideas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingIdea.id, ...formData }),
      });
    } else {
      await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }

    setDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/ideas?id=${id}`, { method: 'DELETE' });
    refetch();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ideas</h1>
          <p className="text-sm text-muted-foreground">{ideas.length} total ideas</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filterCategory}
            onValueChange={(value) => setFilterCategory(value as Idea['category'] | 'all')}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="tweet">Tweet</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openNewDialog} size="sm">
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Add Idea</span>
          </Button>
        </div>
      </div>

      {/* Ideas grid */}
      {filteredIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <LightbulbIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-1 text-sm font-medium">No ideas yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Capture your thoughts and inspiration
          </p>
          <Button variant="outline" size="sm" onClick={openNewDialog}>
            <PlusIcon className="h-4 w-4" />
            Add your first idea
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80"
            >
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => openEditDialog(idea)}
                >
                  <PencilIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(idea.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </div>
              <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed">
                {idea.content}
              </p>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn('text-xs', categoryConfig[idea.category].color)}
                >
                  {categoryConfig[idea.category].label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(idea.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIdea ? 'Edit Idea' : 'New Idea'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="What's on your mind?"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="resize-none"
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
            <Button onClick={handleSubmit}>{editingIdea ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
