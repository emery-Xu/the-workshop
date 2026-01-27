const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 设置（允许 Vercel 访问）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 读取数据文件的辅助函数
const readData = (file) => {
  try {
    const dataPath = path.join(__dirname, 'data', file);
    if (!fs.existsSync(dataPath)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return [];
  }
};

// 写入数据文件的辅助函数
const writeData = (file, data) => {
  try {
    const dataPath = path.join(__dirname, 'data', file);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${file}:`, error);
    return false;
  }
};

// API Routes

// Tasks
app.get('/api/tasks', (req, res) => {
  res.json(readData('tasks.json'));
});

app.post('/api/tasks', (req, res) => {
  const data = readData('tasks.json');
  const newTask = req.body;
  data.push(newTask);
  writeData('tasks.json', data);
  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const data = readData('tasks.json');
  const index = data.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    data[index] = req.body;
    writeData('tasks.json', data);
    res.json(req.body);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const data = readData('tasks.json');
  const filtered = data.filter(t => t.id !== req.params.id);
  writeData('tasks.json', filtered);
  res.json({ success: true });
});

// Ideas
app.get('/api/ideas', (req, res) => {
  res.json(readData('ideas.json'));
});

app.post('/api/ideas', (req, res) => {
  const data = readData('ideas.json');
  const newIdea = req.body;
  data.push(newIdea);
  writeData('ideas.json', data);
  res.json(newIdea);
});

app.delete('/api/ideas/:id', (req, res) => {
  const data = readData('ideas.json');
  const filtered = data.filter(i => i.id !== req.params.id);
  writeData('ideas.json', filtered);
  res.json({ success: true });
});

// Drafts
app.get('/api/drafts', (req, res) => {
  res.json(readData('drafts.json'));
});

app.post('/api/drafts', (req, res) => {
  const data = readData('drafts.json');
  const newDraft = req.body;
  data.push(newDraft);
  writeData('drafts.json', data);
  res.json(newDraft);
});

app.put('/api/drafts/:id', (req, res) => {
  const data = readData('drafts.json');
  const index = data.findIndex(d => d.id === req.params.id);
  if (index !== -1) {
    data[index] = req.body;
    writeData('drafts.json', data);
    res.json(req.body);
  } else {
    res.status(404).json({ error: 'Draft not found' });
  }
});

app.delete('/api/drafts/:id', (req, res) => {
  const data = readData('drafts.json');
  const filtered = data.filter(d => d.id !== req.params.id);
  writeData('drafts.json', filtered);
  res.json({ success: true });
});

// Notes
app.get('/api/notes', (req, res) => {
  res.json(readData('notes.json'));
});

app.post('/api/notes', (req, res) => {
  const data = readData('notes.json');
  const newNote = req.body;
  data.push(newNote);
  writeData('notes.json', data);
  res.json(newNote);
});

app.put('/api/notes/:id', (req, res) => {
  const data = readData('notes.json');
  const index = data.findIndex(n => n.id === req.params.id);
  if (index !== -1) {
    data[index] = req.body;
    writeData('notes.json', data);
    res.json(req.body);
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  const data = readData('notes.json');
  const filtered = data.filter(n => n.id !== req.params.id);
  writeData('notes.json', filtered);
  res.json({ success: true });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
