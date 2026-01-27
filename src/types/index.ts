export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee: 'zohan' | 'jarvis';
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: 'tweet' | 'product' | 'other';
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
}

export interface TasksData {
  tasks: Task[];
}

export interface IdeasData {
  ideas: Idea[];
}

export interface NotesData {
  notes: Note[];
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'ready' | 'posted';
  author: 'zohan' | 'jarvis';
  createdAt: string;
  updatedAt: string;
}

export interface DraftsData {
  drafts: Draft[];
}

export interface Learning {
  id: string;
  tweetId: string;
  tweetUrl: string;
  author: string;
  authorHandle: string;
  originalContent: string;
  summary: string;
  keyPoints: string[];
  category: 'ai' | 'crypto' | 'marketing' | 'product' | 'other';
  status: 'unread' | 'reading' | 'done';
  createdAt: string;
  updatedAt: string;
}

export interface LearningsData {
  learnings: Learning[];
  lastCheckedBookmarkId?: string;
}
