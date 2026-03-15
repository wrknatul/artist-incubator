import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BargainMiniGameProps {
  clientName: string;
  clientAvatar: string;
  currentBudget: number;
  onComplete: (success: boolean, newBudget: number) => void;
  onClose: () => void;
}

const TOTAL_ROUNDS = 5;
const ARROW_SPEED_BASE = 3; // pixels per frame
const TRACK_HEIGHT = 280;
const TARGET_SIZE = 40; // height of target zone
const ARROW_SIZE = 8;

interface TargetZone {
  y: number;
  hit: boolean;
}

function generateTargets(round: number): TargetZone[] {
  // 2-3 targets per round, fewer as rounds progress
  const count = round <= 2 ? 3 : round <= 4 ? 2 : 2;
  const zones: TargetZone[] = [];
  const margin = 30;
  const usableHeight = TRACK_HEIGHT - margin * 2 - TARGET_SIZE;
  
  for (let i = 0; i < count; i++) {
    const sectionSize = usableHeight / count;
    const y = margin + sectionSize * i + Math.random() * (sectionSize - TARGET_SIZE);
    zones.push({ y: Math.round(y), hit: false });
  }
  return zones;
}

export function BargainMiniGame({ clientName, clientAvatar, currentBudget, onComplete, onClose }: BargainMiniGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0); // positive = player wins, negative = client wins
  const [arrowY, setArrowY] = useState(0);
  const [arrowDir, setArrowDir] = useState(1); // 1 = down, -1 = up
  const [targets, setTargets] = useState<TargetZone[]>(() => generateTargets(0));
  const [isActive, setIsActive] = useState(true);
  const [lastHit, setLastHit] = useState<'hit' | 'miss' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(ARROW_SPEED_BASE);
  const animRef = useRef<number>(0);
  const arrowRef = useRef(0);
  const dirRef = useRef(1);

  // Animate arrow
  useEffect(() => {
    if (!isActive || gameOver) return;

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
      setArrowDir(dirRef.current);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isActive, gameOver, speed]);

  const handleClick = useCallback(() => {
    if (!isActive || gameOver) return;

    const arrowCenter = arrowRef.current + ARROW_SIZE / 2;
    let wasHit = false;

    // Check if arrow is in any target zone
    for (const target of targets) {
      if (!target.hit && arrowCenter >= target.y && arrowCenter <= target.y + TARGET_SIZE) {
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

    // Brief pause then next round or end
    setIsActive(false);
    setTimeout(() => {
      setLastHit(null);
      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        setGameOver(true);
      } else {
        setRound(nextRound);
        setTargets(generateTargets(nextRound));
        setSpeed(ARROW_SPEED_BASE + nextRound * 0.8); // Gets faster
        arrowRef.current = 0;
        dirRef.current = 1;
        setArrowY(0);
        setIsActive(true);
      }
    }, 600);
  }, [isActive, gameOver, targets, round]);

  // Keyboard support
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
      // Score 1-5 → 10-30% raise
      const raisePercent = Math.min(30, 10 + (score - 1) * 5);
      const newBudget = Math.round(currentBudget * (1 + raisePercent / 100));
      onComplete(true, newBudget);
    } else {
      onComplete(false, currentBudget);
    }
  };

  // Tug-of-war meter: -5 to +5 mapped to 0-100%
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-[340px] bg-card border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-secondary/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">{clientAvatar}</span>
            <div>
              <h3 className="font-mono text-sm font-bold text-foreground">Торг с {clientName}</h3>
              <p className="text-[10px] text-muted-foreground">Раунд {Math.min(round + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

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
            {/* Center mark */}
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-foreground/30 -translate-x-px" />
          </div>
          <div className="text-center mt-1">
            <span className={`text-[10px] font-mono font-bold ${score > 0 ? 'text-game-success' : score < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {score > 0 ? `+${score}` : score} очков
            </span>
          </div>
        </div>

        {!gameOver ? (
          <>
            {/* Game area */}
            <div className="px-4 pb-2">
              <div
                className="relative mx-auto bg-muted/50 rounded-xl border overflow-hidden cursor-pointer select-none"
                style={{ width: 120, height: TRACK_HEIGHT }}
                onClick={handleClick}
              >
                {/* Target zones */}
                {targets.map((t, i) => (
                  <div
                    key={i}
                    className={`absolute left-2 right-2 rounded-md border-2 transition-colors duration-200 ${
                      t.hit
                        ? 'bg-game-success/30 border-game-success/50'
                        : 'bg-game-gold/15 border-game-gold/40'
                    }`}
                    style={{ top: t.y, height: TARGET_SIZE }}
                  >
                    {t.hit && (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-game-success text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Moving arrow */}
                <motion.div
                  className="absolute left-0 right-0 flex items-center justify-center"
                  style={{ top: arrowY }}
                >
                  <div className={`w-full h-2 rounded-full transition-colors duration-100 ${
                    lastHit === 'hit' ? 'bg-game-success shadow-[0_0_10px_hsl(142,76%,46%)]' :
                    lastHit === 'miss' ? 'bg-destructive shadow-[0_0_10px_hsl(var(--destructive))]' :
                    'bg-primary shadow-[0_0_8px_hsl(var(--primary))]'
                  }`} />
                </motion.div>

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
          </>
        ) : (
          /* Results */
          <div className="p-6 text-center space-y-4">
            <div className="text-4xl">
              {score > 2 ? '🎉' : score > 0 ? '💰' : score === 0 ? '🤝' : '😞'}
            </div>
            <div>
              <h4 className="font-mono font-bold text-foreground">
                {score > 2 ? 'Отличный торг!' : score > 0 ? 'Удалось!' : score === 0 ? 'Ничья' : 'Не повезло...'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {score > 0
                  ? `Бюджет увеличен на ${Math.min(30, 10 + (score - 1) * 5)}%!`
                  : score === 0
                  ? 'Бюджет остаётся прежним.'
                  : 'Заказчик не уступил. Бюджет без изменений.'}
              </p>
              {score > 0 && (
                <p className="text-lg font-mono font-bold text-game-gold mt-2">
                  ${Math.round(currentBudget * (1 + Math.min(30, 10 + (score - 1) * 5) / 100))}
                </p>
              )}
            </div>
            <Button onClick={handleFinish} className="w-full font-mono">
              {score > 0 ? '💰 Забрать!' : 'Ок, продолжим'}
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}