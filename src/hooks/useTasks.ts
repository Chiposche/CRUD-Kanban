import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../lib/api-client';
import { Task, NewTask } from '../db/schema';
import { toast } from 'sonner';

export function useTasks() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/tasks`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });

  const createTask = useMutation({
    mutationFn: async (newTask: Omit<NewTask, 'id'>) => {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create task');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa criada com sucesso!');
    },
    onError: (err: any) => {
      toast.error(`Erro ao criar tarefa: ${err.message}`);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update task');
      }
      return res.json();
    },
    // OPTIMISTIC UPDATE
    onMutate: async ({ id, ...updates }) => {
      // 1. Immediately update the cache for instant UI feedback
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((task) => (task.id === id ? { ...task, ...updates } : task))
      );

      // 2. Perform background cancellation and save previous state
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      toast.error(`Erro ao atualizar: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.filter((task) => task.id !== id)
      );
      return { previousTasks };
    },
    onError: (err, id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      toast.error(`Erro ao deletar: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
  };
}
