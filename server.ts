import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/db/schema.ts';
import { eq, desc, ne, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;


// Mock In-Memory storage for preview
const mockProjects: any[] = [
  { id: 'p1', name: 'Desenvolvimento Web', description: 'Projeto principal de branding e site', createdAt: new Date(), updatedAt: new Date() },
  { id: 'p2', name: 'Mobile App', description: 'Nova aplicação iOS/Android', createdAt: new Date(), updatedAt: new Date() },
];

const mockTasks: any[] = [
  { 
    id: '1', 
    projectId: 'p1',
    title: 'Configurar Banco de Dados', 
    description: 'Adicionar DATABASE_URL no menu Secrets', 
    status: 'todo', 
    assignee: 'Alex',
    deadline: new Date(Date.now() + 86400000 * 2), // 2 days from now
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: '2', 
    projectId: 'p1',
    title: 'Persistir Dados', 
    description: 'Ative a persistência com Postgres', 
    status: 'in_progress', 
    assignee: 'Sofia',
    startedAt: new Date(),
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
];

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const ADMIN_EMAIL = 'gchiposche@gmail.com';
  const MASTER_PASSWORD = process.env.MASTER_PASSWORD || '123';

  // Database setup
  const dbUrl = process.env.DATABASE_URL;
  let db: any = null;

  if (dbUrl) {
    try {
      const client = postgres(dbUrl);
      db = drizzle(client, { schema });
      
      // Garantir extensão e tabelas
      await client`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      
      await client`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `;

      // Atualizar tabela projects se necessário
      await client`ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;`;

      await client`
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'todo',
          assignee TEXT,
          deadline TIMESTAMP,
          started_at TIMESTAMP,
          completed_at TIMESTAMP,
          completed_by TEXT,
          completion_summary TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `;

      // Garantir colunas novas na tabela tasks (Migração manual para preview)
      await client`ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_email TEXT NOT NULL DEFAULT 'visitor';`;
      await client`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS owner_email TEXT NOT NULL DEFAULT 'visitor';`;
      await client`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id UUID;`;
      
      // Adicionar constraint de cascata se não existir
      try {
        await client`
          ALTER TABLE tasks 
          ADD CONSTRAINT fk_project 
          FOREIGN KEY (project_id) 
          REFERENCES projects(id) 
          ON DELETE CASCADE;
        `;
      } catch (e) {
        // Ignorar se já existir
      }
      
      console.log("✅ Conectado ao Neon e Banco de Dados pronto.");

      // CLEANUP JOB: Delete visitor data every 30 minutes
      setInterval(async () => {
        console.log("🧹 Iniciando limpeza periódica de dados de visitantes...");
        try {
          if (db) {
            // Deletar projetos que não são do admin (tarefas vão junto pelo CASCADE)
            await db.delete(schema.projects).where(ne(schema.projects.ownerEmail, ADMIN_EMAIL));
            console.log("✅ Dados de visitantes removidos do Postgres.");
          } else {
            // Limpar mocks
            for (let i = mockProjects.length - 1; i >= 0; i--) {
              if (mockProjects[i].ownerEmail !== ADMIN_EMAIL && mockProjects[i].id !== 'p1' && mockProjects[i].id !== 'p2' ) {
                mockProjects.splice(i, 1);
              }
            }
            for (let i = mockTasks.length - 1; i >= 0; i--) {
              if (mockTasks[i].ownerEmail !== ADMIN_EMAIL && mockTasks[i].id !== '1' && mockTasks[i].id !== '2') {
                mockTasks.splice(i, 1);
              }
            }
            console.log("✅ Dados de visitantes removidos do Mock Memory.");
          }
        } catch (err) {
          console.error("❌ Erro na limpeza:", err);
        }
      }, 30 * 60 * 1000); 

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

  app.get("/api/me", (req, res) => {
    const owner = getOwner(req);
    res.json({ isOwner: owner === ADMIN_EMAIL, role: owner === ADMIN_EMAIL ? 'admin' : 'visitor' });
  });

  // Helper middleware/check for owner filter
  const getOwner = (req: express.Request) => {
    const token = req.headers['x-access-token'] as string;
    if (token === MASTER_PASSWORD) return ADMIN_EMAIL;
    return 'visitor';
  };

  // PROJECTS API
  app.get("/api/projects", async (req, res) => {
    try {
      const ownerEmail = getOwner(req);
      if (!db) {
        return res.json(mockProjects.filter(p => p.ownerEmail === ownerEmail || p.ownerEmail === undefined || p.id === 'p1' || p.id === 'p2'));
      }
      const allProjects = await db.select().from(schema.projects)
        .where(eq(schema.projects.ownerEmail, ownerEmail))
        .orderBy(desc(schema.projects.createdAt));
      res.json(allProjects);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const ownerEmail = getOwner(req);
      if (!db) {
        const newProject = { 
          ...req.body, 
          id: Math.random().toString(36).substring(7), 
          ownerEmail,
          createdAt: new Date(), 
          updatedAt: new Date() 
        };
        mockProjects.push(newProject);
        return res.json(newProject);
      }
      const [newProject] = await db.insert(schema.projects).values({ ...req.body, ownerEmail }).returning();
      res.json(newProject);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const ownerEmail = getOwner(req);
      if (!db) {
        const idx = mockProjects.findIndex(p => p.id === req.params.id && (p.ownerEmail === ownerEmail || p.ownerEmail === undefined));
        if (idx !== -1) mockProjects.splice(idx, 1);
        return res.json({ success: true });
      }
      await db.delete(schema.projects).where(and(eq(schema.projects.id, req.params.id), eq(schema.projects.ownerEmail, ownerEmail)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // TASKS API
  app.get("/api/tasks", async (req, res) => {
    try {
      const ownerEmail = getOwner(req);
      const { projectId } = req.query;
      if (!db) {
        let filtered = [...mockTasks].filter(t => t.ownerEmail === ownerEmail || t.ownerEmail === undefined || t.id === '1' || t.id === '2');
        if (projectId) filtered = filtered.filter(t => t.projectId === projectId);
        return res.json(filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      }
      
      let conditions = [eq(schema.tasks.ownerEmail, ownerEmail)];
      if (projectId) conditions.push(eq(schema.tasks.projectId, projectId as string));
      
      const results = await db.select().from(schema.tasks)
        .where(and(...conditions))
        .orderBy(desc(schema.tasks.createdAt));
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const ownerEmail = getOwner(req);
      if (!db) {
        const newTask = { 
          ...req.body, 
          id: Math.random().toString(36).substring(7), 
          ownerEmail,
          createdAt: new Date(), 
          updatedAt: new Date() 
        };
        mockTasks.push(newTask);
        return res.json(newTask);
      }
      
      const values = { ...req.body, ownerEmail };
      if (values.deadline) values.deadline = new Date(values.deadline);
      if (values.startedAt) values.startedAt = new Date(values.startedAt);
      if (values.completedAt) values.completedAt = new Date(values.completedAt);
      
      const [newTask] = await db.insert(schema.tasks).values(values).returning();
      res.json(newTask);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const ownerEmail = getOwner(req);
      if (!db) {
        const idx = mockTasks.findIndex(t => t.id === req.params.id && (t.ownerEmail === ownerEmail || t.ownerEmail === undefined));
        if (idx === -1) return res.status(404).json({ error: "Not found" });
        
        const updates = { ...req.body, updatedAt: new Date() };
        
        // Handle logic for startedAt/completedAt in mock
        if (updates.status === 'in_progress' && mockTasks[idx].status === 'todo') {
          updates.startedAt = new Date();
        }
        if (updates.status === 'done' && mockTasks[idx].status !== 'done') {
          updates.completedAt = new Date();
        }

        mockTasks[idx] = { ...mockTasks[idx], ...updates };
        return res.json(mockTasks[idx]);
      }

      const updates = { ...req.body, updatedAt: new Date() };
      
      if (updates.deadline) updates.deadline = new Date(updates.deadline);
      if (updates.startedAt) updates.startedAt = new Date(updates.startedAt);
      if (updates.completedAt) updates.completedAt = new Date(updates.completedAt);
      
      const [updatedTask] = await db.update(schema.tasks)
        .set(updates)
        .where(and(eq(schema.tasks.id, req.params.id), eq(schema.tasks.ownerEmail, ownerEmail)))
        .returning();
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const ownerEmail = getOwner(req);
      if (!db) {
        const idx = mockTasks.findIndex(t => t.id === req.params.id && (t.ownerEmail === ownerEmail || t.ownerEmail === undefined));
        if (idx !== -1) mockTasks.splice(idx, 1);
        return res.json({ success: true });
      }
      await db.delete(schema.tasks).where(and(eq(schema.tasks.id, req.params.id), eq(schema.tasks.ownerEmail, ownerEmail)));
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
