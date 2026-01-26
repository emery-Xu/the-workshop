import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { Note, NotesData } from '@/types';
import { getDataPath, DATA_DIR } from '@/lib/config';

const DATA_PATH = getDataPath('notes.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readNotes(): Promise<NotesData> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { notes: [] };
  }
}

async function writeNotes(data: NotesData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await readNotes();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = await readNotes();

  const newNote: Note = {
    id: Date.now().toString(),
    title: body.title,
    content: body.content || '',
    date: body.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  data.notes.push(newNote);
  await writeNotes(data);

  return NextResponse.json(newNote, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const data = await readNotes();

  const index = data.notes.findIndex(n => n.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  data.notes[index] = {
    ...data.notes[index],
    ...body,
  };

  await writeNotes(data);
  return NextResponse.json(data.notes[index]);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const data = await readNotes();
  data.notes = data.notes.filter(n => n.id !== id);
  await writeNotes(data);

  return NextResponse.json({ success: true });
}
