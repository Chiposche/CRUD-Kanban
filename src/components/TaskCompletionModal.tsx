import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '../db/schema';
import { CheckCircle2, User, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { summary: string, completedBy: string }) => void;
  task: Task | null;
}

export function TaskCompletionModal({ isOpen, onClose, onConfirm, task }: TaskCompletionModalProps) {
  const [summary, setSummary] = useState('');
  const [completedBy, setCompletedBy] = useState('');

  if (!task) return null;

  const handleConfirm = () => {
    onConfirm({ summary, completedBy });
    setSummary('');
    setCompletedBy('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-3xl sm:max-w-lg shadow-2xl ring-1 ring-white/10">
        <DialogHeader className="items-center text-center pb-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
            <Trophy className="h-8 w-8 text-emerald-500" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">Conclusão de Tarefa</DialogTitle>
          <p className="text-zinc-500 text-sm max-w-xs ring-1 ring-white/5 bg-zinc-950/50 p-2 rounded-lg mt-2">
            Tarefa: <span className="text-white font-medium">{task.title}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4 px-1">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2 px-1">
              <User className="h-3 w-3" /> Quem concluiu?
            </label>
            <Input 
              placeholder="Seu nome"
              value={completedBy}
              onChange={(e) => setCompletedBy(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white h-12 focus-visible:ring-emerald-500 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2 px-1">
              <CheckCircle2 className="h-3 w-3" /> Resumo da Entrega
            </label>
            <Textarea 
              placeholder="Explique resumidamente como você resolveu esta tarefa..."
              className="bg-zinc-950 border-zinc-800 text-white min-h-[120px] focus-visible:ring-emerald-500 rounded-xl resize-none leading-relaxed text-sm p-4"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            <p className="text-[10px] text-zinc-600 px-1 italic">
              * Este resumo ficará registrado no histórico do projeto para consulta futura.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2 mt-4 pt-4 border-t border-zinc-800/50">
          <Button variant="ghost" onClick={onClose} className="rounded-xl text-zinc-400 hover:text-white px-8">
            Voltar
          </Button>
          <Button 
            disabled={!summary.trim() || !completedBy.trim()}
            onClick={handleConfirm}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-10 font-bold shadow-lg shadow-emerald-500/20"
          >
            Confirmar Conclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
