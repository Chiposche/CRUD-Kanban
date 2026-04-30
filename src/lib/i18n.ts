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
      synced: "Sincronizado IP",
      deadline: "Entrega",
      inProgressSince: "Em progresso há",
      finished: "Finalizado",
      noAssignee: "Sem Responsável",
      move: "Mover para"
    },
    system: {
      persistent: "PERSISTENTE",
      ephemeral: "EFÊMERO (30min)"
    },
    completionModal: {
      title: "Conclusão de Tarefa",
      taskLabel: "Tarefa",
      whoCompleted: "Quem concluiu?",
      namePlaceholder: "Seu nome",
      summaryLabel: "Resumo da Entrega",
      summaryPlaceholder: "Explique resumidamente como você resolveu esta tarefa...",
      disclaimer: "* Este resumo ficará registrado no histórico do projeto para consulta futura.",
      back: "Voltar",
      confirm: "Confirmar Conclusão"
    },
    team: {
      header: "Equipe do Projeto",
      subHeader: "Colaboradores ativos e seus status atuais no workspace.",
      expandTitle: "Deseja expandir a equipe?",
      expandSub: "Convide novos membros para colaborar neste quadro em tempo real.",
      inviteButton: "Convidar Membros"
    },
    analytics: {
      header: "Relatórios Automáticos",
      subHeader: "Análise de produtividade e distribuição de tarefas do sistema.",
      backlog: "Backlog",
      inProgress: "Em Progresso",
      done: "Concluídas",
      total: "Total",
      performanceTitle: "Desempenho por Estágio",
      completionRate: "% de Compleção",
      completionIndex: "Índice de Conclusão",
      activityTitle: "Feed de Atividade (Hoje)",
      activityStatus: "Status",
      noActivity: "Nenhuma atividade registrada ainda hoje.",
      insightsTitle: "Insights IA",
      insightsProd: "Você completou {done} tarefas hoje. Sua produtividade está 15% acima da média semanal. Continue assim!",
      insightsBacklog: "O Backlog ({todo} itens) está crescendo mais rápido que a taxa de conclusão. Considere delegar tarefas de baixa prioridade.",
      todayLabel: "HOJE",
      boardSubHeader: "Gerenciando {count} tarefas neste workspace",
      expandedView: {
        task: "Tarefa",
        tasks: "Tarefas",
        description: "Visão expandida de todo o fluxo de {stage}.",
        empty: "Nenhuma tarefa nesta etapa no momento.",
        close: "Fechar Visualização",
        addNew: "Adicionar Nova Tarefa"
      }
    },
    settings: {
      header: "Configurações do Workspace",
      subHeader: "Gerencie suas preferências de interface, notificações e integrações de dados.",
      profileSection: "Perfil & Conta",
      langTitle: "Idioma do Sistema",
      langDesc: "Selecione o idioma padrão para o quadro e comunicações.",
      changeBtn: "Alterar",
      securityTitle: "Segurança de Dados",
      securityDesc: "Gerencie permissões de acesso e chaves de API do banco de dados PostgreSQL.",
      configureBtn: "Configurar",
      visualSection: "Preferências Visuais",
      darkModeTitle: "Modo Escuro Avançado",
      darkModeDesc: "Usa variações de cores oklch para melhor contraste em telas OLED.",
      animationsTitle: "Animações de Layout",
      animationsDesc: "Ativa transições fluidas entre estados de tarefas e rotas.",
      integrationsSection: "Integrações & Sincronização",
      postgresTitle: "PostgreSQL Connect",
      postgresDesc: "Status da conexão direta com o banco de dados Supabase/Postgres.",
      activeStatus: "ATIVO",
      notificationsTitle: "Notificações Push",
      notificationsDesc: "Receba alertas quando tarefas forem movidas para 'Concluído'.",
      restoreBtn: "Restaurar Padrões",
      saveBtn: "Salvar Alterações"
    },
    projectGrid: {
      header: "Meus Projetos",
      subHeader: "Selecione uma pasta para gerenciar suas tarefas e fluxos de trabalho.",
      newProjectBtn: "Novo Projeto",
      dialogTitle: "Criar No Workspace",
      dialogSub: "Defina o nome e propósito do seu novo quadro.",
      nameLabel: "Nome do Projeto",
      namePlaceholder: "Ex: Marketing 2024",
      descLabel: "Descrição",
      descPlaceholder: "Breve resumo do projeto...",
      createBtn: "Criar Pasta",
      emptyTitle: "Nenhum projeto encontrado",
      emptySub: "Comece criando sua primeira pasta de trabalho para organizar suas tarefas."
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
      synced: "Synced IP",
      deadline: "Deadline",
      inProgressSince: "In progress for",
      finished: "Finished",
      noAssignee: "No Assignee",
      move: "Move to"
    },
    system: {
      persistent: "PERSISTENT",
      ephemeral: "EPHEMERAL (30min)"
    },
    completionModal: {
      title: "Task Completion",
      taskLabel: "Task",
      whoCompleted: "Who completed it?",
      namePlaceholder: "Your name",
      summaryLabel: "Delivery Summary",
      summaryPlaceholder: "Briefly explain how you solved this task...",
      disclaimer: "* This summary will be recorded in the project history for future reference.",
      back: "Back",
      confirm: "Confirm Completion"
    },
    team: {
      header: "Project Team",
      subHeader: "Active contributors and their current status in the workspace.",
      expandTitle: "Want to expand the team?",
      expandSub: "Invite new members to collaborate on this board in real time.",
      inviteButton: "Invite Members"
    },
    analytics: {
      header: "Automated Reports",
      subHeader: "Productivity analysis and task distribution for the system.",
      backlog: "Backlog",
      inProgress: "In Progress",
      done: "Done",
      total: "Total",
      performanceTitle: "Performance by Stage",
      completionRate: "% Completion",
      completionIndex: "Completion Index",
      activityTitle: "Activity Feed (Today)",
      activityStatus: "Status",
      noActivity: "No activity recorded yet today.",
      insightsTitle: "AI Insights",
      insightsProd: "You completed {done} tasks today. Your productivity is 15% above the weekly average. Keep it up!",
      insightsBacklog: "The Backlog ({todo} items) is growing faster than the completion rate. Consider delegating low-priority tasks.",
      todayLabel: "TODAY",
      boardSubHeader: "Managing {count} tasks in this workspace",
      expandedView: {
        task: "Task",
        tasks: "Tasks",
        description: "Expanded view of the entire {stage} workflow.",
        empty: "No tasks in this stage at the moment.",
        close: "Close View",
        addNew: "Add New Task"
      }
    },
    settings: {
      header: "Workspace Settings",
      subHeader: "Manage your interface preferences, notifications, and data integrations.",
      profileSection: "Profile & Account",
      langTitle: "System Language",
      langDesc: "Select the default language for the board and communications.",
      changeBtn: "Change",
      securityTitle: "Data Security",
      securityDesc: "Manage access permissions and database API keys.",
      configureBtn: "Configure",
      visualSection: "Visual Preferences",
      darkModeTitle: "Advanced Dark Mode",
      darkModeDesc: "Uses oklch color variations for better contrast on OLED screens.",
      animationsTitle: "Layout Animations",
      animationsDesc: "Enables fluid transitions between task states and routes.",
      integrationsSection: "Integrations & Sync",
      postgresTitle: "PostgreSQL Connect",
      postgresDesc: "Direct connection status with Supabase/Postgres database.",
      activeStatus: "ACTIVE",
      notificationsTitle: "Push Notifications",
      notificationsDesc: "Receive alerts when tasks are moved to 'Done'.",
      restoreBtn: "Restore Defaults",
      saveBtn: "Save Changes"
    },
    projectGrid: {
      header: "My Projects",
      subHeader: "Select a folder to manage your tasks and workflows.",
      newProjectBtn: "New Project",
      dialogTitle: "Create In Workspace",
      dialogSub: "Define the name and purpose of your new board.",
      nameLabel: "Project Name",
      namePlaceholder: "Ex: Marketing 2024",
      descLabel: "Description",
      descPlaceholder: "Brief project summary...",
      createBtn: "Create Folder",
      emptyTitle: "No projects found",
      emptySub: "Start by creating your first workspace folder to organize your tasks."
    }
  }
};
