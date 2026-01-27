'use client';

import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/use-polling';
import { Note } from '@/types';
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

type NoteFormData = {
  title: string;
  content: string;
};

export default function NotesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
  });

  const fetchNotes = useCallback(async () => {
    return await apiClient.get('/api/notes');
  }, []);

  const { data, refetch } = usePolling(fetchNotes, 2000);
  const notes = data || [];

  const resetForm = () => {
    setFormData({ title: '', content: '' });
    setEditingNote(null);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    if (editingNote) {
      await apiClient.put(`/api/notes/${editingNote.id}`, formData);
    } else {
      await apiClient.post('/api/notes', {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
    }

    setDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleDelete = async (id: string) => {
    await apiClient.delete(`/api/notes/${id}`);
    refetch();
  };

  const filteredNotes = notes.filter((note: Note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">{notes.length} notes</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={openNewDialog} size="sm">
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Add Note</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filteredNotes.map((note: Note) => (
          <div
            key={note.id}
            className="group rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-border/80"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium flex-1">{note.title}</h3>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => openEditDialog(note)}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(note.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-4">{note.content}</p>
            {note.createdAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
        {filteredNotes.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            {searchTerm ? 'No notes match your search.' : 'No notes yet. Create your first note!'}
          </p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit Note' : 'New Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Note title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Note content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingNote ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
