import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const LIFE_EVENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/life-event`;

export interface LifeEvent {
  emoji: string;
  title: string;
  description: string;
  option1: { label: string; result: string; balanceChange: number };
  option2: { label: string; result: string; balanceChange: number };
}

interface LifeEventCardProps {
  event: LifeEvent;
  onResolve: (balanceChange: number) => void;
  balance: number;
}

export function LifeEventCard({ event, onResolve, balance }: LifeEventCardProps) {
  const [customText, setCustomText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ text: string; balanceChange: number; emoji: string } | null>(null);

  const handleOption = (option: { result: string; balanceChange: number }) => {
    setResult({ text: option.result, balanceChange: option.balanceChange, emoji: event.emoji });
  };

  const handleCustom = async () => {
    if (!customText.trim() || isProcessing) return;
    setIsProcessing(true);

    try {
      const resp = await fetch(LIFE_EVENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          customChoice: customText,
          eventContext: `${event.title}: ${event.description}`,
          balance,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) { toast.error('Слишком много запросов, подожди.'); return; }
        if (resp.status === 402) { toast.error('Закончились кредиты AI.'); return; }
        throw new Error('Failed');
      }

      const data = await resp.json();
      setResult({
        text: data.result || 'Что-то произошло...',
        balanceChange: data.balanceChange || 0,
        emoji: data.emoji || '🤷',
      });
    } catch {
      toast.error('Не удалось обработать ответ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (result) {
      onResolve(result.balanceChange);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 40 }}
          className="bg-card border rounded-2xl p-6 max-w-md w-full shadow-2xl"
        >
          {!result ? (
            <>
              {/* Event header */}
              <div className="text-center mb-4">
                <span className="text-4xl">{event.emoji}</span>
                <h3 className="font-mono font-bold text-foreground mt-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
              </div>

              {/* Option buttons */}
              <div className="space-y-2 mb-4">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 font-mono text-sm"
                  onClick={() => handleOption(event.option1)}
                >
                  <span className="text-primary mr-2">A.</span>
                  <span>{event.option1.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {event.option1.balanceChange >= 0 ? '+' : ''}{event.option1.balanceChange}$
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 font-mono text-sm"
                  onClick={() => handleOption(event.option2)}
                >
                  <span className="text-primary mr-2">B.</span>
                  <span>{event.option2.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {event.option2.balanceChange >= 0 ? '+' : ''}{event.option2.balanceChange}$
                  </span>
                </Button>
              </div>

              {/* Custom input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCustom()}
                  placeholder="Свой вариант..."
                  className="flex-1 bg-secondary/50 border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isProcessing}
                />
                <Button
                  size="sm"
                  onClick={handleCustom}
                  disabled={!customText.trim() || isProcessing}
                  className="px-3"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Напиши свой вариант — ИИ решит последствия
              </p>
            </>
          ) : (
            /* Result screen */
            <div className="text-center">
              <span className="text-4xl">{result.emoji}</span>
              <p className="text-sm text-foreground mt-3 mb-2">{result.text}</p>
              <p className={`font-mono text-lg font-bold ${result.balanceChange >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                {result.balanceChange >= 0 ? '+' : ''}{result.balanceChange}$
              </p>
              <Button
                className="mt-4 w-full"
                onClick={handleClose}
              >
                Окей, жизнь продолжается
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
