import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { neondatabase } from '@neondatabase/serverless';

type Bindings = {
  DATABASE_URL: string;
  ADMIN_EMAIL: string;
  MASTER_PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.get('/api/health', (c) => {
  const isDbConnected = !!c.env.DATABASE_URL;
  return c.json({
    status: 'ok',
    mode: isDbConnected ? 'Cloudflare Worker (PostgreSQL)' : 'Cloudflare Worker (Mock)',
    connected: isDbConnected
  });
});

app.post('/api/auth/verify', async (c) => {
  const { password } = await c.req.json();
  const isOwner = password === c.env.MASTER_PASSWORD;
  return c.json({ isOwner });
});

app.get('/api/projects', async (c) => {
  try {
    if (!c.env.DATABASE_URL) return c.json([]);
    const sql = neondatabase({ connectionString: c.env.DATABASE_URL });
    const token = c.req.header('x-access-token');
    const ownerEmail = token === c.env.MASTER_PASSWORD ? c.env.ADMIN_EMAIL : 'visitor';
    
    const { rows } = await sql`
      SELECT * FROM projects
      WHERE owner_email = ${ownerEmail}
      ORDER BY created_at ASC
    `;
    return c.json(rows);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

app.post('/api/projects', async (c) => {
  try {
    if (!c.env.DATABASE_URL) return c.json({ error: 'No database' }, 500);
    const sql = neondatabase({ connectionString: c.env.DATABASE_URL });
    const { name, description, owner_email = c.env.ADMIN_EMAIL || 'visitor' } = await c.req.json();
    
    const { rows } = await sql`
      INSERT INTO projects (name, description, owner_email)
      VALUES (${name}, ${description ?? null}, ${owner_email})
      RETURNING *
    `;
    return c.json(rows[0], 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

app.put('/api/projects/:id', async (c) => {
  try {
    if (!c.env.DATABASE_URL) return c.json({ error: 'No database' }, 500);
    const sql = neondatabase({ connectionString: c.env.DATABASE_URL });
    const id = c.req.param('id');
    const { name, description } = await c.req.json();
    
    const { rows } = await sql`
      UPDATE projects
      SET name = ${name}, description = ${description ?? null}, updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    return c.json(rows[0]);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

app.delete('/api/projects/:id', async (c) => {
  try {
    if (!c.env.DATABASE_URL) return c.json({ error: 'No database' }, 500);
    const sql = neondatabase({ connectionString: c.env.DATABASE_URL });
    const id = c.req.param('id');
    await sql`DELETE FROM projects WHERE id = ${id}`;
    return c.body(null, 204);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

app.get('/api/tasks', async (c) => {
  try {
    if (!c.env.DATABASE_URL) return c.json([]);
    const sql = neondatabase({ connectionString: c.env.DATABASE_URL });
    const token = c.req.header('x-access-token');
    const ownerEmail = token === c.env.MASTER_PASSWORD ? c.env.ADMIN_EMAIL : 'visitor';
    const { project_id } = c.req.query();
    
    let rows;
    if (project_id) {
      ({ rows } = await sql`
        SELECT * FROM tasks
        WHERE project_id = ${project_id}
        ORDER BY created_at ASC
      `);
    } else {
      ({ rows } = await sql`
        SELECT * FROM tasks
        WHERE owner_email = ${ownerEmail}
        ORDER BY created_at ASC
      `);
    }
    return c.json(rows);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

app.post('/api/tasks', async (c) => {
  try {
    if (!c.env.DATABASE_URL) return c.json({ error: 'No database' }, 500);
    const sql = neondatabase({ connectionString: c.env.DATABASE_URL });
    const {
      title, description, status = 'todo',
      project_id, assignee, deadline,
      owner_email = c.env.ADMIN_EMAIL || 'visitor',
    } = await c.req.json();
    
    const { rows } = await sql`
      INSERT INTO tasks (title, description, status, project_id, assignee, deadline, owner_email)
      VALUES (
        ${title},
        ${description ?? null},
        ${status},
        ${project_id ?? null},
        ${assignee ?? null},
        ${deadline ?? null},
        ${owner_email}
      )
      RETURNING *
    `;
    return c.json(rows[0], 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

app.put('/api/tasks/:id', async (c) => {
  try {
    if (!c.env.DATABASE_URL) return c.json({ error: 'No database' }, 500);
    const sql = neondatabase({ connectionString: c.env.DATABASE_URL });
    const id = c.req.param('id');
    const {
      title, description, status,
      assignee, deadline,
      started_at, completed_at, completed_by, completion_summary,
    } = await c.req.json();

    const { rows } = await sql`
      UPDATE tasks SET
        title = COALESCE(${title ?? null}, title),
        description = COALESCE(${description ?? null}, description),
        status = COALESCE(${status ?? null}, status),
        assignee = COALESCE(${assignee ?? null}, assignee),
        deadline = COALESCE(${deadline ?? null}, deadline),
        started_at = COALESCE(${started_at ?? null}, started_at),
        completed_at = COALESCE(${completed_at ?? null}, completed_at),
        completed_by = COALESCE(${completed_by ?? null}, completed_by),
        completion_summary = COALESCE(${completion_summary ?? null}, completion_summary),
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    return c.json(rows[0]);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

app.delete('/api/tasks/:id', async (c) => {
  try {
    if (!c.env.DATABASE_URL) return c.json({ error: 'No database' }, 500);
    const sql = neondatabase({ connectionString: c.env.DATABASE_URL });
    const id = c.req.param('id');
    await sql`DELETE FROM tasks WHERE id = ${id}`;
    return c.body(null, 204);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

export default app;