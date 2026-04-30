import React from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Bell, Database, Globe, User, Palette, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { translations, Language } from '../lib/i18n';

interface SettingsViewProps {
  lang: Language;
}

export function SettingsView({ lang }: SettingsViewProps) {
  const t = translations[lang].settings;
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">{t.header}</h2>
          <p className="text-zinc-500 text-sm">{t.subHeader}</p>
        </header>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <User className="h-3.5 w-3.5" /> {t.profileSection}
            </h3>
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl rounded-2xl overflow-hidden divide-y divide-zinc-800">
              <SettingItem 
                icon={<Globe className="text-zinc-400" />} 
                title={t.langTitle} 
                description={t.langDesc}
                action={<Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300">{t.changeBtn}</Button>}
              />
              <SettingItem 
                icon={<Shield className="text-zinc-400" />} 
                title={t.securityTitle} 
                description={t.securityDesc}
                action={<Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300">{t.configureBtn}</Button>}
              />
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Palette className="h-3.5 w-3.5" /> {t.visualSection}
            </h3>
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl rounded-2xl overflow-hidden divide-y divide-zinc-800">
              <SettingToggle 
                icon={<Palette className="text-zinc-400" />} 
                title={t.darkModeTitle} 
                description={t.darkModeDesc}
                defaultEnabled={true}
              />
              <SettingToggle 
                icon={<Zap className="text-zinc-400" />} 
                title={t.animationsTitle} 
                description={t.animationsDesc}
                defaultEnabled={true}
              />
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Database className="h-3.5 w-3.5" /> {t.integrationsSection}
            </h3>
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl rounded-2xl overflow-hidden divide-y divide-zinc-800">
              <SettingItem 
                icon={<Database className="text-zinc-400" />} 
                title={t.postgresTitle} 
                description={t.postgresDesc}
                action={<span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold">{t.activeStatus}</span>}
              />
              <SettingToggle 
                icon={<Bell className="text-zinc-400" />} 
                title={t.notificationsTitle} 
                description={t.notificationsDesc}
                defaultEnabled={false}
              />
            </Card>
          </section>
        </div>

        <div className="mt-12 flex justify-end gap-3">
          <Button variant="ghost" className="text-zinc-500 hover:text-white rounded-xl">{t.restoreBtn}</Button>
          <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-8 h-11 rounded-xl shadow-lg shadow-white/5">{t.saveBtn}</Button>
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
