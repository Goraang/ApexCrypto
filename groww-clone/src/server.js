// server.js — ApexCrypto Authentication Backend
// Run: node server.js  (or: nodemon server.js)
// Requires: npm install express cors bcryptjs jsonwebtoken dotenv

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'apex_super_secret_key_change_in_production';
const JWT_EXPIRES_IN = '24h';

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── In-memory user store (replace with a real DB like MongoDB/PostgreSQL) ───
// Passwords are hashed with bcrypt. To generate a new hash:
//   node -e "const b=require('bcryptjs'); console.log(b.hashSync('yourpassword', 10))"
const USERS = [
  {
    id: 1,
    name: 'Goraang Nayyar',
    email: 'goraang@apexcrypto.io',
    role: 'admin',
    // Default password: Admin@123
    passwordHash: bcrypt.hashSync('Admin@123', 10),
    avatar: 'GN',
  },
  {
    id: 2,
    name: 'Demo User',
    email: 'demo@apexcrypto.io',
    role: 'viewer',
    // Default password: Demo@123
    passwordHash: bcrypt.hashSync('Demo@123', 10),
    avatar: 'DU',
  },
];

// ── Middleware: verify JWT ───────────────────────────────────────────────────
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Routes ───────────────────────────────────────────────────────────────────

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// GET /api/auth/me  — verify token & return current user
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout  — client simply discards the token; this is a no-op
app.post('/api/auth/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  ApexCrypto Auth Server running on http://localhost:${PORT}`);
  console.log(`\n📋  Test credentials:`);
  console.log(`    Admin  →  goraang@apexcrypto.io  /  Admin@123`);
  console.log(`    Viewer →  demo@apexcrypto.io     /  Demo@123\n`);
});