import React, { useState } from 'react';
import { ProjectFolder } from './ProjectFolder';
import { Project, NewProject } from '../db/schema';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProjectGridProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onCreateProject: (project: NewProject) => void;
}

export function ProjectGrid({ projects, onSelectProject, onCreateProject }: ProjectGridProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateProject({ name, description });
    setName('');
    setDescription('');
    setIsOpen(false);
  };

  return (
    <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Meus Projetos</h1>
            <p className="text-zinc-500 text-sm">Selecione uma pasta para gerenciar suas tarefas e fluxos de trabalho.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="bg-white text-black hover:bg-zinc-200 font-bold px-6 h-12 rounded-xl shadow-lg shadow-white/5 inline-flex items-center justify-center cursor-pointer transition-colors">
              <Plus className="mr-2 h-5 w-5" /> Novo Projeto
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-3xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Criar No Workspace</DialogTitle>
                <p className="text-zinc-500 text-sm">Defina o nome e propósito do seu novo quadro.</p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Nome do Projeto</label>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Marketing 2024"
                    className="bg-zinc-950 border-zinc-800 h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Descrição</label>
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Breve resumo do projeto..."
                    className="bg-zinc-950 border-zinc-800 rounded-xl min-h-[100px] resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl text-zinc-400">Cancelar</Button>
                <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-8 ml-2">Criar Pasta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LayoutGrid className="h-8 w-8 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum projeto encontrado</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">Comece criando sua primeira pasta de trabalho para organizar suas tarefas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectFolder 
                key={project.id} 
                project={project} 
                onSelect={onSelectProject}
                taskCount={0} // We'd ideally fetch counts here but let's keep it simple
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
