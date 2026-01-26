import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { Learning, LearningsData } from '@/types';
import { getDataPath, DATA_DIR } from '@/lib/config';

const DATA_PATH = getDataPath('learnings.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readLearnings(): Promise<LearningsData> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { learnings: [], lastCheckedBookmarkId: undefined };
  }
}

async function writeLearnings(data: LearningsData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await readLearnings();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = await readLearnings();

  const newLearning: Learning = {
    id: Date.now().toString(),
    tweetId: body.tweetId,
    tweetUrl: body.tweetUrl,
    author: body.author,
    authorHandle: body.authorHandle,
    originalContent: body.originalContent,
    summary: body.summary,
    keyPoints: body.keyPoints || [],
    category: body.category || 'other',
    status: body.status || 'unread',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.learnings.unshift(newLearning);
  
  if (body.lastCheckedBookmarkId) {
    data.lastCheckedBookmarkId = body.lastCheckedBookmarkId;
  }
  
  await writeLearnings(data);

  return NextResponse.json(newLearning, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const data = await readLearnings();

  if (body.lastCheckedBookmarkId !== undefined) {
    data.lastCheckedBookmarkId = body.lastCheckedBookmarkId;
    await writeLearnings(data);
    return NextResponse.json({ success: true, lastCheckedBookmarkId: body.lastCheckedBookmarkId });
  }

  const index = data.learnings.findIndex(l => l.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Learning not found' }, { status: 404 });
  }

  data.learnings[index] = {
    ...data.learnings[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  await writeLearnings(data);
  return NextResponse.json(data.learnings[index]);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const data = await readLearnings();
  data.learnings = data.learnings.filter(l => l.id !== id);
  await writeLearnings(data);

  return NextResponse.json({ success: true });
}
