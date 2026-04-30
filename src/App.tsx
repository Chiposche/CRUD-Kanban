import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from './lib/api-client';
import KanbanBoard from './KanbanBoard';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <KanbanBoard />
      <Toaster position="top-right" closeButton richColors expand={false} />
    </QueryClientProvider>
  );
}
