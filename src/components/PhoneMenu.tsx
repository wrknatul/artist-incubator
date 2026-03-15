import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Home, ShoppingBag, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const SHOP_ITEMS: Expense[] = [
  {
    id: 'coffee_machine',
    name: 'Кофемашина',
    emoji: '☕',
    cost: 200,
    type: 'oneoff',
    owned: false,
    description: 'Бодрость каждое утро. +5% к скорости работы.',
    category: 'luxury',
  },
  {
    id: 'gaming_chair',
    name: 'Геймерское кресло',
    emoji: '🪑',
    cost: 500,
    type: 'oneoff',
    owned: false,
    description: 'Спина скажет спасибо. Комфорт +100.',
    category: 'luxury',
  },
  {
    id: 'second_monitor',
    name: 'Второй монитор',
    emoji: '🖥️',
    cost: 800,
    type: 'oneoff',
    owned: false,
    description: 'Два экрана = два раза продуктивнее (не факт).',
    category: 'gear',
  },
  {
    id: 'mech_keyboard',
    name: 'Мех. клавиатура',
    emoji: '⌨️',
    cost: 300,
    type: 'oneoff',
    owned: false,
    description: 'Клац-клац-клац. Соседи в восторге.',
    category: 'gear',
  },
  {
    id: 'plant',
    name: 'Кактус на стол',
    emoji: '🌵',
    cost: 50,
    type: 'oneoff',
    owned: false,
    description: 'Для уюта. Поливать не надо.',
    category: 'luxury',
  },
  {
    id: 'cat',
    name: 'Завести кота',
    emoji: '🐱',
    cost: 100,
    type: 'oneoff',
    owned: false,
    description: 'Мурчит и мешает кодить. Расходы +$30/мес.',
    category: 'luxury',
  },
];

interface PhoneMenuProps {
  balance: number;
  monthlyExpenses: number;
  ownedItems: string[];
  onPurchase: (item: Expense) => void;
}

export function PhoneMenu({ balance, monthlyExpenses, ownedItems, onPurchase }: PhoneMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'shop'>('expenses');

  const RECURRING_EXPENSES = [
    { name: 'Аренда квартиры', emoji: '🏠', cost: 200 },
    { name: 'Интернет', emoji: '📡', cost: 30 },
    { name: 'Еда', emoji: '🍔', cost: 100 },
    ...(ownedItems.includes('cat') ? [{ name: 'Корм для кота', emoji: '🐱', cost: 30 }] : []),
  ];

  const totalRecurring = RECURRING_EXPENSES.reduce((s, e) => s + e.cost, 0);

  return (
    <>
      {/* Phone FAB */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-primary"
      >
        <Smartphone className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            />

            {/* Phone panel */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="fixed bottom-6 right-6 z-50 w-[340px] max-h-[520px] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden"
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
                  onClick={() => setActiveTab('expenses')}
                  className={`flex-1 py-2 text-xs font-mono flex items-center justify-center gap-1 transition-colors ${
                    activeTab === 'expenses'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Home className="h-3 w-3" /> Расходы
                </button>
                <button
                  onClick={() => setActiveTab('shop')}
                  className={`flex-1 py-2 text-xs font-mono flex items-center justify-center gap-1 transition-colors ${
                    activeTab === 'shop'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <ShoppingBag className="h-3 w-3" /> Магазин
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-3">
                {activeTab === 'expenses' ? (
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground font-mono mb-2">
                      Ежемесячные расходы
                    </div>
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
                ) : (
                  <div className="space-y-2">
                    {SHOP_ITEMS.map((item) => {
                      const isOwned = ownedItems.includes(item.id);
                      const canAfford = balance >= item.cost;
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            isOwned ? 'bg-accent/10 border-accent/30' : 'bg-secondary/30 border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{item.emoji}</span>
                              <span className="text-sm font-medium text-foreground">{item.name}</span>
                            </div>
                            {isOwned ? (
                              <span className="text-xs font-mono text-accent">✓ Куплено</span>
                            ) : (
                              <Button
                                size="sm"
                                variant={canAfford ? 'default' : 'secondary'}
                                disabled={!canAfford}
                                onClick={() => onPurchase(item)}
                                className="h-7 text-xs font-mono"
                              >
                                ${item.cost}
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      );
                    })}
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
    </>
  );
}
