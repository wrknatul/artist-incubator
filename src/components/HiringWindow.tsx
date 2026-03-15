import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Loader2, Star, X, UserPlus, Briefcase, GraduationCap, Heart, AlertTriangle, Zap, Users, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  type EmployeeCandidate,
  type HiredEmployee,
  ROLE_INFO,
  type EmployeeRole,
  EDUCATION_LABELS,
  MOTIVATION_LABELS,
  WORK_STYLE_LABELS,
  SOCIAL_TYPE_LABELS,
  VICE_LABELS,
  buildInterviewSystemPrompt,
} from '@/lib/hiringSystem';
import { toast } from 'sonner';

const CHAT_CLIENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-client`;

interface HiringWindowProps {
  candidates: EmployeeCandidate[];
  employees: HiredEmployee[];
  balance: number;
  onHire: (candidate: EmployeeCandidate, agreedSalary: number) => void;
  onRefreshCandidates: () => void;
  onClose: () => void;
}

interface InterviewMessage {
  role: 'user' | 'candidate';
  content: string;
}

type View = 'list' | 'profile' | 'interview';

function TraitBar({ label, value, color = 'bg-primary' }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value * 10}%` }} />
      </div>
      <span className="text-[10px] font-mono text-foreground w-4 text-right">{value}</span>
    </div>
  );
}

