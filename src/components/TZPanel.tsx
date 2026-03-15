import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, FileText } from 'lucide-react';
import type { TZRequirement } from '@/lib/clientSystem';

interface TZPanelProps {
  title: string;
  description: string;
  requirements: TZRequirement[];
  clientName: string;
  clientAvatar: string;
  budget: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  structure: { label: 'Структура', emoji: '📋' },
  design: { label: 'Дизайн', emoji: '🎨' },
  interactive: { label: 'Интерактив', emoji: '⚡' },
  content: { label: 'Контент', emoji: '📝' },
};

const DIFF_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: 'Лёгкий', color: 'text-green-400' },
  medium: { label: 'Средний', color: 'text-game-gold' },
  hard: { label: 'Сложный', color: 'text-destructive' },
};

export function TZPanel({ title, description, requirements, clientName, clientAvatar, budget, difficulty }: TZPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['structure', 'design', 'interactive', 'content'])
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const grouped = requirements.reduce<Record<string, TZRequirement[]>>((acc, r) => {
    (acc[r.category] = acc[r.category] || []).push(r);
    return acc;
  }, {});

  const diff = DIFF_LABELS[difficulty];

  return (
    <div className="h-full flex flex-col border-r bg-card">
      {/* Header */}
      <div
        className="px-3 py-2.5 border-b flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <h2 className="font-mono text-xs font-bold text-primary truncate">ТЗ</h2>
            <p className="text-[10px] text-muted-foreground truncate">{requirements.length} пунктов</p>
          </div>
        </div>
        {collapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-auto p-3 space-y-3">
          {/* Order meta */}
          <div className="bg-secondary/30 rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">{clientAvatar}</span>
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-foreground truncate">{clientName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-game-gold">💰 ${budget}</span>
              <span className={diff.color}>⚡ {diff.label}</span>
            </div>
          </div>

          {/* Requirements by category */}
          {Object.entries(grouped).map(([cat, reqs]) => {
            const catInfo = CATEGORY_LABELS[cat] || { label: cat, emoji: '📌' };
            const isExpanded = expandedCategories.has(cat);

            return (
              <div key={cat}>
                <button
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center gap-1.5 w-full text-left mb-1.5 group"
                >
                  {isExpanded
                    ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    : <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  }
                  <span className="text-[11px] font-mono font-semibold text-foreground">
                    {catInfo.emoji} {catInfo.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">({reqs.length})</span>
                </button>

                {isExpanded && (
                  <div className="space-y-1 ml-4">
                    {reqs.map(req => (
                      <div
                        key={req.id}
                        className="flex items-start gap-2 p-2 rounded-md bg-secondary/20 border border-border/50"
                      >
                        <Circle className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-mono font-semibold text-foreground">{req.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{req.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}