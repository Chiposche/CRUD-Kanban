import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../lib/api-client';
import { Task, NewTask } from '../db/schema';
import { toast } from 'sonner';

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const token = localStorage.getItem('access-token') || 'visitor';
      const url = projectId ? `${API_URL}/tasks?projectId=${projectId}` : `${API_URL}/tasks`;
      const res = await fetch(url, {
        headers: { 'x-access-token': token }
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });

  const createTask = useMutation({
    mutationFn: async (newTask: Omit<NewTask, 'id'>) => {
      const token = localStorage.getItem('access-token') || 'visitor';
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({ ...newTask, projectId }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create task');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Tarefa criada com sucesso!');
    },
    onError: (err: any) => {
      toast.error(`Erro ao criar tarefa: ${err.message}`);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const token = localStorage.getItem('access-token') || 'visitor';
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': token
        },
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
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.map((task) => (task.id === id ? { ...task, ...updates } : task))
      );

      // 2. Perform background cancellation and save previous state
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', projectId]);

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      toast.error(`Erro ao atualizar: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('access-token') || 'visitor';
      const res = await fetch(`${API_URL}/tasks/${id}`, { 
        method: 'DELETE',
        headers: { 'x-access-token': token }
      });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', projectId]);
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.filter((task) => task.id !== id)
      );
      return { previousTasks };
    },
    onError: (err, id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      toast.error(`Erro ao deletar: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
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
