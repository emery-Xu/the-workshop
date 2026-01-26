'use client';

import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/use-polling';
import { Learning, LearningsData } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  unread: { label: 'Unread', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  reading: { label: 'Reading', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  done: { label: 'Done', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
};

const categoryConfig = {
  ai: { label: 'AI', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  crypto: { label: 'Crypto', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  marketing: { label: 'Marketing', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  product: { label: 'Product', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  other: { label: 'Other', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
};

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function LearnPage() {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingLearning, setViewingLearning] = useState<Learning | null>(null);
  const [filterStatus, setFilterStatus] = useState<Learning['status'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<Learning['category'] | 'all'>('all');

  const fetchLearnings = useCallback(async () => {
    const res = await fetch('/api/learnings');
    return res.json() as Promise<LearningsData>;
  }, []);

  const { data, refetch } = usePolling(fetchLearnings, 2000);
  const learnings = data?.learnings || [];

  const filteredLearnings = learnings.filter((l) => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (filterCategory !== 'all' && l.category !== filterCategory) return false;
    return true;
  });

  const openViewDialog = (learning: Learning) => {
    setViewingLearning(learning);
    setViewDialogOpen(true);
  };

  const handleStatusChange = async (learning: Learning, newStatus: Learning['status']) => {
    await fetch('/api/learnings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: learning.id, status: newStatus }),
    });
    if (viewingLearning?.id === learning.id) {
      setViewingLearning({ ...viewingLearning, status: newStatus });
    }
    refetch();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/learnings?id=${id}`, { method: 'DELETE' });
    setViewDialogOpen(false);
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

  const unreadCount = learnings.filter(l => l.status === 'unread').length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Learning</h1>
          <p className="text-sm text-muted-foreground">
            {learnings.length} items {unreadCount > 0 && `• ${unreadCount} unread`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as Learning['status'] | 'all')}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="reading">Reading</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterCategory}
            onValueChange={(value) => setFilterCategory(value as Learning['category'] | 'all')}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ai">AI</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Learnings list */}
      {filteredLearnings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <BookIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-1 text-sm font-medium">No learnings yet</h3>
          <p className="mb-4 text-center text-sm text-muted-foreground max-w-xs">
            Bookmark tweets on Twitter and Jarvis will analyze them for you
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLearnings.map((learning) => (
            <div
              key={learning.id}
              onClick={() => openViewDialog(learning)}
              className={cn(
                "group relative cursor-pointer rounded-lg border border-border bg-card p-3 transition-colors hover:border-border/80 hover:bg-accent/50",
                learning.status === 'unread' && "border-l-2 border-l-amber-500"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-1">{learning.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    @{learning.authorHandle} • {learning.keyPoints.length} key points
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn('text-xs', categoryConfig[learning.category].color)}
                  >
                    {categoryConfig[learning.category].label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', statusConfig[learning.status].color)}
                  >
                    {statusConfig[learning.status].label}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              Learning
              {viewingLearning && (
                <>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', categoryConfig[viewingLearning.category].color)}
                  >
                    {categoryConfig[viewingLearning.category].label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', statusConfig[viewingLearning.status].color)}
                  >
                    {statusConfig[viewingLearning.status].label}
                  </Badge>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {viewingLearning && (
            <>
              <div className="flex-1 overflow-auto py-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{viewingLearning.summary}</h3>
                  <p className="text-sm text-muted-foreground">
                    by @{viewingLearning.authorHandle} ({viewingLearning.author})
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Key Points</h4>
                  <ul className="space-y-2">
                    {viewingLearning.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Original Tweet</h4>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                      {viewingLearning.originalContent}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="shrink-0 border-t border-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(viewingLearning.createdAt)}
                  </span>
                  <Select
                    value={viewingLearning.status}
                    onValueChange={(value) => handleStatusChange(viewingLearning, value as Learning['status'])}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(viewingLearning.tweetUrl, '_blank')}
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    View Tweet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(viewingLearning.id)}
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
    </div>
  );
}
