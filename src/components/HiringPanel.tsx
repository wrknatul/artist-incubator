import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Loader2, Star, Briefcase, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  type EmployeeCandidate,
  type HiredEmployee,
  ROLE_INFO,
  type EmployeeRole,
  buildInterviewSystemPrompt,
} from '@/lib/hiringSystem';
import { toast } from 'sonner';

const CHAT_CLIENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-client`;

interface HiringPanelProps {
  candidates: EmployeeCandidate[];
  employees: HiredEmployee[];
  balance: number;
  onHire: (candidate: EmployeeCandidate, agreedSalary: number) => void;
  onRefreshCandidates: () => void;
}

interface InterviewMessage {
  role: 'user' | 'candidate';
  content: string;
}

export function HiringPanel({ candidates, employees, balance, onHire, onRefreshCandidates }: HiringPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | 'all'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<EmployeeCandidate | null>(null);
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

  const startInterview = (candidate: EmployeeCandidate) => {
    setSelectedCandidate(candidate);
    const roleInfo = ROLE_INFO[candidate.role];
    setMessages([{
      role: 'candidate',
      content: `${candidate.avatar} Привет! Я ${candidate.name}, ${roleInfo.label.toLowerCase()}. ${candidate.bio}\n\nЧем могу быть полезен?`,
    }]);
    setInput('');
  };

  const sendMessage = async (text: string) => {
    if (isLoading || !selectedCandidate) return;

    const userMsg: InterviewMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
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

      // Check for acceptance/rejection tags
      const acceptMatch = reply.match(/\[ACCEPTED:(\d+)\]/);
      const rejectMatch = reply.match(/\[REJECTED\]/);

      // Remove tags from display
      reply = reply.replace(/\[ACCEPTED:\d+\]/, '').replace(/\[REJECTED\]/, '').trim();

      setMessages(prev => [...prev, {
        role: 'candidate',
        content: `${selectedCandidate.avatar} ${reply}`,
      }]);

      if (acceptMatch) {
        const salary = parseInt(acceptMatch[1]);
        setTimeout(() => {
          onHire(selectedCandidate, salary);
          setSelectedCandidate(null);
          toast.success(`🎉 ${selectedCandidate.name} принят в команду! Зарплата: $${salary}/мес`);
        }, 1500);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'candidate',
        content: '❌ Связь прервалась...',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    sendMessage(text);
  };

  const totalSalaries = employees.reduce((s, e) => s + e.salary, 0);

  // If in interview mode
  if (selectedCandidate) {
    const roleInfo = ROLE_INFO[selectedCandidate.role];
    return (
      <div className="flex flex-col h-full">
        {/* Interview header */}
        <div className="px-3 py-2 border-b flex items-center gap-2 bg-secondary/30">
          <button onClick={() => setSelectedCandidate(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
          <span className="text-xl">{selectedCandidate.avatar}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-xs font-semibold text-card-foreground">{selectedCandidate.name}</h3>
            <p className="text-[10px] text-muted-foreground">{roleInfo.emoji} {roleInfo.label} · ${selectedCandidate.desiredSalary}/мес</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-3 space-y-2" style={{ maxHeight: '300px' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-xs rounded-lg px-3 py-2 max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-primary/10 text-primary ml-auto border border-primary/20'
                  : 'bg-accent/50 text-accent-foreground border border-accent/20'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="font-mono">Печатает...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-2 border-t">
          <div className="flex gap-1.5">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Обсудить условия..."
              className="flex-1 bg-muted border rounded-md px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              disabled={isLoading}
            />
            <Button size="icon" variant="ghost" onClick={handleSend} disabled={isLoading || !input.trim()} className="h-7 w-7">
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Current team summary */}
      {employees.length > 0 && (
        <div className="px-3 py-2 border-b bg-primary/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-muted-foreground">Команда ({employees.length})</span>
            <span className="text-[10px] font-mono text-destructive">-${totalSalaries}/мес</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {employees.map(e => (
              <span key={e.id} className="text-xs bg-secondary/50 rounded px-1.5 py-0.5 font-mono">
                {ROLE_INFO[e.role].emoji} {e.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-3 py-2 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск кандидатов..."
            className="w-full bg-muted border rounded-md pl-7 pr-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setRoleFilter('all')}
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
              roleFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            Все
          </button>
          {(Object.keys(ROLE_INFO) as EmployeeRole[]).map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                roleFilter === role ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {ROLE_INFO[role].emoji} {ROLE_INFO[role].label}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates list */}
      <div className="flex-1 overflow-auto p-2 space-y-1.5">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="h-6 w-6 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-mono">Кандидаты не найдены</p>
          </div>
        ) : (
          filteredCandidates.map(candidate => {
            const roleInfo = ROLE_INFO[candidate.role];
            const skillAvg = Math.round((candidate.skills.quality + candidate.skills.speed + candidate.skills.reliability + candidate.skills.communication) / 4 * 10) / 10;
            const alreadyHired = employees.some(e => e.name === candidate.name);

            return (
              <motion.div
                key={candidate.id}
                whileHover={{ x: 2 }}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  alreadyHired
                    ? 'bg-muted/30 border-muted opacity-50 cursor-default'
                    : 'bg-card hover:bg-secondary/50 border-border hover:border-primary/30'
                }`}
                onClick={() => !alreadyHired && startInterview(candidate)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl mt-0.5">{candidate.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{candidate.name}</span>
                      <span className={`text-[10px] font-mono ${roleInfo.color}`}>{roleInfo.emoji} {roleInfo.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{candidate.experience}</p>

                    {/* Skills mini-bar */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 text-game-gold" />
                        <span className="text-[10px] font-mono text-game-gold">{skillAvg}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] font-mono text-foreground/70">${candidate.desiredSalary}/мес</span>
                    </div>

                    {/* Portfolio preview */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {candidate.portfolio.slice(0, 2).map((p, i) => (
                        <span key={i} className="text-[9px] bg-secondary/70 text-muted-foreground rounded px-1.5 py-0.5 truncate max-w-[140px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {alreadyHired && (
                  <div className="text-[10px] text-primary font-mono mt-1 text-center">✅ В команде</div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Refresh button */}
      <div className="p-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshCandidates}
          className="w-full text-[10px] h-7"
        >
          🔄 Обновить кандидатов
        </Button>
      </div>
    </div>
  );
}
