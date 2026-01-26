import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { Task, TasksData } from '@/types';
import { getDataPath, DATA_DIR } from '@/lib/config';

const DATA_PATH = getDataPath('tasks.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readTasks(): Promise<TasksData> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { tasks: [] };
  }
}

async function writeTasks(data: TasksData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await readTasks();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = await readTasks();

  const newTask: Task = {
    id: Date.now().toString(),
    title: body.title,
    description: body.description || '',
    status: body.status || 'todo',
    assignee: body.assignee || 'jarvis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.tasks.push(newTask);
  await writeTasks(data);

  return NextResponse.json(newTask, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const data = await readTasks();

  const index = data.tasks.findIndex(t => t.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  data.tasks[index] = {
    ...data.tasks[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  await writeTasks(data);
  return NextResponse.json(data.tasks[index]);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const data = await readTasks();
  data.tasks = data.tasks.filter(t => t.id !== id);
  await writeTasks(data);

  return NextResponse.json({ success: true });
}
