import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BargainMiniGameProps {
  clientName: string;
  clientAvatar: string;
  currentBudget: number;
  averageRating: number; // 0-5, affects target zone size
  onComplete: (success: boolean, newBudget: number) => void;
  onClose: () => void;
}

const TOTAL_ROUNDS = 5;
const ARROW_SPEED_BASE = 3;
const TRACK_HEIGHT = 280;
const ARROW_SIZE = 8;
const BASE_TARGET_SIZE = 36;

interface TargetZone {
  y: number;
  hit: boolean;
  size: number;
}

function getTargetSize(avgRating: number): number {
  // 0 stars → 36px, 3 stars → 48px, 5 stars → 64px
  if (avgRating <= 0) return BASE_TARGET_SIZE;
  return Math.round(BASE_TARGET_SIZE + avgRating * 5.6);
}

function generateTargets(round: number, targetSize: number): TargetZone[] {
  const count = round <= 2 ? 3 : 2;
  const zones: TargetZone[] = [];
  const margin = 20;
  const usableHeight = TRACK_HEIGHT - margin * 2 - targetSize;

  for (let i = 0; i < count; i++) {
    const sectionSize = usableHeight / count;
    const y = margin + sectionSize * i + Math.random() * (sectionSize - targetSize);
    zones.push({ y: Math.round(y), hit: false, size: targetSize });
  }
  return zones;
}

