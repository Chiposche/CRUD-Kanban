import React from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Bell, Database, Globe, User, Palette, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SettingsView() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Configurações do Workspace</h2>
          <p className="text-zinc-500 text-sm">Gerencie suas preferências de interface, notificações e integrações de dados.</p>
        </header>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <User className="h-3.5 w-3.5" /> Perfil & Conta
            </h3>
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl rounded-2xl overflow-hidden divide-y divide-zinc-800">
              <SettingItem 
                icon={<Globe className="text-zinc-400" />} 
                title="Idioma do Sistema" 
                description="Selecione o idioma padrão para o quadro e comunicações."
                action={<Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300">Alterar</Button>}
              />
              <SettingItem 
                icon={<Shield className="text-zinc-400" />} 
                title="Segurança de Dados" 
                description="Gerencie permissões de acesso e chaves de API do banco de dados PostgreSQL."
                action={<Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300">Configurar</Button>}
              />
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Palette className="h-3.5 w-3.5" /> Preferências Visuais
            </h3>
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl rounded-2xl overflow-hidden divide-y divide-zinc-800">
              <SettingToggle 
                icon={<Palette className="text-zinc-400" />} 
                title="Modo Escuro Avançado" 
                description="Usa variações de cores oklch para melhor contraste em telas OLED."
                defaultEnabled={true}
              />
              <SettingToggle 
                icon={<Zap className="text-zinc-400" />} 
                title="Animações de Layout" 
                description="Ativa transições fluidas entre estados de tarefas e rotas."
                defaultEnabled={true}
              />
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Database className="h-3.5 w-3.5" /> Integrações & Sincronização
            </h3>
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl rounded-2xl overflow-hidden divide-y divide-zinc-800">
              <SettingItem 
                icon={<Database className="text-zinc-400" />} 
                title="PostgreSQL Connect" 
                description="Status da conexão direta com o banco de dados Supabase/Postgres."
                action={<span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold">ATIVO</span>}
              />
              <SettingToggle 
                icon={<Bell className="text-zinc-400" />} 
                title="Notificações Push" 
                description="Receba alertas quando tarefas forem movidas para 'Concluído'."
                defaultEnabled={false}
              />
            </Card>
          </section>
        </div>

        <div className="mt-12 flex justify-end gap-3">
          <Button variant="ghost" className="text-zinc-500 hover:text-white rounded-xl">Restaurar Padrões</Button>
          <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-8 h-11 rounded-xl shadow-lg shadow-white/5">Salvar Alterações</Button>
        </div>
      </div>
    </div>
  );
}

function SettingItem({ icon, title, description, action }: any) {
  return (
    <div className="p-6 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-0.5">{title}</h4>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-md">{description}</p>
        </div>
      </div>
      <div>{action}</div>
    </div>
  );
}

function SettingToggle({ icon, title, description, defaultEnabled }: any) {
  const [enabled, setEnabled] = React.useState(defaultEnabled);
  return (
    <div className="p-6 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-0.5">{title}</h4>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-md">{description}</p>
        </div>
      </div>
      <button 
        onClick={() => setEnabled(!enabled)}
        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${enabled ? 'bg-indigo-600' : 'bg-zinc-800'}`}
      >
        <motion.div 
          animate={{ x: enabled ? 20 : 0 }}
          className="w-4 h-4 bg-white rounded-full shadow-sm" 
        />
      </button>
    </div>
  );
}
