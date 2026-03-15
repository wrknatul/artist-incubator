import { Coins, Star, Briefcase } from 'lucide-react';

interface GameHeaderProps {
  balance: number;
  reputation: number;
  completedOrders: number;
}

export function GameHeader({ balance, reputation, completedOrders }: GameHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold font-mono text-primary text-glow">
          {'>'} StartupTycoon
        </span>
        <span className="text-xs text-muted-foreground font-mono">v0.1</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-game-gold" />
          <span className="font-mono text-sm text-game-gold">${balance}</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-game-xp" />
          <span className="font-mono text-sm text-game-xp">{reputation} XP</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm text-muted-foreground">{completedOrders} заказов</span>
        </div>
      </div>
    </header>
  );
}