function TagBadge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'warning' | 'good' | 'danger' }) {
  const colors = {
    default: 'bg-secondary text-muted-foreground',
    good: 'bg-primary/10 text-primary border border-primary/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    danger: 'bg-destructive/10 text-destructive border border-destructive/20',
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${colors[variant]}`}>{children}</span>;
}

export function HiringWindow({ candidates, employees, balance, onHire, onRefreshCandidates, onClose }: HiringWindowProps) {
  const [view, setView] = useState<View>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | 'all'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<EmployeeCandidate | null>(null);

  // Interview state
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredCandidates = candidates.filter(c => {
    const matchesRole = roleFilter === 'all' || c.role === roleFilter;
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ROLE_INFO[c.role].label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.portfolio.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const openProfile = (c: EmployeeCandidate) => {
    setSelectedCandidate(c);
    setView('profile');
  };

  const startInterview = (c: EmployeeCandidate) => {
    setSelectedCandidate(c);
    const roleInfo = ROLE_INFO[c.role];
    setMessages([{
      role: 'candidate',
      content: `${c.avatar} Привет! Я ${c.name}, ${roleInfo.label.toLowerCase()}. ${c.bio}\n\nГотов обсудить условия!`,
    }]);
    setInput('');
    setView('interview');
  };

  const sendMessage = async (text: string) => {
    if (isLoading || !selectedCandidate) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const systemPrompt = buildInterviewSystemPrompt(selectedCandidate);
      const resp = await fetch(CHAT_CLIENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          clientName: selectedCandidate.name,
          clientAvatar: selectedCandidate.avatar,
          orderDescription: `Собеседование на позицию ${ROLE_INFO[selectedCandidate.role].label}`,
          orderPrompt: systemPrompt,
          clientProfile: null,
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })).concat([{ role: 'user', content: text }]),
        }),
      });

      if (!resp.ok) throw new Error('Failed');
      const data = await resp.json();
      let reply: string = data.message;

      const acceptMatch = reply.match(/\[ACCEPTED:(\d+)\]/);
      reply = reply.replace(/\[ACCEPTED:\d+\]/, '').replace(/\[REJECTED\]/, '').trim();

      setMessages(prev => [...prev, {
        role: 'candidate',
        content: `${selectedCandidate.avatar} ${reply}`,
      }]);

      if (acceptMatch) {
        const salary = parseInt(acceptMatch[1]);
        setTimeout(() => {
          onHire(selectedCandidate, salary);
          toast.success(`🎉 ${selectedCandidate.name} в команде! $${salary}/мес`);
          setView('list');
          setSelectedCandidate(null);
        }, 1500);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'candidate', content: '❌ Связь прервалась...' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSalaries = employees.reduce((s, e) => s + e.salary, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          {view !== 'list' && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setView('list'); setSelectedCandidate(null); }}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <UserPlus className="h-5 w-5 text-primary" />
          <h2 className="font-mono font-bold text-lg text-foreground">
            {view === 'list' ? 'Биржа кандидатов' : view === 'profile' ? selectedCandidate?.name : `Собеседование`}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-muted-foreground">
            Команда: <span className="text-foreground">{employees.length}</span> · Зарплаты: <span className="text-destructive">-${totalSalaries}/мес</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
              {/* Search & filters */}
              <div className="px-6 py-3 border-b space-y-2 bg-card/50">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Поиск по имени, роли, портфолио..."
                      className="w-full bg-muted border rounded-lg pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={onRefreshCandidates} className="text-xs">
                    🔄 Обновить
                  </Button>
                </div>
                <div className="flex gap-2">
                  {(['all', ...Object.keys(ROLE_INFO)] as (EmployeeRole | 'all')[]).map(role => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={`text-xs px-3 py-1 rounded-full font-mono transition-colors ${
                        roleFilter === role ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {role === 'all' ? 'Все' : `${ROLE_INFO[role].emoji} ${ROLE_INFO[role].label}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Candidate cards grid */}
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCandidates.map(c => {
                    const roleInfo = ROLE_INFO[c.role];
                    const alreadyHired = employees.some(e => e.name === c.name);
                    const p = c.personality;

                    return (
                      <motion.div
                        key={c.id}
                        whileHover={alreadyHired ? {} : { y: -2, boxShadow: '0 8px 30px -10px hsl(var(--primary) / 0.2)' }}
                        className={`rounded-xl border p-4 transition-colors ${
                          alreadyHired ? 'opacity-50 bg-muted/30' : 'bg-card hover:border-primary/30 cursor-pointer'
                        }`}
                        onClick={() => !alreadyHired && openProfile(c)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{c.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm text-foreground">{c.name}</span>
                              <span className={`text-xs font-mono ${roleInfo.color}`}>{roleInfo.emoji} {roleInfo.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{c.experience} · {EDUCATION_LABELS[p.education]}</p>
                            <p className="text-[11px] text-foreground/70 mt-1.5 line-clamp-2">{c.bio}</p>

                            {/* Quick stats */}
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-game-gold" />
                                <span className="text-[10px] font-mono text-game-gold">{p.talent}/10</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] font-mono text-foreground/70">${c.desiredSalary}/мес</span>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] text-muted-foreground">{MOTIVATION_LABELS[p.motivation]}</span>
                            </div>

                            {/* Tags */}
                            <div className="flex gap-1 flex-wrap mt-2">
                              <TagBadge variant={p.social_type === 'conflicting' ? 'danger' : p.social_type === 'teamplayer' ? 'good' : 'default'}>
                                {SOCIAL_TYPE_LABELS[p.social_type]}
                              </TagBadge>
                              <TagBadge variant={p.work_style === 'lazy' ? 'warning' : p.work_style === 'grinder' ? 'good' : 'default'}>
                                {WORK_STYLE_LABELS[p.work_style]}
                              </TagBadge>
                              {p.vice !== 'none' && (
                                <TagBadge variant="warning">{VICE_LABELS[p.vice]}</TagBadge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
                        </div>
                        {alreadyHired && <div className="text-xs text-primary font-mono mt-2 text-center">✅ В команде</div>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'profile' && selectedCandidate && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full overflow-auto">
              <div className="max-w-3xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{selectedCandidate.avatar}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{selectedCandidate.name}</h3>
                    <p className={`text-sm font-mono ${ROLE_INFO[selectedCandidate.role].color}`}>
                      {ROLE_INFO[selectedCandidate.role].emoji} {ROLE_INFO[selectedCandidate.role].label} · {selectedCandidate.experience}
                    </p>
                    <p className="text-sm text-foreground/70 mt-2">{selectedCandidate.bio}</p>
                    <p className="text-sm text-muted-foreground mt-1 italic">💬 «{selectedCandidate.quirk}»</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono font-bold text-game-gold">${selectedCandidate.desiredSalary}/мес</p>
                    <Button size="sm" className="mt-2" onClick={() => startInterview(selectedCandidate)}>
                      💬 Собеседование
                    </Button>
                  </div>
                </div>

                {/* Backstory */}
                <div className="bg-card border rounded-xl p-4">
                  <h4 className="text-sm font-mono font-bold text-foreground mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> История
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{selectedCandidate.backstory}</p>
                </div>

                {/* Two columns */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Work traits */}
                  <div className="bg-card border rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-mono font-bold text-foreground mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" /> Рабочие качества
                    </h4>
                    <TraitBar label="Талант" value={selectedCandidate.personality.talent} color="bg-primary" />
                    <TraitBar label="Дисциплина" value={selectedCandidate.personality.discipline} color="bg-blue-500" />
                    <TraitBar label="Креативность" value={selectedCandidate.personality.creativity} color="bg-purple-500" />
                    <TraitBar label="Стрессоуст." value={selectedCandidate.personality.stress_resistance} color="bg-green-500" />
                    <TraitBar label="Обучаемость" value={selectedCandidate.personality.learning_speed} color="bg-cyan-500" />
                  </div>

                  {/* Social traits */}
                  <div className="bg-card border rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-mono font-bold text-foreground mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Социальные качества
                    </h4>
                    <TraitBar label="Командность" value={selectedCandidate.personality.teamwork} color="bg-emerald-500" />
                    <TraitBar label="Конфликтность" value={selectedCandidate.personality.conflict_level} color={selectedCandidate.personality.conflict_level >= 7 ? 'bg-destructive' : 'bg-orange-500'} />
                    <TraitBar label="Лояльность" value={selectedCandidate.personality.loyalty} color="bg-pink-500" />
                    <TraitBar label="Амбиции" value={selectedCandidate.personality.ambition} color="bg-amber-500" />
                    <TraitBar label="Эмпатия" value={selectedCandidate.personality.empathy} color="bg-teal-500" />
                  </div>
                </div>

                {/* Profile tags */}
                <div className="bg-card border rounded-xl p-4">
                  <h4 className="text-sm font-mono font-bold text-foreground mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" /> Профиль
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <TagBadge>{EDUCATION_LABELS[selectedCandidate.personality.education]}</TagBadge>
                    <TagBadge>{MOTIVATION_LABELS[selectedCandidate.personality.motivation]}</TagBadge>
                    <TagBadge variant={selectedCandidate.personality.work_style === 'lazy' ? 'warning' : selectedCandidate.personality.work_style === 'grinder' ? 'good' : 'default'}>
                      {WORK_STYLE_LABELS[selectedCandidate.personality.work_style]}
                    </TagBadge>
                    <TagBadge variant={selectedCandidate.personality.social_type === 'conflicting' ? 'danger' : selectedCandidate.personality.social_type === 'teamplayer' ? 'good' : 'default'}>
                      {SOCIAL_TYPE_LABELS[selectedCandidate.personality.social_type]}
                    </TagBadge>
                    {selectedCandidate.personality.vice !== 'none' && (
                      <TagBadge variant="warning">⚠️ {VICE_LABELS[selectedCandidate.personality.vice]}</TagBadge>
                    )}
                  </div>
                </div>

                {/* Portfolio */}
                <div className="bg-card border rounded-xl p-4">
                  <h4 className="text-sm font-mono font-bold text-foreground mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-game-gold" /> Портфолио
                  </h4>
                  <div className="space-y-2">
                    {selectedCandidate.portfolio.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                        <span className="text-primary">▸</span> {p}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {(selectedCandidate.personality.conflict_level >= 7 || selectedCandidate.personality.vice !== 'none' || selectedCandidate.personality.loyalty <= 3) && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                    <h4 className="text-sm font-mono font-bold text-destructive mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Риски
                    </h4>
                    <div className="space-y-1 text-xs text-destructive/80">
                      {selectedCandidate.personality.conflict_level >= 7 && (
                        <p>⚡ Высокая конфликтность — может создавать напряжение в команде</p>
                      )}
                      {selectedCandidate.personality.loyalty <= 3 && (
                        <p>🚪 Низкая лояльность — высокий риск ухода</p>
                      )}
                      {selectedCandidate.personality.vice === 'procrastinator' && (
                        <p>⏰ Прокрастинатор — может срывать дедлайны</p>
                      )}
                      {selectedCandidate.personality.vice === 'overworker' && (
                        <p>🔥 Склонен к выгоранию — может резко потерять продуктивность</p>
                      )}
                      {selectedCandidate.personality.vice === 'job_hopper' && (
                        <p>🦘 Летун — быстро теряет интерес и уходит</p>
                      )}
                      {selectedCandidate.personality.vice === 'arrogant' && (
                        <p>👃 Высокомерный — трудно работает с менее опытными коллегами</p>
                      )}
                      {selectedCandidate.personality.vice === 'gossiper' && (
                        <p>🗣️ Сплетник — может снижать моральный дух команды</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'interview' && selectedCandidate && (
            <motion.div key="interview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
              {/* Interview header */}
              <div className="px-6 py-3 border-b bg-card/50 flex items-center gap-3">
                <span className="text-2xl">{selectedCandidate.avatar}</span>
                <div>
                  <h3 className="font-mono text-sm font-bold text-foreground">{selectedCandidate.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_INFO[selectedCandidate.role].emoji} {ROLE_INFO[selectedCandidate.role].label} · ${selectedCandidate.desiredSalary}/мес
                  </p>
                </div>
                <div className="flex-1" />
                <div className="flex gap-1 flex-wrap max-w-xs">
                  <TagBadge>{WORK_STYLE_LABELS[selectedCandidate.personality.work_style]}</TagBadge>
                  <TagBadge variant={selectedCandidate.personality.social_type === 'conflicting' ? 'danger' : 'default'}>
                    {SOCIAL_TYPE_LABELS[selectedCandidate.personality.social_type]}
                  </TagBadge>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
                <div className="max-w-2xl mx-auto space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`text-sm rounded-xl px-4 py-3 max-w-[80%] ${
                        msg.role === 'user'
                          ? 'bg-primary/10 text-primary ml-auto border border-primary/20'
                          : 'bg-accent/50 text-accent-foreground border border-accent/20'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="font-mono">Печатает...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="px-6 py-3 border-t bg-card/50">
                <div className="max-w-2xl mx-auto flex gap-3">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && input.trim() && sendMessage(input.trim()) && setInput('')}
                    placeholder="Обсудить условия, задать вопросы..."
                    className="flex-1 bg-muted border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => { if (input.trim()) { sendMessage(input.trim()); setInput(''); } }}
                    disabled={isLoading || !input.trim()}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" /> Отправить
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
