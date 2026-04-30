import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';

type Bindings = {
  DATABASE_URL: string;
  ADMIN_EMAIL: string;
  MASTER_PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

// Health check
app.get('/api/health', (c) => {
  const isDbConnected = !!c.env.DATABASE_URL;
  return c.json({
    status: 'ok',
    mode: isDbConnected ? 'Cloudflare Worker (PostgreSQL)' : 'Cloudflare Worker (Mock)',
    connected: isDbConnected
  });
});

// User info
app.get('/api/me', (c) => {
  const token = c.req.header('x-access-token');
  const isAdmin = token === c.env.MASTER_PASSWORD;
  return c.json({
    isOwner: isAdmin,
    role: isAdmin ? 'admin' : 'visitor'
  });
});

// Generic Fetch helper for DB or Mock
const getDb = (env: Bindings) => {
  if (!env.DATABASE_URL) return null;
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
};

// Projects API
app.get('/api/projects', async (c) => {
  const db = getDb(c.env);
  const token = c.req.header('x-access-token');
  const ownerEmail = token === c.env.MASTER_PASSWORD ? c.env.ADMIN_EMAIL : 'visitor';

  if (!db) {
    // Return empty or mock for now
    return c.json([]);
  }

  try {
    // Note: You might need to import 'eq' and others from drizzle-orm
    return c.json({ message: "Connected to Cloudflare Worker Database" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// This worker will also serve the static files if deployed to Pages
// Cloudflare handles the static assets automatically if specified in wrangler.toml

export default app;
