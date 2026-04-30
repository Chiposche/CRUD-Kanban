import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Info, Languages, Menu, X } from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCorners,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task } from './db/schema';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { translations, Language } from './lib/i18n';
import { toast } from 'sonner';
import { TeamView } from './components/TeamView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';

interface TaskCardProps {
  task: Task;
  onDelete?: () => void;
  key?: string | number;
  labelColor?: string;
  lang: Language;
}

export default function KanbanBoard() {
  const queryClient = useQueryClient();
  const { tasks, isLoading, updateTask, createTask, deleteTask } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [lang, setLang] = useState<Language>('pt');
  const [activeNav, setActiveNav] = useState('board');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [dbStatus, setDbStatus] = useState<{ connected: boolean; mode: string } | null>(null);

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(() => setDbStatus({ connected: false, mode: 'Offline' }));
  }, []);

  const t = translations[lang];

  const STAGES = [
    { id: 'todo', title: t.stages.todo, labelColor: 'text-indigo-400' },
    { id: 'in_progress', title: t.stages.in_progress, labelColor: 'text-emerald-400' },
    { id: 'done', title: t.stages.done, labelColor: 'text-zinc-500' },
  ] as const;

  type Status = typeof STAGES[number]['id'];

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [initialStatus, setInitialStatus] = useState<Status | null>(null);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
      setInitialStatus(task.status as Status);
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    // Determine the new status
    const overColumn = STAGES.find((s) => s.id === overId);
    const overTask = tasks.find((t) => t.id === overId);
    const newStatus = overColumn ? overId : overTask ? overTask.status : null;

    if (newStatus && task.status !== newStatus) {
      // VISUAL ONLY: Update cache immediately so tasks "move" between columns while dragging
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((t) => (t.id === activeId ? { ...t, status: newStatus as Status } : t))
      );
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const task = tasks.find((t) => t.id === activeId);
    if (!task) {
      setActiveTask(null);
      return;
    }

    // Determine final status
    const overColumn = STAGES.find((s) => s.id === overId);
    const overTask = tasks.find((t) => t.id === overId);
    const targetStatus = overColumn ? (overId as Status) : (overTask?.status as Status);

    // PERSIST: Call the mutation to save to DB
    if (targetStatus && initialStatus !== targetStatus) {
      updateTask.mutate({ id: task.id, status: targetStatus });
    }

    setActiveTask(null);
    setInitialStatus(null);
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    createTask.mutate({ title: newTaskTitle, status: 'todo' });
    setNewTaskTitle('');
    setIsDialogOpen(false);
  };

  const toggleLang = () => setLang(l => l === 'pt' ? 'en' : 'pt');

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-[#fafafa] font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Header Section */}
      <header className="h-16 border-b border-zinc-800 px-4 sm:px-10 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <button 
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden xs:flex w-8 h-8 bg-white rounded-lg items-center justify-center">
              <div className="w-4 h-4 border-2 border-black rotate-45"></div>
            </div>
            <span className="font-bold tracking-tight text-xl">{t.brand}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            {Object.entries(t.nav).map(([key, label]) => (
              <button 
                key={key}
                className={cn(
                  "cursor-pointer transition-colors hover:text-white relative py-5",
                  activeNav === key ? "text-white" : "text-zinc-500"
                )}
                onClick={() => setActiveNav(key)}
              >
                {label}
                {activeNav === key && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLang}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full flex items-center gap-2 font-mono uppercase tracking-widest text-[10px] h-8 px-3"
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === 'pt' ? 'Português' : 'English'}
          </Button>

          <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-500",
              dbStatus?.connected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
              dbStatus === null ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" :
              "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            )}></div>
            <span className={cn(
              "text-[10px] font-mono uppercase tracking-widest",
              dbStatus?.connected ? "text-emerald-500" : "text-amber-400"
            )}>
              {dbStatus?.mode === "Mock In-Memory" ? "⚠️ MOCK MODE (NO DB)" : (dbStatus?.mode || "Connecting...")}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 ring-2 ring-zinc-800"></div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-zinc-950 border-b border-zinc-800 p-4 flex flex-col gap-2 z-40"
          >
            {Object.entries(t.nav).map(([key, label]) => (
              <button 
                key={key}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  activeNav === key ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5"
                )}
                onClick={() => {
                  setActiveNav(key);
                  setIsMobileMenuOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {activeNav === 'board' ? (
        <>
          {/* Kanban Toolbar */}
      <div className="px-4 sm:px-10 py-6 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">{t.toolbar.title}</h1>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest italic flex items-center gap-2">
            {t.toolbar.subtitle}
          </p>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="hidden xs:flex -space-x-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-700 ring-1 ring-white/5"></div>
            <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-600 ring-1 ring-white/5"></div>
            <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 ring-1 ring-white/5">+4</div>
          </div>
          <div className="hidden xs:block h-6 w-px bg-zinc-800 mx-2"></div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className="flex-1 sm:flex-none bg-white text-black text-sm font-semibold px-6 h-10 rounded-lg hover:bg-zinc-200 transition-all duration-200 shadow-lg shadow-white/5 cursor-pointer inline-flex items-center justify-center whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" /> {t.toolbar.newTask}
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-2xl sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">{t.dialog.title}</DialogTitle>
                <p className="text-zinc-400 text-sm">{t.dialog.description}</p>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">{t.dialog.inputLabel}</label>
                  <Input
                    placeholder={t.dialog.placeholder}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                    className="bg-zinc-950 border-zinc-800 text-white h-12 focus-visible:ring-indigo-500 rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl">{t.dialog.cancel}</Button>
                <Button onClick={handleCreateTask} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-8 shadow-lg shadow-indigo-500/20">{t.dialog.create}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board Container */}
      <main className="flex-1 px-4 sm:px-10 pb-8 flex gap-6 overflow-x-auto overflow-y-hidden custom-scrollbar scroll-smooth">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {STAGES.map((stage) => (
            <KanbanColumn 
              key={stage.id}
              stage={stage}
              tasks={tasks}
              deleteTask={deleteTask}
              lang={lang}
              onAddTask={() => setIsDialogOpen(true)}
            />
          ))}

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.4',
                },
              },
            }),
          }}>
            {activeTask ? (
              <div className="rotate-2 cursor-grabbing scale-[1.02] shadow-2xl shadow-black/50 ring-1 ring-white/10 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700">
                  <TaskCard 
                    task={activeTask} 
                    labelColor={STAGES.find(s => s.id === activeTask.status)?.labelColor}
                    lang={lang}
                  />
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

        </>
      ) : activeNav === 'team' ? (
        <TeamView />
      ) : activeNav === 'analytics' ? (
        <AnalyticsView tasks={tasks} />
      ) : activeNav === 'settings' ? (
        <SettingsView />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10">
            <Info className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Em Desenvolvimento
          </h2>
          <Button 
            variant="outline" 
            className="mt-8 border-zinc-800 hover:bg-zinc-900 rounded-xl px-8"
            onClick={() => setActiveNav('board')}
          >
            Voltar para o Quadro
          </Button>
        </div>
      )}

      {/* Bottom Status Bar */}
      <footer className="h-10 bg-zinc-900 border-t border-zinc-800 px-6 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-mono shrink-0">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-zinc-300">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> 
            {t.footer.systemReady}
          </span>
          <span className="flex items-center gap-2 hidden sm:flex">
            <span className="w-1 h-1 rounded-full bg-zinc-500"></span> 
            {t.footer.relationalMode}
          </span>
          <span className="flex items-center gap-2 hidden lg:flex">
            <span className="w-1 h-1 rounded-full bg-zinc-500"></span> 
            {t.footer.engineActive}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden md:inline">{t.footer.latency}: <span className="text-zinc-400">12ms</span></span>
          <span className="text-indigo-400 font-bold flex items-center gap-2">
            {t.footer.optimisticEnabled}
          </span>
        </div>
      </footer>
    </div>
  );
}

