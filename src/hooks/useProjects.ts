import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../lib/api-client';
import { Project, NewProject } from '../db/schema';
import { toast } from 'sonner';

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const createProject = useMutation({
    mutationFn: async (project: NewProject) => {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto excluído.');
    },
  });

  return { projects, isLoading, createProject, deleteProject };
}
