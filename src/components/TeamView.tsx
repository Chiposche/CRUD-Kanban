import React from 'react';
import { motion } from 'motion/react';
import { Mail, Github, Twitter, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TEAM_MEMBERS = [
  {
    name: 'Alex Rivera',
    role: 'Lead Architect',
    status: 'online',
    avatar: 'AR',
    color: 'bg-indigo-500',
    bio: 'Product focus and system architecture design.',
    social: { github: '#', twitter: '#', email: '#' }
  },
  {
    name: 'Sofia Chen',
    role: 'Frontend Engineer',
    status: 'away',
    avatar: 'SC',
    color: 'bg-emerald-500',
    bio: 'Specialist in React and Motion layout systems.',
    social: { github: '#', twitter: '#', email: '#' }
  },
  {
    name: 'Jordan Smith',
    role: 'UI Designer',
    status: 'offline',
    avatar: 'JS',
    color: 'bg-amber-500',
    bio: 'Crafting minimalist and functional experiences.',
    social: { github: '#', twitter: '#', email: '#' }
  },
  {
    name: 'Marcus Vane',
    role: 'Backend Dev',
    status: 'online',
    avatar: 'MV',
    color: 'bg-rose-500',
    bio: 'Database optimization and API scalability.',
    social: { github: '#', twitter: '#', email: '#' }
  }
];

export function TeamView() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Equipe do Projeto</h2>
          <p className="text-zinc-500 text-sm">Colaboradores ativos e seus status atuais no workspace.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className={`w-20 h-20 ${member.color} rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl ring-4 ring-zinc-950`}>
                        {member.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-zinc-950 ${
                        member.status === 'online' ? 'bg-emerald-500' : 
                        member.status === 'away' ? 'bg-amber-500' : 'bg-zinc-700'
                      }`} />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{member.name}</h3>
                    <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">{member.role}</p>
                    
                    <p className="text-sm text-zinc-400 mb-6 line-clamp-2 italic">
                      "{member.bio}"
                    </p>

                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800">
                        <Github className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800">
                        <Twitter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-700 hover:text-zinc-400 cursor-pointer" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <section className="mt-16 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Deseja expandir a equipe?</h3>
            <p className="text-zinc-500 text-sm">Convide novos membros para colaborar neste quadro em tempo real.</p>
          </div>
          <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-8 h-12 rounded-xl shadow-lg shadow-white/5">
            Convidar Membros
          </Button>
        </section>
      </div>
    </div>
  );
}
