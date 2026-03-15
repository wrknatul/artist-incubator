import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import type { FreelanceOrder } from '@/lib/gameData';

interface Message {
  role: 'user' | 'assistant' | 'client';
  content: string;
}

interface ChatPanelProps {
  order: FreelanceOrder;
  onHtmlGenerated: (html: string) => void;
  onSubmitProject: () => void;
  onAbandon: () => void;
  maxMessages: number;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-site`;

export function ChatPanel({ order, onHtmlGenerated, onSubmitProject, onAbandon, maxMessages }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const messagesLeft = maxMessages - userMessageCount;
  const isOutOfMessages = messagesLeft <= 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isOutOfMessages) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          userMessage,
          messages: messages.filter(m => m.role !== 'client').map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
      });

      if (!resp.ok) {
        throw new Error('Failed to generate');
      }

      const data = await resp.json();

      if (data.html) {
        onHtmlGenerated(data.html);
        setHasGenerated(true);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || 'Готово! Сайт сгенерирован. Посмотри превью справа →',
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || 'Что-то пошло не так...',
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Ошибка генерации. Попробуй ещё раз.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAbandon} title="Отказаться от заказа">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-mono text-sm font-semibold text-primary">
              {'>'} Рабочий чат
            </h2>
          </div>
          <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
            messagesLeft <= 1 ? 'text-destructive border-destructive/30 bg-destructive/10' 
            : messagesLeft <= 2 ? 'text-game-gold border-game-gold/30 bg-game-gold/10'
            : 'text-muted-foreground border-border bg-secondary'
          }`}>
            ✉️ {messagesLeft}/{maxMessages}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{order.title}</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm rounded-lg px-3 py-2 max-w-[90%] ${
              msg.role === 'user'
                ? 'bg-primary/10 text-primary ml-auto border border-primary/20'
                : msg.role === 'client'
                ? 'bg-game-gold/10 text-game-gold border border-game-gold/20'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="font-mono">Генерирую...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t space-y-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isOutOfMessages ? 'Сообщения закончились! Сдавай проект.' : 'Опиши что нужно сделать...'}
            className="flex-1 bg-muted border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono disabled:opacity-50"
            disabled={isLoading || isOutOfMessages}
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim() || isOutOfMessages}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {hasGenerated && (
          <Button
            variant="outline"
            className="w-full border-game-gold/50 text-game-gold hover:bg-game-gold/10"
            onClick={onSubmitProject}
          >
            📦 Сдать проект заказчику
          </Button>
        )}
      </div>
    </div>
  );
}
