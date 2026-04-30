export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    brand: "Nexus.io",
    nav: {
      board: "Quadro",
      team: "Equipe",
      analytics: "Análise",
      settings: "Configurações"
    },
    status: {
      connected: "Neon Conectado",
      local: "Preview Local"
    },
    toolbar: {
      title: "Pipeline de Produção",
      subtitle: "v15.0.2 • SSR Ativo • Atualizações Otimistas",
      newTask: "Nova Tarefa"
    },
    stages: {
      todo: "Backlog",
      in_progress: "Em Progresso",
      done: "Concluído"
    },
    dialog: {
      title: "Criar Nova Tarefa",
      description: "Adicione um novo item de ação ao seu pipeline de produção.",
      inputLabel: "Título da Tarefa",
      placeholder: "Digite o título da tarefa...",
      cancel: "Cancelar",
      create: "Criar Tarefa"
    },
    footer: {
      systemReady: "Sistema Totalmente Operacional",
      relationalMode: "Modo Relacional: Persistente",
      engineActive: "Motor TanStack: Ativo",
      latency: "Latência de Mutação",
      optimisticEnabled: "UI Otimista Ativada"
    },
    card: {
      backlog: "A Fazer",
      optimization: "Otimização",
      verified: "Verificado",
      synced: "Sincronizado IP"
    }
  },
  en: {
    brand: "Nexus.io",
    nav: {
      board: "Board",
      team: "Team",
      analytics: "Analytics",
      settings: "Settings"
    },
    status: {
      connected: "Neon Connected",
      local: "Local Preview"
    },
    toolbar: {
      title: "Production Pipeline",
      subtitle: "v15.0.2 • SSR Active • Optimistic Updates",
      newTask: "New Task"
    },
    stages: {
      todo: "Backlog",
      in_progress: "In Progress",
      done: "Done"
    },
    dialog: {
      title: "Create New Task",
      description: "Add a new action item to your production pipeline.",
      inputLabel: "Task Title",
      placeholder: "Enter task title...",
      cancel: "Cancel",
      create: "Create Task"
    },
    footer: {
      systemReady: "System Fully Operational",
      relationalMode: "Relational Mode: Persistent",
      engineActive: "TanStack Engine: Active",
      latency: "Mutation Latency",
      optimisticEnabled: "Optimistic UI Enabled"
    },
    card: {
      backlog: "Backlog",
      optimization: "Optimization",
      verified: "Verified",
      synced: "Synced IP"
    }
  }
};
