import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../lib/api-client';
import { Project, NewProject } from '../db/schema';
import { toast } from 'sonner';

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const token = localStorage.getItem('access-token') || 'visitor';
      const res = await fetch(`${API_URL}/projects`, {
        headers: { 'x-access-token': token }
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const createProject = useMutation({
    mutationFn: async (project: NewProject) => {
      const token = localStorage.getItem('access-token') || 'visitor';
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto criado com sucesso!');
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('access-token') || 'visitor';
      const res = await fetch(`${API_URL}/projects/${id}`, { 
        method: 'DELETE',
        headers: { 'x-access-token': token }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha ao excluir projeto');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto excluído com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    }
  });

  return { projects, isLoading, createProject, deleteProject };
}
