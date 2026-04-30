import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

const app = new Hono();

// API routes
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', environment: 'Cloudflare Pages Functions' });
});

app.get('/api/me', (c) => {
  return c.json({ role: 'admin', isOwner: true });
});

// Add your database logic here using c.env.DATABASE_URL
// app.get('/api/projects', async (c) => { ... });

export const onRequest = handle(app);
