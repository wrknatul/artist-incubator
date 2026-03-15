import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Home, MessageCircle, Send, Loader2, Eye, HandCoins, Users, Video, UserPlus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FreelanceOrder } from '@/lib/gameData';
import { buildClientSystemPrompt } from '@/lib/clientSystem';
import { BargainMiniGame } from './BargainMiniGame';
import { AvatarVideoCall } from './AvatarVideoCall';
import { HiringPanel } from './HiringPanel';
import type { EmployeeCandidate, HiredEmployee } from '@/lib/hiringSystem';

export interface Expense {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  type: 'recurring' | 'oneoff';
  owned: boolean;
  description: string;
  category: 'housing' | 'luxury' | 'gear';
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  online: boolean;
  role: string;
}

const CONTACTS: Contact[] = [
  { id: 'mom', name: 'Мама', avatar: '👩', lastMessage: 'Ты покушал?', online: true, role: 'Семья' },
  { id: 'friend_dev', name: 'Дима Кодер', avatar: '👨‍💻', lastMessage: 'Го в доту?', online: true, role: 'Друг-разработчик' },
  { id: 'friend_designer', name: 'Аня Дизайнер', avatar: '👩‍🎨', lastMessage: 'Скинь макет', online: false, role: 'Знакомая дизайнерка' },
  { id: 'landlord', name: 'Арендодатель', avatar: '🏠', lastMessage: 'Аренда через 3 дня', online: false, role: 'Арендодатель' },
];

interface ClientMessage {
  role: 'user' | 'client';
  content: string;
}

