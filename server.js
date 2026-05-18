import Database from 'better-sqlite3';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 8787);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pray_for_ukraine';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'pray_for_ukraine_admin_token';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.sqlite');

app.use(cors());
app.use(express.json());

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL,
    created_at TEXT NOT NULL,
    user_agent TEXT,
    ip TEXT,
visit_key TEXT
  );
`);

try {
  db.prepare('ALTER TABLE visits ADD COLUMN visit_key TEXT').run();
} catch {
  // Column already exists, so we can ignore this.
}

try {
  db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_visit_key ON visits(visit_key)').run();
} catch {
  // Index already exists, so we can ignore this.
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '').trim();

  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
}

app.post('/api/visit', (req, res) => {
  const rawPage = typeof req.body?.page === 'string' ? req.body.page : '/';
  const page = rawPage.split('#')[0] || '/';

  const visitId =
    typeof req.body?.visitId === 'string' && req.body.visitId.trim()
      ? req.body.visitId.trim()
      : null;

  const createdAt = new Date().toISOString();
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || '';

  const visitKey = visitId ? `${page}:${visitId}` : null;

  if (visitKey) {
    db.prepare(`
      INSERT OR IGNORE INTO visits (page, created_at, user_agent, ip, visit_key)
      VALUES (?, ?, ?, ?, ?)
    `).run(page, createdAt, userAgent, ip, visitKey);
  } else {
    db.prepare(`
      INSERT INTO visits (page, created_at, user_agent, ip, visit_key)
      VALUES (?, ?, ?, ?, ?)
    `).run(page, createdAt, userAgent, ip, null);
  }

  res.json({ ok: true });
});

app.post('/api/register', (req, res) => {
  const firstName = String(req.body?.firstName || '').trim();
  const lastName = String(req.body?.lastName || '').trim();

  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'First name and last name are required.' });
  }

  const createdAt = new Date().toISOString();
  const result = db.prepare('INSERT INTO registrations (first_name, last_name, created_at) VALUES (?, ?, ?)')
    .run(firstName, lastName, createdAt);

  res.json({ ok: true, id: result.lastInsertRowid });
});

app.post('/api/admin/login', (req, res) => {
  const password = String(req.body?.password || '');

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Wrong password' });
  }

  res.json({ ok: true, token: ADMIN_TOKEN });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const registrations = db.prepare(`
    SELECT id, first_name AS firstName, last_name AS lastName, created_at AS createdAt
    FROM registrations
    ORDER BY datetime(created_at) DESC
  `).all();

  const registeredCount = db.prepare('SELECT COUNT(*) AS count FROM registrations').get().count;
  const visitCount = db.prepare("SELECT COUNT(*) AS count FROM visits WHERE page = '/'").get().count;
  const adminVisitCount = db.prepare("SELECT COUNT(*) AS count FROM visits WHERE page = '/invitations/admin'").get().count;

  res.json({ registeredCount, visitCount, adminVisitCount, registrations });
});

app.get('/api/admin/export', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT id, first_name AS "First name", last_name AS "Last name", created_at AS "Registered at"
    FROM registrations
    ORDER BY datetime(created_at) DESC
  `).all();

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registered guests');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  res.setHeader('Content-Disposition', 'attachment; filename="registered-guests.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Prayer website server running on port ${PORT}`);
});
