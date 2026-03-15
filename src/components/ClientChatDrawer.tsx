import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Loader2, X, Eye } from 'lucide-react';
import type { FreelanceOrder } from '@/lib/gameData';

interface ClientMessage {
  role: 'user' | 'client';
  content: string;
}

interface ClientChatDrawerProps {
  order: FreelanceOrder;
  generatedHtml: string | null;
  onClientPreview: (rating: number | null) => void;
  consultationCount: number;
}

const CHAT_CLIENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-client`;

export function ClientChatDrawer({ order, generatedHtml, onClientPreview, consultationCount }: ClientChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ClientMessage[]>([
    {
      role: 'client',
      content: `Привет! Я ${order.clientName}. ${order.description}\n\nМожешь уточнить детали, если нужно 👋`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreviewBtn, setShowPreviewBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setShowPreviewBtn(!!generatedHtml);
  }, [generatedHtml]);

  const sendMessage = async (userText: string, previewHtml?: string) => {
    if (isLoading) return;

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
          clientName: order.clientName,
          clientAvatar: order.clientAvatar,
          orderDescription: order.description,
          orderPrompt: order.prompt,
          clientProfile: order.clientProfile || null,
          previewHtml: previewHtml || undefined,
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })).concat([{ role: 'user', content: userText }]),
        }),
      });

      if (!resp.ok) throw new Error('Failed');

      const data = await resp.json();
      setMessages(prev => [...prev, { role: 'client', content: `${order.clientAvatar} ${data.message}` }]);

      if (previewHtml && data.rating !== undefined) {
        onClientPreview(data.rating);
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

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.4)' }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!isOpen && consultationCount === 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full animate-pulse" />
        )}
      </button>

      {/* Drawer */}
      <div
        className={`fixed bottom-24 left-6 z-40 w-[360px] max-h-[500px] bg-card border rounded-xl shadow-2xl flex flex-col transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <span className="text-2xl">{order.clientAvatar}</span>
          <div>
            <h3 className="font-mono text-sm font-semibold text-card-foreground">{order.clientName}</h3>
            <p className="text-xs text-muted-foreground">Заказчик</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-3 space-y-2 min-h-0" style={{ maxHeight: '320px' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
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
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="font-mono">Печатает...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Actions */}
        <div className="p-3 border-t space-y-2">
          {showPreviewBtn && (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-game-xp/50 text-game-xp hover:bg-game-xp/10"
              onClick={handleShowPreview}
              disabled={isLoading}
            >
              <Eye className="h-3 w-3 mr-2" />
              Показать превью заказчику
            </Button>
          )}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Написать заказчику..."
              className="flex-1 bg-muted border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              disabled={isLoading}
            />
            <Button size="icon" variant="ghost" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
