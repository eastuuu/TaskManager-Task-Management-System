import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Database Setup (SQLite)
const db = new Database('tasks.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    isCompleted INTEGER DEFAULT 0,
    createdDate TEXT NOT NULL
  )
`);

// API Routes
const router = express.Router();

// GET /api/tasks
router.get('/tasks', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY createdDate DESC');
    const tasks = stmt.all().map((task: any) => ({
      ...task,
      isCompleted: !!task.isCompleted // Convert 0/1 to boolean
    }));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/{id}
router.get('/tasks/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(req.params.id) as any;
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      ...task,
      isCompleted: !!task.isCompleted
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /api/tasks
router.post('/tasks', (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const createdDate = new Date().toISOString();
    const stmt = db.prepare('INSERT INTO tasks (title, isCompleted, createdDate) VALUES (?, 0, ?)');
    const info = stmt.run(title.trim(), createdDate);

    const newTask = {
      id: info.lastInsertRowid,
      title: title.trim(),
      isCompleted: false,
      createdDate
    };

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/{id}
router.put('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, isCompleted } = req.body;

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Dynamic update
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (isCompleted !== undefined) {
      updates.push('isCompleted = ?');
      values.push(isCompleted ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.json({ ...existingTask, isCompleted: !!(existingTask as any).isCompleted });
    }

    values.push(id);
    const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;
    res.json({
      ...updatedTask,
      isCompleted: !!updatedTask.isCompleted
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/{id}
router.delete('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.use('/api', router);

// Vite Middleware
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