export function BargainMiniGame({ clientName, clientAvatar, currentBudget, averageRating, onComplete, onClose }: BargainMiniGameProps) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [arrowY, setArrowY] = useState(0);
  const targetSize = getTargetSize(averageRating);
  const [targets, setTargets] = useState<TargetZone[]>(() => generateTargets(0, targetSize));
  const [isActive, setIsActive] = useState(false);
  const [lastHit, setLastHit] = useState<'hit' | 'miss' | null>(null);
  const [speed, setSpeed] = useState(ARROW_SPEED_BASE);
  const animRef = useRef<number>(0);
  const arrowRef = useRef(0);
  const dirRef = useRef(1);

  // Intro animation
  useEffect(() => {
    if (phase === 'intro') {
      const timer = setTimeout(() => {
        setPhase('playing');
        setIsActive(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Animate arrow
  useEffect(() => {
    if (!isActive || phase !== 'playing') return;

    const animate = () => {
      arrowRef.current += dirRef.current * speed;

      if (arrowRef.current >= TRACK_HEIGHT - ARROW_SIZE) {
        arrowRef.current = TRACK_HEIGHT - ARROW_SIZE;
        dirRef.current = -1;
      } else if (arrowRef.current <= 0) {
        arrowRef.current = 0;
        dirRef.current = 1;
      }

      setArrowY(arrowRef.current);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isActive, phase, speed]);

  const handleClick = useCallback(() => {
    if (!isActive || phase !== 'playing') return;

    const arrowCenter = arrowRef.current + ARROW_SIZE / 2;
    let wasHit = false;

    for (const target of targets) {
      if (!target.hit && arrowCenter >= target.y && arrowCenter <= target.y + target.size) {
        target.hit = true;
        wasHit = true;
        break;
      }
    }

    if (wasHit) {
      setScore(prev => prev + 1);
      setLastHit('hit');
    } else {
      setScore(prev => prev - 1);
      setLastHit('miss');
    }

    setIsActive(false);
    setTimeout(() => {
      setLastHit(null);
      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        setPhase('result');
      } else {
        setRound(nextRound);
        setTargets(generateTargets(nextRound, targetSize));
        setSpeed(ARROW_SPEED_BASE + nextRound * 0.8);
        arrowRef.current = 0;
        dirRef.current = 1;
        setArrowY(0);
        setIsActive(true);
      }
    }, 600);
  }, [isActive, phase, targets, round, targetSize]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClick]);

  const handleFinish = () => {
    const success = score > 0;
    if (success) {
      const raisePercent = Math.min(30, 10 + (score - 1) * 5);
      const newBudget = Math.round(currentBudget * (1 + raisePercent / 100));
      onComplete(true, newBudget);
    } else {
      onComplete(false, currentBudget);
    }
  };

  const meterPercent = Math.max(0, Math.min(100, ((score + TOTAL_ROUNDS) / (TOTAL_ROUNDS * 2)) * 100));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateX: 15 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotateX: -15 }}
        transition={{ type: 'spring', bounce: 0.25 }}
        className="w-[340px] bg-card border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-secondary/30">
          <div className="flex items-center gap-2">
            <motion.span
              className="text-xl"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {clientAvatar}
            </motion.span>
            <div>
              <h3 className="font-mono text-sm font-bold text-foreground">Торг с {clientName}</h3>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-muted-foreground">
                  {phase === 'intro' ? 'Приготовься!' : phase === 'result' ? 'Результат' : `Раунд ${round + 1}/${TOTAL_ROUNDS}`}
                </p>
                {averageRating > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] text-game-gold">
                    <Star className="h-2.5 w-2.5 fill-game-gold" />{averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 text-center space-y-4"
            >
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 1 }}
              >
                💰
              </motion.div>
              <div>
                <h4 className="font-mono font-bold text-lg text-foreground">Мини-игра: Торг!</h4>
                <p className="text-xs text-muted-foreground mt-2">
                  Лови стрелку в зелёных зонах!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Попадание = бюджет растёт 📈
                </p>
                <p className="text-xs text-muted-foreground">
                  Промах = заказчик стоит на своём 📉
                </p>
              </div>
              {averageRating > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-game-gold/10 border border-game-gold/30 rounded-full"
                >
                  <Star className="h-3.5 w-3.5 text-game-gold fill-game-gold" />
                  <span className="text-[11px] font-mono text-game-gold">
                    Рейтинг {averageRating.toFixed(1)} — зоны увеличены!
                  </span>
                </motion.div>
              )}
              <motion.div
                className="text-sm font-mono text-primary"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Начинаем...
              </motion.div>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Tug-of-war meter */}
              <div className="px-4 pt-4 pb-2">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-destructive">Заказчик</span>
                  <span className="text-game-gold font-bold">${currentBudget}</span>
                  <span className="text-game-success">Ты</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden relative border">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, hsl(var(--destructive)) 0%, hsl(var(--muted)) 50%, hsl(142 76% 46%) 100%)`,
                    }}
                    animate={{ width: `${meterPercent}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-foreground/30 -translate-x-px" />
                </div>
                <div className="text-center mt-1">
                  <span className={`text-[10px] font-mono font-bold ${score > 0 ? 'text-game-success' : score < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {score > 0 ? `+${score}` : score} очков
                  </span>
                </div>
              </div>

              {/* Game area */}
              <div className="px-4 pb-2">
                <div
                  className="relative mx-auto bg-muted/50 rounded-xl border overflow-hidden cursor-pointer select-none"
                  style={{ width: 120, height: TRACK_HEIGHT }}
                  onClick={handleClick}
                >
                  {/* Target zones */}
                  {targets.map((t, i) => (
                    <motion.div
                      key={`${round}-${i}`}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`absolute left-2 right-2 rounded-md border-2 transition-colors duration-200 ${
                        t.hit
                          ? 'bg-game-success/30 border-game-success/50'
                          : 'bg-game-gold/15 border-game-gold/40'
                      }`}
                      style={{ top: t.y, height: t.size }}
                    >
                      {t.hit && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center justify-center h-full"
                        >
                          <span className="text-game-success text-xs font-bold">✓</span>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}

                  {/* Moving arrow */}
                  <div
                    className="absolute left-0 right-0 flex items-center justify-center"
                    style={{ top: arrowY }}
                  >
                    <div className={`w-full h-2 rounded-full transition-colors duration-100 ${
                      lastHit === 'hit' ? 'bg-game-success shadow-[0_0_10px_hsl(142,76%,46%)]' :
                      lastHit === 'miss' ? 'bg-destructive shadow-[0_0_10px_hsl(var(--destructive))]' :
                      'bg-primary shadow-[0_0_8px_hsl(var(--primary))]'
                    }`} />
                  </div>

                  {/* Flash effect */}
                  <AnimatePresence>
                    {lastHit && (
                      <motion.div
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`absolute inset-0 rounded-xl ${
                          lastHit === 'hit' ? 'bg-game-success/20' : 'bg-destructive/20'
                        }`}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Instructions */}
              <div className="px-4 pb-4 text-center">
                <p className="text-[10px] text-muted-foreground font-mono flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3" />
                  Нажми когда стрелка в зелёной зоне!
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">Пробел / клик</p>
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 text-center space-y-4"
            >
              <motion.div
                className="text-5xl"
                animate={{ scale: [0.5, 1.3, 1], rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.6 }}
              >
                {score > 2 ? '🎉' : score > 0 ? '💰' : score === 0 ? '🤝' : '😞'}
              </motion.div>
              <div>
                <motion.h4
                  className="font-mono font-bold text-foreground text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {score > 2 ? 'Отличный торг!' : score > 0 ? 'Удалось!' : score === 0 ? 'Ничья' : 'Не повезло...'}
                </motion.h4>
                <motion.p
                  className="text-xs text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {score > 0
                    ? `Бюджет увеличен на ${Math.min(30, 10 + (score - 1) * 5)}%!`
                    : score === 0
                    ? 'Бюджет остаётся прежним.'
                    : 'Заказчик не уступил. Бюджет без изменений.'}
                </motion.p>
                {score > 0 && (
                  <motion.p
                    className="text-xl font-mono font-bold text-game-gold mt-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.6 }}
                  >
                    ${Math.round(currentBudget * (1 + Math.min(30, 10 + (score - 1) * 5) / 100))}
                  </motion.p>
                )}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button onClick={handleFinish} className="w-full font-mono">
                  {score > 0 ? '💰 Забрать!' : 'Ок, продолжим'}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
