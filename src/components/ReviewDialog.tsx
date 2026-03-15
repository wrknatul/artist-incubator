import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Coins, AlertTriangle, ThumbsUp, Shield, BarChart3, Gift, HandCoins } from 'lucide-react';
import { calculateReview, type ClientProfile, type ReviewResult } from '@/lib/clientSystem';

interface ReviewDialogProps {
  budget: number;
  negotiatedBudget: number | null;
  clientName: string;
  clientAvatar: string;
  consultationCount: number;
  clientPreviewRating: number | null;
  clientProfile: ClientProfile;
  finalAiRating: number | null;
  finalAiComment: string | null;
  planningMultiplier: number;
  onClose: (earned: number, xp: number) => void;
}

interface DefenseAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  effect: string;
}

export function ReviewDialog({ budget, negotiatedBudget, clientName, clientAvatar, consultationCount, clientPreviewRating, clientProfile, finalAiRating, finalAiComment, onClose }: ReviewDialogProps) {
  const [review, setReview] = useState<ReviewResult>(() =>
    calculateReview(clientProfile, budget, negotiatedBudget, consultationCount, clientPreviewRating, finalAiRating)
  );
  const [visible, setVisible] = useState(false);
  const [defenseUsed, setDefenseUsed] = useState(false);

  const isGood = review.rating >= 4;
  // Use AI comment if available, otherwise use template text
  const reviewText = finalAiComment || review.text;

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const defenseActions: DefenseAction[] = [
    {
      id: 'defend',
      icon: <Shield className="h-4 w-4" />,
      label: 'Защитить решения',
      description: 'Объяснить почему сделано так',
      effect: clientProfile.traits.tech_literacy > 5 ? '+10-15% к оценке' : '+5% к оценке',
    },
    {
      id: 'metrics',
      icon: <BarChart3 className="h-4 w-4" />,
      label: 'Показать метрики',
      description: 'Скорость, тесты, безопасность',
      effect: clientProfile.traits.tech_literacy > 7 ? '+15-20% к оценке' : 'Не поймёт',
    },
    {
      id: 'discount',
      icon: <HandCoins className="h-4 w-4" />,
      label: 'Предложить скидку',
      description: '-15% к оплате, +оценка',
      effect: clientProfile.archetype === 'scrooge' ? 'Обожает это!' : '+10% к оценке',
    },
    {
      id: 'bonus',
      icon: <Gift className="h-4 w-4" />,
      label: 'Предложить бонус',
      description: 'Добавить фичу бесплатно',
      effect: '+10-15% к оценке',
    },
  ];

  const handleDefense = (action: DefenseAction) => {
    if (defenseUsed) return;
    setDefenseUsed(true);

    let bonusConsultations = 0;
    let budgetPenalty = 0;

    switch (action.id) {
      case 'defend':
        bonusConsultations = clientProfile.traits.tech_literacy > 5 ? 3 : 1;
        break;
      case 'metrics':
        bonusConsultations = clientProfile.traits.tech_literacy > 7 ? 4 : 0;
        break;
      case 'discount':
        bonusConsultations = clientProfile.archetype === 'scrooge' ? 5 : 2;
        budgetPenalty = 0.15;
        break;
      case 'bonus':
        bonusConsultations = 2;
        break;
    }

    // Recalculate with bonus — bump the AI rating slightly for defense
    const defenseAiBonus = finalAiRating !== null ? Math.min(5, finalAiRating + 1) : null;
    const newReview = calculateReview(clientProfile, budget, negotiatedBudget, consultationCount + bonusConsultations, clientPreviewRating, defenseAiBonus);
    if (budgetPenalty > 0) {
      newReview.earned = Math.round(newReview.earned * (1 - budgetPenalty));
    }
    // Ensure defense always improves at least a little
    if (newReview.rating < review.rating) newReview.rating = review.rating;
    if (newReview.earned < review.earned && budgetPenalty === 0) newReview.earned = review.earned;

    setReview(newReview);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`bg-card border rounded-xl p-6 max-w-md w-full mx-4 transition-all duration-300 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="text-center mb-4">
          <span className="text-4xl">{clientAvatar}</span>
          <h2 className="font-mono font-bold mt-2 text-card-foreground">{clientName}</h2>
          <p className="text-sm text-muted-foreground">оценил(а) вашу работу</p>
        </div>

        {!isGood && consultationCount === 0 && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 mb-3 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Вы не общались с заказчиком и не показывали превью!</span>
          </div>
        )}

        {isGood && consultationCount > 0 && (
          <div className="flex items-center gap-2 bg-game-xp/10 border border-game-xp/30 rounded-lg px-3 py-2 mb-3 text-xs text-game-xp">
            <ThumbsUp className="h-4 w-4 shrink-0" />
            <span>Заказчик доволен — вы согласовали работу заранее!</span>
          </div>
        )}

        <div className="flex justify-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-6 w-6 ${i < Math.floor(review.rating) ? 'text-game-gold fill-game-gold' : i < review.rating ? 'text-game-gold fill-game-gold opacity-50' : 'text-muted'}`}
            />
          ))}
        </div>

        <p className="text-center text-sm text-secondary-foreground mb-4 italic">
          "{reviewText}"
        </p>

        {/* Defense actions (only if review is bad) */}
        {!isGood && !defenseUsed && (
          <div className="mb-4 space-y-1.5">
            <p className="text-xs font-mono text-muted-foreground text-center mb-2">⚔️ Защитить работу:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {defenseActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleDefense(action)}
                  className="flex items-center gap-1.5 p-2 rounded-lg border bg-secondary/30 hover:bg-secondary/60 transition-colors text-left"
                >
                  <span className="text-primary">{action.icon}</span>
                  <div>
                    <p className="text-[10px] font-medium text-foreground">{action.label}</p>
                    <p className="text-[9px] text-muted-foreground">{action.effect}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="flex items-center gap-1 text-game-gold font-mono font-bold text-lg">
              <Coins className="h-5 w-5" />+${review.earned}
            </div>
            <p className="text-xs text-muted-foreground">заработано</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-game-xp font-mono font-bold text-lg">
              <Star className="h-5 w-5" />+{review.xp} XP
            </div>
            <p className="text-xs text-muted-foreground">опыт</p>
          </div>
        </div>

        <Button className="w-full" onClick={() => onClose(review.earned, review.xp)}>
          Вернуться на биржу
        </Button>
      </div>
    </div>
  );
}
