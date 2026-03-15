import { Monitor } from 'lucide-react';

interface PreviewPanelProps {
  html: string | null;
}

export function PreviewPanel({ html }: PreviewPanelProps) {
  if (!html) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <Monitor className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-mono text-sm">Превью появится здесь</p>
          <p className="text-xs mt-1">Напиши в чат, что нужно сгенерировать</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-2 border-b bg-card flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-game-warning/60" />
          <div className="w-3 h-3 rounded-full bg-game-success/60" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">preview.html</span>
      </div>
      <iframe
        srcDoc={html}
        className="flex-1 w-full bg-foreground"
        title="Preview"
        sandbox="allow-scripts"
      />
    </div>
  );
}
