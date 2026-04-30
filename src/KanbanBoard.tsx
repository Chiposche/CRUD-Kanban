import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Info, Languages, Menu, X, Maximize2, MoreVertical } from 'lucide-react';
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Project, Task } from './db/schema';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { translations, Language } from './lib/i18n';
import { toast } from 'sonner';
import { TeamView } from './components/TeamView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { ProjectGrid } from './components/ProjectGrid';
import { TaskCompletionModal } from './components/TaskCompletionModal';
import { useProjects } from './hooks/useProjects';
import { Calendar, Clock, ChevronLeft, User as UserIcon, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STAGES_CONFIG = [
  { id: 'todo', labelColor: 'text-indigo-400' },
  { id: 'in_progress', labelColor: 'text-emerald-400' },
  { id: 'done', labelColor: 'text-zinc-500' },
] as const;

type Status = typeof STAGES_CONFIG[number]['id'];

interface TaskCardProps {
  task: Task;
  onDelete?: () => void;
  onMove?: (status: Status) => void;
  key?: string | number;
  labelColor?: string;
  lang: Language;
}

export default function KanbanBoard() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { projects, createProject, deleteProject } = useProjects();
  const { tasks, isLoading, updateTask, createTask, deleteTask } = useTasks(selectedProjectId || undefined);
  
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [lang, setLang] = useState<Language>('pt');
  const [activeNav, setActiveNav] = useState('board');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [completionModalTask, setCompletionModalTask] = useState<Task | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [pendingStatusMove, setPendingStatusMove] = useState<{ id: string, status: Status } | null>(null);

  const [dbStatus, setDbStatus] = useState<{ connected: boolean; mode: string } | null>(null);
  const [userToken, setUserToken] = useState<string>(localStorage.getItem('access-token') || 'visitor');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [tempToken, setTempToken] = useState('');

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(() => setDbStatus({ connected: false, mode: 'Offline' }));
  }, []);

  React.useEffect(() => {
    fetch('/api/me', { headers: { 'x-access-token': userToken } })
      .then(res => res.json())
      .then(data => setIsAdmin(data.isOwner))
      .catch(() => setIsAdmin(false));
  }, [userToken]);

  const handleLogin = () => {
    if (!tempToken.trim()) return;
    localStorage.setItem('access-token', tempToken.trim());
    setUserToken(tempToken.trim());
    setIsLoginDialogOpen(false);
    setTempToken('');
    queryClient.invalidateQueries();
    toast.success(`Acesso identificado`);
  };

  const handleLogout = () => {
    localStorage.removeItem('access-token');
    setUserToken('visitor');
    setIsAdmin(false);
    queryClient.invalidateQueries();
    toast.info('Modo Visitante ativado');
  };

  const t = translations[lang];

  const STAGES = [
    { id: 'todo', title: t.stages.todo, labelColor: 'text-indigo-400' },
    { id: 'in_progress', title: t.stages.in_progress, labelColor: 'text-emerald-400' },
    { id: 'done', title: t.stages.done, labelColor: 'text-zinc-500' },
  ] as const;

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
      if (targetStatus === 'done') {
        // Intercept Done move to show modal
        setPendingStatusMove({ id: task.id, status: targetStatus });
        setCompletionModalTask(task);
        setIsCompletionModalOpen(true);
      } else {
        const updates: Partial<Task> = { status: targetStatus };
        if (targetStatus === 'in_progress') updates.startedAt = new Date();
        updateTask.mutate({ id: task.id, ...updates });
      }
    }

    setActiveTask(null);
    setInitialStatus(null);
  };

  const handleCompletionConfirm = (data: { summary: string, completedBy: string }) => {
    if (pendingStatusMove) {
      updateTask.mutate({ 
        id: pendingStatusMove.id, 
        status: 'done',
        completedAt: new Date(),
        completedBy: data.completedBy,
        completionSummary: data.summary
      });
    }
    setIsCompletionModalOpen(false);
    setCompletionModalTask(null);
    setPendingStatusMove(null);
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
              isAdmin ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500"
            )}></div>
            <span className={cn(
              "text-[10px] font-mono uppercase tracking-widest",
              isAdmin ? "text-emerald-500" : "text-amber-500"
            )}>
              {isAdmin ? t.system.persistent : t.system.ephemeral}
            </span>
          </div>

          <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
             <DialogTrigger 
                render={
                  <button 
                    className={cn(
                      "w-8 h-8 rounded-full ring-2 ring-zinc-800 transition-all flex items-center justify-center overflow-hidden cursor-pointer",
                      isAdmin ? "bg-emerald-600" : "bg-zinc-800 hover:bg-zinc-700"
                    )}
                    title={userToken === 'visitor' ? 'Visitante' : 'Privado'}
                  />
                }
             >
                {isAdmin ? <UserIcon className="h-4 w-4 text-white" /> : <div className="text-[10px] font-bold text-zinc-500">?</div>}
             </DialogTrigger>
             <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-2xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Código de Acesso</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <p className="text-zinc-400 text-sm">
                    Digite seu código de acesso para carregar seus dados privados. O proprietário master tem persistência vitalícia, visitantes têm os dados apagados a cada 30 minutos.
                  </p>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-zinc-500">Voucher / Senha</label>
                    <Input 
                      type="password"
                      placeholder="••••••••" 
                      value={tempToken}
                      onChange={(e) => setTempToken(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      className="bg-zinc-950 border-zinc-800"
                    />
                  </div>
                  {userToken !== 'visitor' && (
                    <Button variant="ghost" onClick={handleLogout} className="w-full text-zinc-500 hover:text-red-400">
                      Limpar Sessão / Modo Visitante
                    </Button>
                  )}
                </div>
                <DialogFooter>
                   <Button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full">
                     Validar Acesso
                   </Button>
                </DialogFooter>
             </DialogContent>
          </Dialog>
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
          {!selectedProjectId ? (
            <ProjectGrid 
              projects={projects} 
              onSelectProject={setSelectedProjectId} 
              onCreateProject={(p) => createProject.mutate(p)}
              onDeleteProject={(id) => {
                // Removendo window.confirm para teste em iframe
                deleteProject.mutate(id);
              }}
              lang={lang}
            />
          ) : (
            <>
              {/* Kanban Toolbar */}
              <div className="px-4 sm:px-10 py-6 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-6">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedProjectId(null)}
                    className="h-10 w-10 border border-zinc-800 rounded-xl hover:bg-zinc-900"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">{selectedProject?.name}</h1>
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest italic flex items-center gap-2">
                       {t.analytics.boardSubHeader.replace('{count}', tasks.length.toString())}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="hidden xs:flex -space-x-2.5">
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-700 ring-1 ring-white/5"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-600 ring-1 ring-white/5"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 ring-1 ring-white/5">+4</div>
                  </div>
                  <div className="hidden xs:block h-6 w-px bg-zinc-800 mx-2"></div>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger 
                      render={
                        <button className="flex-1 sm:flex-none bg-white text-black text-sm font-semibold px-6 h-10 rounded-lg hover:bg-zinc-200 transition-all duration-200 shadow-lg shadow-white/5 cursor-pointer inline-flex items-center justify-center whitespace-nowrap" />
                      }
                    >
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
              <main className="flex-1 px-4 sm:px-10 pb-8 flex gap-6 overflow-x-auto overflow-y-auto custom-scrollbar scroll-smooth">
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
                      updateTask={updateTask}
                      setPendingStatusMove={setPendingStatusMove}
                      setCompletionModalTask={setCompletionModalTask}
                      setIsCompletionModalOpen={setIsCompletionModalOpen}
                      lang={lang}
                      onAddTask={() => setIsDialogOpen(true)}
                    />
                  ))}

                  <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                      styles: { active: { opacity: '0.4' } },
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

              <TaskCompletionModal 
                isOpen={isCompletionModalOpen}
                onClose={() => {
                  setIsCompletionModalOpen(false);
                  setCompletionModalTask(null);
                  setPendingStatusMove(null);
                }}
                onConfirm={handleCompletionConfirm}
                task={completionModalTask}
                lang={lang}
              />
            </>
          )}
        </>
      ) : activeNav === 'team' ? (
        <TeamView lang={lang} />
      ) : activeNav === 'analytics' ? (
        <AnalyticsView tasks={tasks} lang={lang} />
      ) : activeNav === 'settings' ? (
        <SettingsView lang={lang} />
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

function KanbanColumn({ 
  stage, 
  tasks, 
  deleteTask, 
  updateTask, 
  setPendingStatusMove, 
  setCompletionModalTask, 
  setIsCompletionModalOpen, 
  lang, 
  onAddTask 
}: any) {
  const t = translations[lang];
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const columnTasks = tasks.filter((t: any) => t.status === stage.id);

  return (
    <>
      <div className="flex-1 flex flex-col min-w-[280px] sm:min-w-[320px] max-w-[400px]">
        <div className="mb-5 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">
              {stage.title}
            </h2>
            <span className="font-mono text-[11px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full bg-zinc-900/50">
              {columnTasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsExpanded(true)}
              className="p-1.5 text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 rounded-md transition-all"
              title="Expandir Coluna"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={onAddTask}
              className="p-1 px-2 text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 rounded-md transition-all text-lg font-light leading-none"
            >
              +
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-3 relative min-h-[400px]">
          <div ref={setNodeRef} className="h-full min-h-[300px]">
            <SortableContext
                items={columnTasks.map((t: any) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {columnTasks.map((task: any) => (
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
        </ScrollArea>
      </div>

      {/* Expanded Column Modal */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl bg-zinc-950 border-zinc-800 text-white rounded-3xl h-[85vh] flex flex-col p-0 overflow-hidden">
           <DialogHeader className="p-8 border-b border-zinc-800 shrink-0">
             <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <DialogTitle className="text-3xl font-bold tracking-tight">
                      {stage.title}
                    </DialogTitle>
                    <Badge variant="outline" className="bg-zinc-900 text-zinc-400 border-zinc-800 px-3">
                      {columnTasks.length} {columnTasks.length === 1 ? t.analytics.expandedView.task : t.analytics.expandedView.tasks}
                    </Badge>
                  </div>
                  <p className="text-zinc-500">{t.analytics.expandedView.description.replace('{stage}', stage.title.toLowerCase())}</p>
                </div>
             </div>
           </DialogHeader>
           
           <ScrollArea className="flex-1 p-8 bg-zinc-950/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columnTasks.map((task: any) => (
                  <div key={task.id} className="relative group">
                     <TaskCard 
                        task={task}
                        labelColor={stage.labelColor}
                        lang={lang}
                        onDelete={() => deleteTask.mutate(task.id)}
                        onMove={(newStatus) => {
                          if (newStatus === 'done') {
                            setPendingStatusMove({ id: task.id, status: 'done' });
                            setCompletionModalTask(task);
                            setIsCompletionModalOpen(true);
                          } else {
                            const updates: Partial<Task> = { status: newStatus };
                            if (newStatus === 'in_progress') updates.startedAt = new Date();
                            updateTask.mutate({ id: task.id, ...updates });
                          }
                        }}
                     />
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-900 rounded-3xl">
                     <p>{t.analytics.expandedView.empty}</p>
                  </div>
                )}
              </div>
           </ScrollArea>

           <DialogFooter className="p-6 border-t border-zinc-800 bg-zinc-900/20">
              <Button 
                variant="outline" 
                onClick={() => setIsExpanded(false)}
                className="border-zinc-800 hover:bg-zinc-800 rounded-xl"
              >
                {t.analytics.expandedView.close}
              </Button>
              <Button 
                onClick={() => {
                  setIsExpanded(false);
                  onAddTask();
                }}
                className="bg-white text-black hover:bg-zinc-200 rounded-xl"
              >
                {t.analytics.expandedView.addNew}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TaskCard({ task, onDelete, onMove, labelColor, lang, attributes, listeners }: TaskCardProps & { attributes?: any, listeners?: any }) {
  const t = translations[lang];

  const inProgressTime = task.status === 'in_progress' && task.startedAt
    ? formatDistanceToNow(new Date(task.startedAt), { 
        addSuffix: false,
        locale: lang === 'pt' ? ptBR : undefined 
      })
    : null;

  const STAGES = [
    { id: 'todo', title: t.stages.todo },
    { id: 'in_progress', title: t.stages.in_progress },
    { id: 'done', title: t.stages.done },
  ];

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
                {onMove && (
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <button className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer" />
                    }>
                      <MoreVertical className="h-3.5 w-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white min-w-[140px]">
                      <div className="px-2 py-1.5 text-[10px] font-mono uppercase text-zinc-500 border-b border-zinc-800 mb-1">
                        {t.card.move}
                      </div>
                      {STAGES.filter(s => s.id !== task.status).map(stage => (
                        <DropdownMenuItem 
                          key={stage.id}
                          onClick={() => onMove(stage.id as Status)}
                          className="text-xs hover:bg-zinc-800 cursor-pointer"
                        >
                          {stage.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
           
           <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-zinc-200 leading-snug">
                {task.title}
              </CardTitle>
              {task.deadline && (
                <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-mono uppercase tracking-widest mt-1">
                  <Calendar className="h-3 w-3" />
                  {t.card.deadline}: {new Date(task.deadline).toLocaleDateString()}
                </div>
              )}
           </div>
        </CardHeader>
        
        {task.description && (
          <CardContent className="px-4 py-1">
            <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 italic">
              {task.description}
            </p>
          </CardContent>
        )}

        {task.status === 'in_progress' && inProgressTime && (
           <CardContent className="px-4 py-1">
              <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 font-mono uppercase tracking-widest">
                <Clock className="h-3 w-3" />
                {t.card.inProgressSince} {inProgressTime}
              </div>
           </CardContent>
        )}

        {task.status === 'done' && task.completionSummary && (
           <CardContent className="px-4 py-1 border-t border-zinc-800/30 mt-2 pt-2">
              <div className="flex items-start gap-2 bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/50">
                <MessageSquare className="h-3 w-3 text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-[9px] text-zinc-400 italic line-clamp-2">
                  {task.completionSummary}
                </p>
              </div>
           </CardContent>
        )}

        <CardFooter className="px-4 py-4 flex justify-between items-center bg-zinc-950/20 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center overflow-hidden">
               {task.assignee ? (
                 <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white">
                   {task.assignee[0]}
                 </div>
               ) : (
                 <UserIcon className="h-3 w-3 text-zinc-600" />
               )}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-500">
                {task.status === 'done' ? (task.completedBy || task.assignee || t.card.finished) : (task.assignee || t.card.noAssignee)}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-zinc-700 tracking-tighter">
             #{task.id.slice(0, 7)}
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

