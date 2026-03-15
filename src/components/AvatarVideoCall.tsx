import { useState, useCallback, useEffect, useRef } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SessionCredentials } from '@runwayml/avatars-react';
import { toast } from 'sonner';

const SESSION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/runway-session`;

interface AvatarVideoCallProps {
  avatarId: string;
  clientName: string;
  clientAvatar: string;
  onEnd?: () => void;
  autoStart?: boolean;
}

function friendlyMediaError(err: unknown): string {
  const name = (err as { name?: string })?.name;
  if (name === 'NotAllowedError') {
    return 'Доступ к камере/микрофону запрещён — разреши в настройках браузера и попробуй ещё раз.';
  }
  if (name === 'NotFoundError') {
    return 'Камера или микрофон не найдены (проверь, что устройства подключены).';
  }
  if (name === 'NotReadableError') {
    return 'Не удалось открыть камеру/микрофон (возможно, их уже использует другое приложение).';
  }
  return 'Не удалось запросить доступ к камере/микрофону.';
}

export function AvatarVideoCall({ avatarId, clientName, clientAvatar, onEnd, autoStart = false }: AvatarVideoCallProps) {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoStartedRef = useRef(false);

  const connectToAvatar = useCallback(async (_avatarId: string): Promise<SessionCredentials> => {
    setIsConnecting(true);
    setError(null);

    try {
      const resp = await fetch(SESSION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ avatarId: _avatarId }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Ошибка: ${resp.status}`);
      }

      const credentials = await resp.json();
      return credentials as SessionCredentials;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Не удалось подключиться';
      setError(msg);
      throw e;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleEnd = () => {
    setIsActive(false);
    onEnd?.();
  };

  const handleError = (err: Error) => {
    console.error('Avatar call error:', err);
    setError(err.message);
    toast.error(`Ошибка видеозвонка: ${err.message}`);
    setIsActive(false);
  };

  const startCall = async () => {
    setError(null);

    // Important: request media permissions from a user gesture *before* mounting the AvatarCall
    // so browsers won't block getUserMedia.
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = 'Браузер не поддерживает доступ к камере/микрофону.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach((t) => t.stop());
      setIsActive(true);
    } catch (e) {
      const msg = friendlyMediaError(e);
      setError(msg);
      toast.error(`Ошибка видеозвонка: ${msg}`);
      setIsActive(false);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isActive) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void startCall()}
          disabled={isConnecting}
          className="border-primary/50 text-primary hover:bg-primary/10 text-xs h-7 px-3 gap-1.5"
        >
          {isConnecting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Video className="h-3 w-3" />
          )}
          📹 Видеозвонок
        </Button>
        {error && (
          <p className="text-[10px] text-destructive text-center max-w-[200px]">{error}</p>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{clientAvatar}</span>
            <div>
              <h3 className="font-mono text-sm font-bold text-foreground">{clientName}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground font-mono">Видеозвонок</span>
              </div>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEnd}
            className="gap-1.5"
          >
            <X className="h-4 w-4" />
            Завершить
          </Button>
        </div>

        {/* Avatar Call */}
        <div className="flex-1 relative">
          <AvatarCall
            avatarId={avatarId}
            connect={connectToAvatar}
            audio
            video
            onEnd={handleEnd}
            onError={handleError}
            className="w-full h-full"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
