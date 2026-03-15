import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Star, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { FreelanceOrder } from '@/lib/gameData';
import { getDeadlineLabel } from '@/lib/clientSystem';

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
  const [expanded, setExpanded] = useState(false);
  const deadline = order.deadline ? getDeadlineLabel(order.deadline) : null;
  const clientRating = order.clientProfile?.visibleRating;

  return (
    <div className="border rounded-lg p-5 bg-card hover:border-primary/50 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{order.clientAvatar}</span>
          <div>
            <h3 className="font-semibold text-card-foreground">{order.title}</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{order.clientName}</p>
              {clientRating !== undefined && (
                <span className="flex items-center gap-0.5 text-xs text-game-gold">
                  <Star className="h-3 w-3 fill-game-gold" />{clientRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {deadline && (
            <Badge variant="outline" className={`text-[10px] ${deadline.color}`}>
              <Clock className="h-3 w-3 mr-0.5" />{deadline.text}
            </Badge>
          )}
          <Badge variant="outline" className={difficultyColors[order.difficulty]}>
            {difficultyLabels[order.difficulty]}
          </Badge>
        </div>
      </div>

      {/* Brief summary - first line only */}
      <p className="text-sm text-secondary-foreground mb-2 line-clamp-2">
        {order.description.split('\n')[0]}
      </p>

      <div className="flex items-center gap-2">
        {order.industry && (
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {order.industry}
          </span>
        )}
        {order.requirements && order.requirements.length > 0 && (
          <span className="text-[10px] font-mono text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">
            📋 {order.requirements.length} пунктов ТЗ
          </span>
        )}
      </div>

      {expanded && (
        <div className="mt-3 p-3 rounded-md bg-secondary/30 border border-border text-xs space-y-2">
          <p className="font-mono font-semibold text-foreground text-xs">📋 Техническое задание:</p>
          <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-[11px]">
            {order.description}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-game-gold" />
            <span className="font-mono font-semibold text-game-gold">${order.budget}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground h-7 px-2"
          >
            {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
            {expanded ? 'Свернуть' : 'Подробнее'}
          </Button>
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
