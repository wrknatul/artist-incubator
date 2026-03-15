import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroCutsceneProps {
  onComplete: () => void;
}

// Scene-based storytelling with animated emoji compositions
const SCENES = [
  {
    id: 'sleeping',
    phase: 'sleep',
    title: 'Zzz...',
    description: '',
    duration: 2500,
    auto: true,
  },
  {
    id: 'wakeup',
    phase: 'wakeup',
    title: '*зевает*',
    description: 'Утро... опять понедельник...',
    duration: 2000,
    auto: true,
  },
  {
    id: 'phone',
    phase: 'phone',
    title: 'Уведомление!',
    description: '📱 «Счёт за квартиру: $200. Баланс: $47»',
    duration: 0,
    auto: false,
  },
  {
    id: 'idea',
    phase: 'idea',
    title: 'А что если...',
    description: '«Стану фрилансером! Буду делать сайты, подниму бабок и запущу стартап!»',
    duration: 0,
    auto: false,
  },
  {
    id: 'computer',
    phase: 'computer',
    title: 'Биржа фриланса',
    description: 'Ты садишься за ноутбук и открываешь биржу. Пора брать первые заказы!',
    duration: 0,
    auto: false,
  },
];

export function IntroCutscene({ onComplete }: IntroCutsceneProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [eyeState, setEyeState] = useState<'closed' | 'half' | 'open'>('closed');

  const scene = SCENES[sceneIndex];

  // Auto-advance for timed scenes
  useEffect(() => {
    if (scene.auto && scene.duration > 0) {
      const timer = setTimeout(() => {
        setSceneIndex(prev => prev + 1);
      }, scene.duration);
      return () => clearTimeout(timer);
    }
  }, [sceneIndex, scene.auto, scene.duration]);

  // Eye animation for sleep/wakeup
  useEffect(() => {
    if (scene.phase === 'sleeping') {
      setEyeState('closed');
    } else if (scene.phase === 'wakeup') {
      setEyeState('half');
      const t = setTimeout(() => setEyeState('open'), 800);
      return () => clearTimeout(t);
    } else {
      setEyeState('open');
    }
  }, [scene.phase]);

  const handleNext = () => {
    if (sceneIndex < SCENES.length - 1) {
      setSceneIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const renderCharacter = () => {
    const phase = scene.phase;

    if (phase === 'sleeping' || phase === 'wakeup') {
      return (
        <div className="relative">
          {/* Room background elements */}
          <motion.div
            className="absolute -top-16 -left-20 text-4xl opacity-30"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🌙
          </motion.div>
          <motion.div
            className="absolute -top-12 right-[-60px] text-3xl opacity-20"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ⭐
          </motion.div>

          {/* Couch */}
          <div className="relative">
            <div className="text-7xl mb-2">🛋️</div>

            {/* Character on couch */}
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2"
              animate={phase === 'wakeup' ? { y: [-2, -14], rotate: [0, 0] } : { y: [0, -3, 0] }}
              transition={phase === 'wakeup' ? { duration: 0.8 } : { duration: 2, repeat: Infinity }}
            >
              <div className="text-5xl">
                {eyeState === 'closed' ? '😴' : eyeState === 'half' ? '😪' : '😳'}
              </div>
            </motion.div>

            {/* Slippers */}
            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-2xl">🩴</span>
              <span className="text-2xl">🩴</span>
            </motion.div>
          </div>

          {/* Zzz bubbles */}
          {phase === 'sleeping' && (
            <div className="absolute -top-8 right-[-40px]">
              {['z', 'Z', 'Z'].map((z, i) => (
                <motion.span
                  key={i}
                  className="absolute text-primary font-bold font-mono"
                  style={{ fontSize: `${14 + i * 6}px` }}
                  initial={{ opacity: 0, y: 0, x: i * 10 }}
                  animate={{ opacity: [0, 1, 0], y: -30 - i * 15, x: i * 12 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                >
                  {z}
                </motion.span>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (phase === 'phone') {
      return (
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl mb-2"
          >
            😨
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-6xl"
          >
            📱
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="absolute -top-2 right-[-16px] bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
          >
            !
          </motion.div>
        </div>
      );
    }

    if (phase === 'idea') {
      return (
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-5xl mb-2"
          >
            🤔
          </motion.div>
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: -20 }}
            transition={{ delay: 0.5, type: 'spring', bounce: 0.6 }}
            className="absolute -top-8 right-[-20px] text-5xl"
          >
            💡
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-3 mt-2"
          >
            <span className="text-3xl">💰</span>
            <span className="text-3xl">🚀</span>
            <span className="text-3xl">💻</span>
          </motion.div>
        </div>
      );
    }

    // computer phase
    return (
      <div className="relative">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl mb-2"
        >
          😎
        </motion.div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl"
        >
          💻
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ delay: 0.6, duration: 1.5, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-mono text-primary"
        >
          {'<code/>'}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`p-${sceneIndex}-${i}`}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
              y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 20,
            }}
            animate={{
              y: -20,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
            }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6 max-w-md px-6 text-center relative z-10"
        >
          {/* Character composition */}
          <div className="h-40 flex items-center justify-center">
            {renderCharacter()}
          </div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold font-mono text-primary"
          >
            {scene.title}
          </motion.h2>

          {/* Description */}
          {scene.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-foreground/80 text-lg leading-relaxed"
            >
              {scene.description}
            </motion.p>
          )}

          {/* Button (only for non-auto scenes) */}
          {!scene.auto && (
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={handleNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 px-8 py-3 bg-primary text-primary-foreground font-mono font-bold rounded-lg text-lg"
            >
              {sceneIndex < SCENES.length - 1 ? 'Дальше →' : '🚀 Начать карьеру!'}
            </motion.button>
          )}

          {/* Progress dots */}
          <div className="flex gap-2 mt-2">
            {SCENES.map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= sceneIndex ? 'bg-primary' : 'bg-muted'
                }`}
                animate={i === sceneIndex ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
