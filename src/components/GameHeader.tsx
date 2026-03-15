import { Coins, Star, Briefcase, Calendar, TrendingDown, User } from 'lucide-react';
import { AmbientSound } from '@/components/AmbientSound';

interface GameHeaderProps {
  balance: number;
  completedOrders: number;
  month: number;
  monthlyExpenses: number;
  averageRating: number;
  onProfileClick: () => void;
}

export function GameHeader({ balance, completedOrders, month, monthlyExpenses, averageRating, onProfileClick }: GameHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold font-mono text-primary text-glow">
          {'>'} Max Freelance Pain
        </span>
        <span className="text-xs text-muted-foreground font-mono">v0.1</span>
        <AmbientSound />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm text-muted-foreground">Месяц {month}</span>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-game-gold" />
          <span className="font-mono text-sm text-game-gold">${balance}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-destructive" />
          <span className="font-mono text-sm text-destructive">-${monthlyExpenses}/мес</span>
        </div>
        {averageRating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-game-gold fill-game-gold" />
            <span className="font-mono text-sm text-game-gold">{averageRating.toFixed(1)}</span>
          </div>
        )}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm text-muted-foreground">{completedOrders} заказов</span>
        </button>
      </div>
    </header>
  );
}
