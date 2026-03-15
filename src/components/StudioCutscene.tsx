import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudioCutsceneProps {
  onComplete: () => void;
}

const SCENES = [
  {
    id: 'reflection',
    title: 'Хм...',
    description: 'Заказов всё больше, баланс растёт... Может, пора масштабироваться?',
    emoji: '🤔',
    secondaryEmojis: ['💰', '📈', '💼'],
    auto: false,
  },
  {
    id: 'idea',
    title: 'Пора собрать команду!',
    description: 'Один в поле не воин. С командой можно брать крупные проекты, делать их быстрее и качественнее.',
    emoji: '💡',
    secondaryEmojis: ['👨‍💻', '🎨', '📋', '📢'],
    auto: false,
  },
  {
    id: 'studio',
    title: '🏢 Студия открыта!',
    description: 'Теперь в телефоне доступна вкладка "Наём". Ищи сотрудников, проводи собеседования и собирай dream team!',
    emoji: '🚀',
    secondaryEmojis: ['🎉', '⭐', '🏆'],
    auto: false,
  },
];

export function StudioCutscene({ onComplete }: StudioCutsceneProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = SCENES[sceneIndex];

  const handleNext = () => {
    if (sceneIndex < SCENES.length - 1) {
      setSceneIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-background flex items-center justify-center overflow-hidden">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`p-${sceneIndex}-${i}`}
            className="absolute w-1.5 h-1.5 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
              y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 20,
            }}
            animate={{
              y: -20,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
            }}
            transition={{
              duration: 4 + Math.random() * 3,
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
          {/* Main emoji */}
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-7xl"
          >
            {scene.emoji}
          </motion.div>

          {/* Secondary emojis */}
          <div className="flex gap-4">
            {scene.secondaryEmojis.map((e, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="text-3xl"
              >
                {e}
              </motion.span>
            ))}
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-foreground/80 text-lg leading-relaxed"
          >
            {scene.description}
          </motion.p>

          {/* Button */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={handleNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 px-8 py-3 bg-primary text-primary-foreground font-mono font-bold rounded-lg text-lg"
          >
            {sceneIndex < SCENES.length - 1 ? 'Дальше →' : '🏢 Начать набор!'}
          </motion.button>

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
