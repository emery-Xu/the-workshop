import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { Idea, IdeasData } from '@/types';
import { getDataPath, DATA_DIR } from '@/lib/config';

const DATA_PATH = getDataPath('ideas.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readIdeas(): Promise<IdeasData> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { ideas: [] };
  }
}

async function writeIdeas(data: IdeasData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await readIdeas();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = await readIdeas();

  const newIdea: Idea = {
    id: Date.now().toString(),
    title: body.title || '',
    description: body.description || '',
    category: body.category || 'other',
    createdAt: new Date().toISOString(),
  };

  data.ideas.push(newIdea);
  await writeIdeas(data);

  return NextResponse.json(newIdea, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const data = await readIdeas();

  const index = data.ideas.findIndex(i => i.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  data.ideas[index] = {
    ...data.ideas[index],
    ...body,
  };

  await writeIdeas(data);
  return NextResponse.json(data.ideas[index]);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const data = await readIdeas();
  data.ideas = data.ideas.filter(i => i.id !== id);
  await writeIdeas(data);

  return NextResponse.json({ success: true });
}
