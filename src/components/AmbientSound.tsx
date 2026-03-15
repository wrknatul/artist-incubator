import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function AmbientSound() {
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/ambient-lofi.mp3');
    audio.loop = true;
    audio.volume = 0.6;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (muted) {
      audio.play().catch((e) => console.warn('Audio play blocked:', e));
      setMuted(false);
    } else {
      audio.pause();
      setMuted(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary/50 transition-colors"
      title={muted ? 'Включить звук' : 'Выключить звук'}
    >
      {muted ? (
        <VolumeX className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Volume2 className="h-4 w-4 text-primary" />
      )}
    </button>
  );
}
