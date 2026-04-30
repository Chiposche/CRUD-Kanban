import React from 'react';
import { Project } from '../db/schema';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Folder, MoreVertical, Calendar, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProjectFolderProps {
  project: Project;
  onSelect: (id: string) => void;
  taskCount?: number;
  key?: string | number;
}

export function ProjectFolder({ project, onSelect, taskCount = 0 }: ProjectFolderProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/5"
        onClick={() => onSelect(project.id)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-white text-black rounded-xl shadow-lg ring-1 ring-white/10 group-hover:rotate-6 transition-transform">
              <Folder className="h-6 w-6" />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-white rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-2 min-h-[40px]">
            {project.description || 'Sem descrição definida para este workspace.'}
          </p>
        </CardContent>

        <CardFooter className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <Layers className="h-3.5 w-3.5" />
              {taskCount} {taskCount === 1 ? 'Tarefa' : 'Tarefas'}
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-500 bg-zinc-950 font-mono">
            v1.0
          </Badge>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
