import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback-secret-change-me';
const JWT_EXPIRES = '30d';

// ── Helpers ──────────────────────────────────────────────────────────

function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function userResponse(user: { _id: any; name: string; email: string; avatar?: string | null }) {
  return { id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar ?? null };
}

// ── Register ─────────────────────────────────────────────────────────

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password: hashed });

  const token = generateToken(user._id.toString(), user.email);
  res.status(201).json({ token, user: userResponse(user) });
}

// ── Login ────────────────────────────────────────────────────────────

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user || !user.password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user._id.toString(), user.email);
  res.json({ token, user: userResponse(user) });
}

// ── Google OAuth ──────────────────────────────────────────────────────

export async function googleAuth(req: Request, res: Response) {
  const { accessToken } = req.body as { accessToken?: string };
  if (!accessToken) return res.status(400).json({ error: 'Google access token required' });

  let googleUser: { id: string; email: string; name: string; picture: string };
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) throw new Error();
    const d = await r.json() as any;
    googleUser = { id: d.sub, email: d.email, name: d.name, picture: d.picture };
  } catch {
    return res.status(401).json({ error: 'Could not verify Google account' });
  }

  let user = await User.findOne({ googleId: googleUser.id });

  if (!user) {
    user = await User.findOne({ email: googleUser.email.toLowerCase() });
    if (user) {
      user.googleId = googleUser.id;
      user.avatar = googleUser.picture;
      await user.save();
    } else {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.id,
        avatar: googleUser.picture,
      });
    }
  }

  const token = generateToken(user._id.toString(), user.email);
  res.json({ token, user: userResponse(user) });
}

// ── Auth middleware ───────────────────────────────────────────────────

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: string; email: string };
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
