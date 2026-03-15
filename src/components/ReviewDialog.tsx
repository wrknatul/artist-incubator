import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Coins, AlertTriangle, ThumbsUp } from 'lucide-react';

interface ReviewDialogProps {
  budget: number;
  clientName: string;
  clientAvatar: string;
  consultationCount: number;
  clientPreviewRating: number | null;
  onClose: (earned: number, xp: number) => void;
}

const GOOD_REVIEWS = [
  { rating: 5, text: 'Отличная работа! Именно то, что я хотел. Рекомендую!', multiplier: 1.2 },
  { rating: 4, text: 'Хорошо, но можно было чуть лучше. В целом доволен.', multiplier: 1.0 },
  { rating: 5, text: 'WOW! Это даже лучше, чем я ожидал! 🎉', multiplier: 1.3 },
  { rating: 4, text: 'Неплохо! Пара мелочей, но в целом — огонь 🔥', multiplier: 1.0 },
];

const BAD_REVIEWS = [
  { rating: 2, text: 'Это вообще не то, что я просил. Разочарован.', multiplier: 0.3 },
  { rating: 1, text: 'Ужасно. Деньги на ветер. Больше не обращусь.', multiplier: 0.1 },
  { rating: 2, text: 'Ну такое... Даже не спросил что мне нужно.', multiplier: 0.3 },
  { rating: 3, text: 'Сойдёт, но вы даже не показали мне до сдачи.', multiplier: 0.5 },
];

const PREVIEW_REVIEWS = [
  { rating: 4, text: 'Спасибо что показали заранее! Получилось неплохо.', multiplier: 1.0 },
  { rating: 5, text: 'Рад, что мы согласовали всё до сдачи! Супер результат! 🎉', multiplier: 1.2 },
  { rating: 4, text: 'Хорошо, что спросили моё мнение. Работа достойная!', multiplier: 1.0 },
];

export function ReviewDialog({ budget, clientName, clientAvatar, consultationCount, clientPreviewRating, onClose }: ReviewDialogProps) {
  const [review] = useState(() => {
    // If user showed preview to client - better reviews
    if (clientPreviewRating !== null && clientPreviewRating >= 4) {
      return GOOD_REVIEWS[Math.floor(Math.random() * GOOD_REVIEWS.length)];
    }
    if (consultationCount > 0) {
      return PREVIEW_REVIEWS[Math.floor(Math.random() * PREVIEW_REVIEWS.length)];
    }
    // No consultation = bad reviews (penalty for not communicating)
    return BAD_REVIEWS[Math.floor(Math.random() * BAD_REVIEWS.length)];
  });

  const [visible, setVisible] = useState(false);
  const earned = Math.round(budget * review.multiplier);
  const xp = review.rating * 20;
  const isGood = review.rating >= 4;

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

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
              className={`h-6 w-6 ${i < review.rating ? 'text-game-gold fill-game-gold' : 'text-muted'}`}
            />
          ))}
        </div>

        <p className="text-center text-sm text-secondary-foreground mb-6 italic">
          "{review.text}"
        </p>

        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="flex items-center gap-1 text-game-gold font-mono font-bold text-lg">
              <Coins className="h-5 w-5" />+${earned}
            </div>
            <p className="text-xs text-muted-foreground">заработано</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-game-xp font-mono font-bold text-lg">
              <Star className="h-5 w-5" />+{xp} XP
            </div>
            <p className="text-xs text-muted-foreground">опыт</p>
          </div>
        </div>

        <Button className="w-full" onClick={() => onClose(earned, xp)}>
          Вернуться на биржу
        </Button>
      </div>
    </div>
  );
}