function KanbanColumn({ stage, tasks, deleteTask, lang, onAddTask }: any) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-1 flex flex-col min-w-[280px] sm:min-w-[320px] max-w-[400px]">
      <div className="mb-5 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">
            {stage.title}
          </h2>
          <span className="font-mono text-[11px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full bg-zinc-900/50">
            {tasks.filter((t) => t.status === stage.id).length}
          </span>
        </div>
        <button 
          onClick={onAddTask}
          className="text-zinc-600 hover:text-zinc-400 transition-colors text-lg font-light"
        >
          +
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-3 relative min-h-[300px]">
        <SortableContext
          items={tasks.filter((t) => t.status === stage.id).map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3 h-full">
            <AnimatePresence initial={false}>
              {tasks
                .filter((t) => t.status === stage.id)
                .map((task) => (
                  <SortableTaskCard 
                    key={task.id} 
                    task={task} 
                    onDelete={() => deleteTask.mutate(task.id)}
                    labelColor={stage.labelColor}
                    lang={lang}
                  />
                ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

function TaskCard({ task, onDelete, labelColor, lang, attributes, listeners }: TaskCardProps & { attributes?: any, listeners?: any }) {
  const t = translations[lang];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative"
    >
      <Card className="bg-zinc-900 border-zinc-800 shadow-sm hover:border-zinc-700 transition-all duration-200 rounded-xl overflow-hidden ring-1 ring-white/5">
        <CardHeader className="p-4 pb-2 space-y-3">
           <div className="flex items-center justify-between">
              <span className={cn("text-[10px] uppercase font-bold tracking-[0.2em]", labelColor || "text-zinc-500")}>
                {task.status === 'todo' ? t.card.backlog : task.status === 'in_progress' ? t.card.optimization : t.card.verified}
              </span>
              <div className="flex items-center gap-1">
                {onDelete && (
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg"
                   >
                     <Trash2 className="h-3.5 w-3.5" />
                   </button>
                 )}
                 <div {...attributes} {...listeners} className="p-1 px-1.5 cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-500 transition-colors">
                   <GripVertical className="h-4 w-4" />
                 </div>
              </div>
           </div>
           <CardTitle className="text-sm font-medium text-zinc-200 leading-snug">
            {task.title}
           </CardTitle>
        </CardHeader>
        
        {task.description ? (
          <CardContent className="px-4 py-2">
            <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 italic">
              {task.description}
            </p>
          </CardContent>
        ) : (
          <CardContent className="px-4 py-1">
            <div className="h-1 w-8 bg-zinc-800 rounded-full"></div>
          </CardContent>
        )}

        <CardFooter className="px-4 py-4 flex justify-between items-center bg-zinc-950/20 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
               <span className="text-[8px] font-bold text-zinc-500 uppercase">{task.title[0]}</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-600 tracking-tighter">
              #{task.id.slice(0, 7)}
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-600 uppercase">
             {t.card.synced}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function SortableTaskCard(props: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-0")}>
      <TaskCard {...props} attributes={attributes} listeners={listeners} />
    </div>
  );
}

