import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import type { FreelanceOrder } from '@/lib/gameData';

interface OrderCardProps {
  order: FreelanceOrder;
  onAccept: (order: FreelanceOrder) => void;
}

const difficultyColors = {
  easy: 'bg-game-success/20 text-game-success border-game-success/30',
  medium: 'bg-game-warning/20 text-game-warning border-game-warning/30',
  hard: 'bg-destructive/20 text-destructive border-destructive/30',
};

const difficultyLabels = {
  easy: 'Лёгкий',
  medium: 'Средний',
  hard: 'Сложный',
};

export function OrderCard({ order, onAccept }: OrderCardProps) {
  return (
    <div className="border rounded-lg p-5 bg-card hover:border-primary/50 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{order.clientAvatar}</span>
          <div>
            <h3 className="font-semibold text-card-foreground">{order.title}</h3>
            <p className="text-xs text-muted-foreground">{order.clientName}</p>
          </div>
        </div>
        <Badge variant="outline" className={difficultyColors[order.difficulty]}>
          {difficultyLabels[order.difficulty]}
        </Badge>
      </div>

      <p className="text-sm text-secondary-foreground mb-4">{order.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Coins className="h-4 w-4 text-game-gold" />
          <span className="font-mono font-semibold text-game-gold">${order.budget}</span>
        </div>
        <Button
          size="sm"
          onClick={() => onAccept(order)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Взять заказ
        </Button>
      </div>
    </div>
  );
}
