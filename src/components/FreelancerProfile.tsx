import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Briefcase, TrendingUp, Calendar, Award, User } from 'lucide-react';
import { type CompletedReview, getAverageRating, getFreelancerLevel } from '@/lib/gameData';

interface FreelancerProfileProps {
  completedOrders: number;
  balance: number;
  month: number;
  reviews: CompletedReview[];
  onClose: () => void;
}

export function FreelancerProfile({ completedOrders, balance, month, reviews, onClose }: FreelancerProfileProps) {
  const avgRating = getAverageRating(reviews);
  const level = getFreelancerLevel(completedOrders);
  const progressToNext = completedOrders / level.nextAt;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', bounce: 0.2 }}
        className="w-[420px] max-h-[85vh] bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Cover */}
        <div className="relative h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-game-xp/20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
          <button onClick={onClose} className="absolute top-3 right-3 text-foreground/60 hover:text-foreground bg-background/30 rounded-full p-1 backdrop-blur-sm">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="relative px-6 pb-4">
          <div className="absolute -top-10 left-6 w-20 h-20 rounded-xl bg-card border-4 border-card flex items-center justify-center shadow-lg">
            <span className="text-3xl">👨‍💻</span>
          </div>
          <div className="pt-12">
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-bold text-lg text-foreground">Вы</h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold border border-primary/30">
                {level.title}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">Web-разработчик • На бирже с 1 месяца</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <StatCard
              icon={<Star className="h-3.5 w-3.5 text-game-gold" />}
              value={avgRating > 0 ? avgRating.toFixed(1) : '—'}
              label="Рейтинг"
            />
            <StatCard
              icon={<Briefcase className="h-3.5 w-3.5 text-primary" />}
              value={`${completedOrders}`}
              label="Заказы"
            />
            <StatCard
              icon={<TrendingUp className="h-3.5 w-3.5 text-game-success" />}
              value={`$${balance}`}
              label="Баланс"
            />
          </div>
        </div>

        {/* Level progress */}
        <div className="px-6 pb-4">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-muted-foreground">Уровень {level.level}</span>
            <span className="text-muted-foreground">{completedOrders}/{level.nextAt} заказов</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progressToNext * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Average rating display */}
        {reviews.length > 0 && (
          <div className="px-6 pb-3">
            <div className="flex items-center justify-center gap-1 py-2 bg-secondary/30 rounded-lg border">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 transition-all ${
                    i < Math.floor(avgRating)
                      ? 'text-game-gold fill-game-gold'
                      : i < avgRating
                      ? 'text-game-gold fill-game-gold opacity-50'
                      : 'text-muted'
                  }`}
                />
              ))}
              <span className="ml-2 font-mono text-sm font-bold text-game-gold">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">({reviews.length})</span>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="px-6 pb-2">
          <h3 className="font-mono text-xs font-semibold text-muted-foreground mb-2">
            Отзывы ({reviews.length})
          </h3>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-6 space-y-2 min-h-0">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-mono">Пока нет отзывов</p>
              <p className="text-[10px] mt-1">Выполни первый заказ!</p>
            </div>
          ) : (
            [...reviews].reverse().map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-lg border bg-secondary/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{review.clientAvatar}</span>
                    <span className="text-xs font-mono font-semibold text-foreground">{review.clientName}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-3 w-3 ${j < review.rating ? 'text-game-gold fill-game-gold' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{review.orderTitle}</p>
                <p className="text-xs text-secondary-foreground mt-1 italic">"{review.text}"</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground font-mono">Месяц {review.month}</span>
                  <span className="text-[10px] font-mono text-game-gold">+${review.earned}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/30 border">
      {icon}
      <span className="font-mono text-sm font-bold text-foreground mt-1">{value}</span>
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}