const CHAT_CLIENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-client`;

interface PhoneMenuProps {
  balance: number;
  monthlyExpenses: number;
  ownedItems: string[];
  onPurchase: (item: Expense) => void;
  currentOrder: FreelanceOrder | null;
  generatedHtml: string | null;
  onClientPreview: (rating: number | null) => void;
  consultationCount: number;
  onBargainResult?: (newBudget: number) => void;
  averageRating: number;
  // Hiring
  studioUnlocked: boolean;
  candidates: EmployeeCandidate[];
  employees: HiredEmployee[];
  onHire: (candidate: EmployeeCandidate, salary: number) => void;
  onRefreshCandidates: () => void;
  // Admin
  onAdminAddMoney: (amount: number) => void;
  onAdminUnlockStudio: () => void;
}

export function PhoneMenu({ balance, monthlyExpenses, ownedItems, onPurchase, currentOrder, generatedHtml, onClientPreview, consultationCount, onBargainResult, averageRating, studioUnlocked, candidates, employees, onHire, onRefreshCandidates, onAdminAddMoney, onAdminUnlockStudio }: PhoneMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'expenses' | 'contacts' | 'hiring' | 'admin'>('orders');
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasBargained, setHasBargained] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat when order changes
  useEffect(() => {
    if (currentOrder) {
      const profile = currentOrder.clientProfile;
      const greeting = profile?.dialogueTemplates?.greeting
        || `Привет! Я ${currentOrder.clientName}. ${currentOrder.description}`;
      setMessages([{
        role: 'client',
        content: `${currentOrder.clientAvatar} ${greeting}\n\nМожешь уточнить детали, если нужно 👋`,
      }]);
      setActiveTab('orders');
      setHasBargained(false);
    } else {
      setMessages([]);
    }
  }, [currentOrder?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (userText: string, previewHtml?: string) => {
    if (isLoading || !currentOrder) return;
    const userMsg: ClientMessage = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_CLIENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          clientName: currentOrder.clientName,
          clientAvatar: currentOrder.clientAvatar,
          orderDescription: currentOrder.description,
          orderPrompt: currentOrder.prompt,
          clientProfile: currentOrder.clientProfile || null,
          previewHtml: previewHtml || undefined,
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })).concat([{ role: 'user', content: userText }]),
        }),
      });
      if (!resp.ok) throw new Error('Failed');
      const data = await resp.json();
      setMessages(prev => [...prev, { role: 'client', content: `${currentOrder.clientAvatar} ${data.message}` }]);
      if (previewHtml && data.rating !== undefined) {
        onClientPreview(data.rating);
      } else if (!previewHtml) {
        onClientPreview(null);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'client', content: '❌ Не удалось связаться...' }]);
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

  const handleShowPreview = () => {
    if (!generatedHtml) return;
    sendMessage('Посмотрите, пожалуйста, что получилось. Вот превью сайта:', generatedHtml);
  };

  const [showBargainGame, setShowBargainGame] = useState(false);

  const handleBargain = () => {
    if (!currentOrder?.clientProfile || hasBargained) return;
    setShowBargainGame(true);
  };

  const handleBargainComplete = (success: boolean, newBudget: number) => {
    setShowBargainGame(false);
    setHasBargained(true);

    if (success) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: '💰 Мне кажется, бюджет стоит пересмотреть. Работа сложнее, чем кажется.' },
        { role: 'client', content: `${currentOrder!.clientAvatar} Ладно, убедил. Поднимаем бюджет.\n\n✅ Новый бюджет: $${newBudget}` },
      ]);
      onBargainResult?.(newBudget);
    } else {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: '💰 Мне кажется, бюджет стоит пересмотреть. Работа сложнее, чем кажется.' },
        { role: 'client', content: `${currentOrder!.clientAvatar} Нет, цена и так нормальная.\n\n❌ Бюджет остаётся прежним.` },
      ]);
    }
  };

  const RECURRING_EXPENSES = [
    { name: 'Аренда квартиры', emoji: '🏠', cost: 200 },
    { name: 'Интернет', emoji: '📡', cost: 30 },
    { name: 'Еда', emoji: '🍔', cost: 100 },
    ...(ownedItems.includes('cat') ? [{ name: 'Корм для кота', emoji: '🐱', cost: 30 }] : []),
    ...employees.map(e => ({ name: `ЗП: ${e.name}`, emoji: '👤', cost: e.salary })),
  ];
  const totalRecurring = RECURRING_EXPENSES.reduce((s, e) => s + e.cost, 0);

  const hasUnreadOrder = currentOrder && consultationCount === 0;

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
      >
        <Smartphone className="h-6 w-6" />
        {hasUnreadOrder && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[560px] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <span className="font-mono font-bold text-sm text-foreground">Телефон</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 py-2 text-xs font-mono flex items-center justify-center gap-1 transition-colors relative ${
                    activeTab === 'orders' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
                  }`}
                >
                  <MessageCircle className="h-3 w-3" /> Заказы
                  {hasUnreadOrder && (
                    <span className="absolute top-1 right-2 h-2 w-2 bg-destructive rounded-full" />
                  )}
                </button>
                {studioUnlocked && (
                  <button
                    onClick={() => setActiveTab('hiring')}
                    className={`flex-1 py-2 text-xs font-mono flex items-center justify-center gap-1 transition-colors ${
                      activeTab === 'hiring' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <UserPlus className="h-3 w-3" /> Наём
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`flex-1 py-2 text-xs font-mono flex items-center justify-center gap-1 transition-colors ${
                    activeTab === 'contacts' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Users className="h-3 w-3" /> Контакты
                </button>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`flex-1 py-2 text-xs font-mono flex items-center justify-center gap-1 transition-colors ${
                    activeTab === 'expenses' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Home className="h-3 w-3" /> Расходы
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`py-2 px-2 text-xs font-mono flex items-center justify-center gap-1 transition-colors ${
                    activeTab === 'admin' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground/50'
                  }`}
                >
                  <Settings className="h-3 w-3" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto min-h-0 flex flex-col">
                {activeTab === 'orders' ? (
                  currentOrder ? (
                    <div className="flex flex-col flex-1 min-h-0">
                      {/* Client header */}
                      <div className="px-3 py-2 border-b flex items-center gap-2 bg-secondary/30">
                        <span className="text-xl">{currentOrder.clientAvatar}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-mono text-xs font-semibold text-card-foreground">{currentOrder.clientName}</h3>
                          <p className="text-[10px] text-muted-foreground truncate">{currentOrder.title}</p>
                        </div>
                        {currentOrder.runwayAvatarId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-primary hover:bg-primary/10"
                            onClick={() => setShowVideoCall(true)}
                            title="Видеозвонок"
                          >
                            <Video className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <span className="text-xs font-mono text-game-gold">${currentOrder.budget}</span>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-auto p-3 space-y-2" style={{ maxHeight: '280px' }}>
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
                      <div className="p-2 border-t space-y-1.5">
                        <div className="flex gap-1.5">
                          {generatedHtml && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-game-xp/50 text-game-xp hover:bg-game-xp/10 text-[10px] h-7 px-2"
                              onClick={handleShowPreview}
                              disabled={isLoading}
                            >
                              <Eye className="h-3 w-3 mr-0.5" />
                              Превью
                            </Button>
                          )}
                          {!hasBargained && currentOrder.clientProfile && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-game-gold/50 text-game-gold hover:bg-game-gold/10 text-[10px] h-7 px-2"
                              onClick={handleBargain}
                              disabled={isLoading}
                            >
                              <HandCoins className="h-3 w-3 mr-0.5" />
                              Торг
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Написать..."
                            className="flex-1 bg-muted border rounded-md px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                            disabled={isLoading}
                          />
                          <Button size="icon" variant="ghost" onClick={handleSend} disabled={isLoading || !input.trim()} className="h-7 w-7">
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6">
                      <div className="text-center text-muted-foreground">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-mono">Нет активных заказов</p>
                        <p className="text-[10px] mt-1">Возьми заказ на бирже</p>
                      </div>
                    </div>
                  )
                ) : activeTab === 'hiring' && studioUnlocked ? (
                  <HiringPanel
                    candidates={candidates}
                    employees={employees}
                    balance={balance}
                    onHire={onHire}
                    onRefreshCandidates={onRefreshCandidates}
                  />
                ) : activeTab === 'contacts' ? (
                  <div className="p-3 space-y-1">
                    {CONTACTS.map((contact) => (
                      <motion.div
                        key={contact.id}
                        whileHover={{ x: 2 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <div className="relative">
                          <span className="text-2xl">{contact.avatar}</span>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                            contact.online ? 'bg-green-500' : 'bg-muted-foreground/30'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{contact.name}</span>
                            <span className="text-[10px] text-muted-foreground">{contact.role}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                        </div>
                      </motion.div>
                    ))}
                    <div className="pt-3 border-t mt-3">
                      <p className="text-[10px] text-muted-foreground text-center font-mono">
                        💬 Чаты с контактами скоро будут доступны
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    <div className="text-xs text-muted-foreground font-mono mb-2">Ежемесячные расходы</div>
                    {RECURRING_EXPENSES.map((exp) => (
                      <div key={exp.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{exp.emoji}</span>
                          <span className="text-sm text-foreground">{exp.name}</span>
                        </div>
                        <span className="text-sm font-mono text-destructive">-${exp.cost}/мес</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">Итого:</span>
                      <span className="text-sm font-mono font-bold text-destructive">-${totalRecurring}/мес</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Balance footer */}
              <div className="p-3 border-t bg-secondary/30 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">Баланс:</span>
                <span className="text-sm font-mono font-bold text-game-gold">${balance}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBargainGame && currentOrder && (
          <BargainMiniGame
            clientName={currentOrder.clientName}
            clientAvatar={currentOrder.clientAvatar}
            currentBudget={currentOrder.budget}
            averageRating={averageRating}
            onComplete={handleBargainComplete}
            onClose={() => setShowBargainGame(false)}
          />
        )}
      </AnimatePresence>

      {showVideoCall && currentOrder?.runwayAvatarId && (
        <AvatarVideoCall
          avatarId={currentOrder.runwayAvatarId}
          clientName={currentOrder.clientName}
          clientAvatar={currentOrder.clientAvatar}
          onEnd={() => setShowVideoCall(false)}
        />
      )}
    </>
  );
}
