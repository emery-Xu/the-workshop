import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { Draft, DraftsData } from '@/types';
import { getDataPath, DATA_DIR } from '@/lib/config';

const DATA_PATH = getDataPath('drafts.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readDrafts(): Promise<DraftsData> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { drafts: [] };
  }
}

async function writeDrafts(data: DraftsData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await readDrafts();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = await readDrafts();

  const newDraft: Draft = {
    id: Date.now().toString(),
    content: body.content,
    status: body.status || 'draft',
    author: body.author || 'jarvis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.drafts.unshift(newDraft);
  await writeDrafts(data);

  return NextResponse.json(newDraft, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const data = await readDrafts();

  const index = data.drafts.findIndex(d => d.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  data.drafts[index] = {
    ...data.drafts[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  await writeDrafts(data);
  return NextResponse.json(data.drafts[index]);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const data = await readDrafts();
  data.drafts = data.drafts.filter(d => d.id !== id);
  await writeDrafts(data);

  return NextResponse.json({ success: true });
}
