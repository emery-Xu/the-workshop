'use client';

import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/use-polling';
import { Draft, DraftsData } from '@/types';
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

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  ready: { label: 'Ready', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  posted: { label: 'Posted', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
};

const authorConfig = {
  zohan: { label: '佐哥', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  jarvis: { label: 'Jarvis', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
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

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

type DraftFormData = {
  content: string;
  status: Draft['status'];
  author: Draft['author'];
};

export default function DraftsPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [viewingDraft, setViewingDraft] = useState<Draft | null>(null);
  const [formData, setFormData] = useState<DraftFormData>({
    content: '',
    status: 'draft',
    author: 'jarvis',
  });
  const [filterStatus, setFilterStatus] = useState<Draft['status'] | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    const res = await fetch('/api/drafts');
    return res.json() as Promise<DraftsData>;
  }, []);

  const { data, refetch } = usePolling(fetchDrafts, 2000);
  const drafts = data?.drafts || [];

  const filteredDrafts = filterStatus === 'all'
    ? drafts
    : drafts.filter((draft) => draft.status === filterStatus);

  const resetForm = () => {
    setFormData({ content: '', status: 'draft', author: 'jarvis' });
    setEditingDraft(null);
  };

  const openNewDialog = () => {
    resetForm();
    setEditDialogOpen(true);
  };

  const openEditDialog = (draft: Draft) => {
    setEditingDraft(draft);
    setFormData({
      content: draft.content,
      status: draft.status,
      author: draft.author,
    });
    setViewDialogOpen(false);
    setEditDialogOpen(true);
  };

  const openViewDialog = (draft: Draft) => {
    setViewingDraft(draft);
    setViewDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) return;

    if (editingDraft) {
      await fetch('/api/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingDraft.id, ...formData }),
      });
    } else {
      await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }

    setEditDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/drafts?id=${id}`, { method: 'DELETE' });
    setViewDialogOpen(false);
    refetch();
  };

  const handleCopy = async (draft: Draft, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(draft.content);
    setCopiedId(draft.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (draft: Draft, newStatus: Draft['status']) => {
    await fetch('/api/drafts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: draft.id, status: newStatus }),
    });
    refetch();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCharCount = (content: string) => {
    return content.length;
  };

  const getPreview = (content: string, maxLines: number = 3) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const preview = lines.slice(0, maxLines).join('\n');
    const hasMore = lines.length > maxLines || content.length > 150;
    return {
      text: preview.length > 150 ? preview.slice(0, 150) + '...' : preview + (hasMore ? '...' : ''),
      hasMore,
    };
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tweet Drafts</h1>
          <p className="text-sm text-muted-foreground">{drafts.length} total drafts</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as Draft['status'] | 'all')}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openNewDialog} size="sm">
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">New Draft</span>
          </Button>
        </div>
      </div>

      {/* Drafts list - Preview mode */}
      {filteredDrafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <DocumentIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-1 text-sm font-medium">No drafts yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Save your tweet ideas here
          </p>
          <Button variant="outline" size="sm" onClick={openNewDialog}>
            <PlusIcon className="h-4 w-4" />
            Create first draft
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDrafts.map((draft) => {
            const preview = getPreview(draft.content);
            return (
              <div
                key={draft.id}
                onClick={() => openViewDialog(draft)}
                className="group relative cursor-pointer rounded-lg border border-border bg-card p-3 transition-colors hover:border-border/80 hover:bg-accent/50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed text-foreground/90 line-clamp-2">
                      {preview.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={cn('text-xs', statusConfig[draft.status].color)}
                    >
                      {statusConfig[draft.status].label}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge
                    variant="outline"
                    className={cn('text-xs', authorConfig[draft.author].color)}
                  >
                    {authorConfig[draft.author].label}
                  </Badge>
                  <span>{getCharCount(draft.content)} chars</span>
                  <span className="ml-auto">{formatDate(draft.updatedAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Dialog - Full content */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              Draft
              {viewingDraft && (
                <Badge
                  variant="outline"
                  className={cn('text-xs', statusConfig[viewingDraft.status].color)}
                >
                  {statusConfig[viewingDraft.status].label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {viewingDraft && (
            <>
              <div className="flex-1 overflow-auto py-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {viewingDraft.content}
                </pre>
              </div>
              
              <div className="shrink-0 border-t border-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className={cn('text-xs', authorConfig[viewingDraft.author].color)}
                    >
                      {authorConfig[viewingDraft.author].label}
                    </Badge>
                    <span>{getCharCount(viewingDraft.content)} chars</span>
                    <span>•</span>
                    <span>{formatDate(viewingDraft.updatedAt)}</span>
                  </div>
                  <Select
                    value={viewingDraft.status}
                    onValueChange={(value) => {
                      handleStatusChange(viewingDraft, value as Draft['status']);
                      setViewingDraft({ ...viewingDraft, status: value as Draft['status'] });
                    }}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(viewingDraft)}
                    className={copiedId === viewingDraft.id ? 'text-emerald-400' : ''}
                  >
                    {copiedId === viewingDraft.id ? (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(viewingDraft)}
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(viewingDraft.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDraft ? 'Edit Draft' : 'New Draft'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Content</label>
                <span className="text-xs text-muted-foreground">
                  {getCharCount(formData.content)} / 280 chars
                </span>
              </div>
              <Textarea
                placeholder="What's happening?"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="resize-none font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Draft['status'] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Author</label>
                <Select
                  value={formData.author}
                  onValueChange={(value) => setFormData({ ...formData, author: value as Draft['author'] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jarvis">Jarvis</SelectItem>
                    <SelectItem value="zohan">佐哥</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingDraft ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
