import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;


// Mock In-Memory storage for preview
const mockTasks: any[] = [
  { id: '1', title: 'Configurar Banco de Dados', description: 'Adicionar DATABASE_URL no menu Secrets', status: 'todo', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', title: 'Persistir Dados', description: 'Ative a persistência com Postgres para salvar suas tarefas', status: 'in_progress', createdAt: new Date(), updatedAt: new Date() },
];

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  // Database setup
  const dbUrl = process.env.DATABASE_URL;
  let db: any = null;

  if (dbUrl) {
    try {
      const client = postgres(dbUrl);
      db = drizzle(client, { schema });
      
      // Garantir extensão e tabela
      await client`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await client`
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'todo',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `;
      
      console.log("✅ Conectado ao Neon e Banco de Dados pronto.");
    } catch (err) {
      console.error("❌ Falha na conexão ou criação da tabela:", (err as Error).message);
      db = null;
    }
  } else {
    console.warn("⚠️ DATABASE_URL is missing. API will return mock data or errors.");
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      connected: !!db,
      mode: db ? "PostgreSQL" : "Mock In-Memory"
    });
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      if (!db) return res.json([...mockTasks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      const allTasks = await db.select().from(schema.tasks).orderBy(desc(schema.tasks.createdAt));
      res.json(allTasks);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      if (!db) {
        const newTask = {
          ...req.body,
          id: Math.random().toString(36).substring(7),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockTasks.push(newTask);
        return res.json(newTask);
      }
      const { title, description, status } = req.body;
      const [newTask] = await db.insert(schema.tasks).values({ title, description, status }).returning();
      res.json(newTask);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      if (!db) {
        const idx = mockTasks.findIndex(t => t.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: "Not found" });
        mockTasks[idx] = { ...mockTasks[idx], ...req.body, updatedAt: new Date() };
        return res.json(mockTasks[idx]);
      }
      const { title, description, status } = req.body;
      const [updatedTask] = await db.update(schema.tasks)
        .set({ title, description, status, updatedAt: new Date() })
        .where(eq(schema.tasks.id, req.params.id))
        .returning();
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      if (!db) {
        const idx = mockTasks.findIndex(t => t.id === req.params.id);
        if (idx !== -1) mockTasks.splice(idx, 1);
        return res.json({ success: true });
      }
      await db.delete(schema.tasks).where(eq(schema.tasks.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
