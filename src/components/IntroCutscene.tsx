import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroCutsceneProps {
  onComplete: () => void;
}

const SCENES = [
  {
    id: 'couch',
    emoji: '🛋️',
    title: 'Обычный вечер...',
    description: 'Ты лежишь на диване в тапочках, листаешь ленту. Жизнь скучная, зарплата маленькая, мечты большие.',
    items: ['🩴', '📱', '🍕'],
    bg: 'from-secondary to-background',
  },
  {
    id: 'idea',
    emoji: '💡',
    title: 'А что если...',
    description: '«А что если я создам свой стартап? Стану следующим Дуровым! Но сначала надо поднять бабок...»',
    items: ['🧠', '💭', '🚀'],
    bg: 'from-background to-secondary',
  },
  {
    id: 'computer',
    emoji: '💻',
    title: 'Биржа фриланса',
    description: 'Ты садишься за компьютер и регистрируешься на бирже фриланса. Пора брать первые заказы!',
    items: ['⌨️', '🖱️', '☕'],
    bg: 'from-secondary to-background',
  },
];

export function IntroCutscene({ onComplete }: IntroCutsceneProps) {
  const [sceneIndex, setSceneIndex] = useState(0);

  const handleNext = () => {
    if (sceneIndex < SCENES.length - 1) {
      setSceneIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const scene = SCENES[sceneIndex];

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden">
      {/* Ambient floating emojis */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`${scene.id}-${i}`}
            className="absolute text-3xl opacity-10"
            initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 50 }}
            animate={{
              y: -100,
              x: Math.random() * window.innerWidth,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'linear',
            }}
          >
            {scene.items[i % scene.items.length]}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-8 max-w-lg px-6 text-center relative z-10"
        >
          {/* Main emoji */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="text-8xl"
          >
            {scene.emoji}
          </motion.div>

          {/* Items row */}
          <div className="flex gap-4">
            {scene.items.map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="text-3xl"
              >
                {item}
              </motion.span>
            ))}
          </div>

          {/* Text */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold font-mono text-primary text-glow"
          >
            {scene.title}
          </motion.h2>

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={handleNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-8 py-3 bg-primary text-primary-foreground font-mono font-bold rounded-lg glow-primary text-lg"
          >
            {sceneIndex < SCENES.length - 1 ? 'Дальше →' : '🚀 Начать карьеру!'}
          </motion.button>

          {/* Progress dots */}
          <div className="flex gap-2 mt-2">
            {SCENES.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= sceneIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
