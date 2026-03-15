import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  SECTION_TEMPLATES, COLOR_SCHEMES, createSection,
  generateHtmlFromSections, 
  type BuilderSection, type SectionType 
} from '@/lib/siteBuilderData';
import type { FreelanceOrder } from '@/lib/gameData';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp, Eye, Package, Sparkles, Loader2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SiteBuilderProps {
  order: FreelanceOrder;
  onHtmlGenerated: (html: string) => void;
  onSubmitProject: () => void;
}

export function SiteBuilder({ order, onHtmlGenerated, onSubmitProject }: SiteBuilderProps) {
  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [aiEditId, setAiEditId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const addSection = (type: SectionType) => {
    const newSection = createSection(type);
    setSections(prev => [...prev, newSection]);
    setExpandedId(newSection.id);
    setShowPalette(false);
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const moveSection = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= sections.length) return;
    setSections(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const updateSection = (id: string, updates: Partial<BuilderSection>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const toggleElement = (sectionId: string, elementId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        elements: s.elements.map(el => 
          el.id === elementId ? { ...el, enabled: !el.enabled } : el
        ),
      };
    }));
  };

  const generatePreview = () => {
    const html = generateHtmlFromSections(sections, order.title, order.description);
    onHtmlGenerated(html);
    setHasGenerated(true);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      moveSection(dragIdx, idx);
      setDragIdx(idx);
    }
  };

  const handleAiEdit = async (sectionId: string) => {
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true);

    const section = sections.find(s => s.id === sectionId);
    if (!section) { setAiLoading(false); return; }

    const tmpl = SECTION_TEMPLATES.find(t => t.type === section.type)!;

    try {
      const { data, error } = await supabase.functions.invoke('edit-section', {
        body: {
          prompt: aiPrompt,
          sectionType: section.type,
          sectionLabel: tmpl.label,
          currentElements: section.elements,
          currentColorScheme: section.colorScheme,
          currentSubtitle: section.subtitle,
          orderTitle: order.title,
          orderDescription: order.description,
          availableColorSchemes: COLOR_SCHEMES.map(c => c.id),
        },
      });

      if (error) throw error;

      if (data) {
        const updates: Partial<BuilderSection> = {};
        if (data.subtitle) updates.subtitle = data.subtitle;
        if (data.colorScheme && COLOR_SCHEMES.find(c => c.id === data.colorScheme)) {
          updates.colorScheme = data.colorScheme;
        }
        if (data.elements && Array.isArray(data.elements)) {
          updates.elements = section.elements.map(el => {
            const match = data.elements.find((e: any) => e.label === el.label);
            return match ? { ...el, enabled: match.enabled } : el;
          });
        }
        updateSection(sectionId, updates);
      }

      setAiPrompt('');
      setAiEditId(null);
    } catch (e) {
      console.error('AI edit error:', e);
    } finally {
      setAiLoading(false);
    }
  };

  const template = (type: SectionType) => SECTION_TEMPLATES.find(t => t.type === type)!;

  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm font-semibold text-primary">{'>'} Конструктор</h2>
          <span className="font-mono text-xs text-muted-foreground">{sections.length} секц.</span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{order.title}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {sections.length === 0 && !showPalette && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm mb-2">Сайт пока пуст</p>
              <p className="text-xs opacity-60">Добавь секции, чтобы собрать страницу</p>
            </div>
          )}

          {sections.map((section, idx) => {
            const tmpl = template(section.type);
            const isExpanded = expandedId === section.id;
            const isAiEditing = aiEditId === section.id;

            return (
              <div
                key={section.id}
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={() => setDragIdx(null)}
                className={`rounded-lg border transition-colors ${
                  dragIdx === idx ? 'border-primary/50 bg-primary/5' : 'border-border bg-secondary/30'
                }`}
              >
                {/* Header */}
                <div 
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : section.id)}
                >
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab shrink-0" />
                  <span className="text-base">{tmpl.icon}</span>
                  <span className="text-xs font-mono font-medium text-foreground flex-1 truncate">
                    {section.subtitle || tmpl.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-border" 
                      style={{ background: COLOR_SCHEMES.find(c => c.id === section.colorScheme)?.accent }} />
                    {/* AI edit button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setAiEditId(isAiEditing ? null : section.id); }}
                      className={`p-0.5 transition-colors ${isAiEditing ? 'text-game-xp' : 'text-muted-foreground hover:text-game-xp'}`}
                      title="AI-редактирование"
                    >
                      <Sparkles className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                      className="p-0.5 hover:text-destructive text-muted-foreground transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>

                {/* AI Edit inline */}
                {isAiEditing && (
                  <div className="px-3 pb-2 border-t border-game-xp/20 pt-2 bg-game-xp/5">
                    <div className="flex gap-1.5">
                      <input
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAiEdit(section.id)}
                        placeholder="Напр: тёмная тема, добавь иконки..."
                        className="flex-1 bg-muted border border-border rounded px-2 py-1 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-game-xp"
                        disabled={aiLoading}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-game-xp hover:bg-game-xp/20"
                        onClick={() => handleAiEdit(section.id)}
                        disabled={aiLoading || !aiPrompt.trim()}
                      >
                        {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Expanded settings */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-2">
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Заголовок</label>
                      <input
                        value={section.subtitle}
                        onChange={e => updateSection(section.id, { subtitle: e.target.value })}
                        placeholder={tmpl.label}
                        className="w-full mt-1 bg-muted border border-border rounded px-2 py-1 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Цвет</label>
                      <div className="grid grid-cols-4 gap-1.5 mt-1">
                        {COLOR_SCHEMES.map(cs => (
                          <button
                            key={cs.id}
                            onClick={() => updateSection(section.id, { colorScheme: cs.id })}
                            className={`flex flex-col items-center gap-0.5 p-1.5 rounded border text-[9px] transition-colors ${
                              section.colorScheme === cs.id 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-border hover:border-muted-foreground text-muted-foreground'
                            }`}
                          >
                            <div className="flex gap-0.5">
                              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: cs.bg, border: '1px solid #333' }} />
                              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: cs.accent }} />
                            </div>
                            {cs.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Элементы</label>
                      <div className="space-y-1 mt-1">
                        {section.elements.map(el => (
                          <label key={el.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={el.enabled}
                              onChange={() => toggleElement(section.id, el.id)}
                              className="rounded border-border"
                            />
                            <span className={`text-xs font-mono ${el.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {el.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!showPalette ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs"
              onClick={() => setShowPalette(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Добавить секцию
            </Button>
          ) : (
            <div className="space-y-1 border rounded-lg border-primary/20 p-2 bg-muted/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-primary uppercase tracking-wider">Выбери секцию</span>
                <button onClick={() => setShowPalette(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
              </div>
              {SECTION_TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.type}
                  onClick={() => addSection(tmpl.type)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-primary/10 transition-colors text-left"
                >
                  <span className="text-base">{tmpl.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-medium text-foreground">{tmpl.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{tmpl.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t space-y-2">
        <Button size="sm" className="w-full font-mono text-xs" onClick={generatePreview} disabled={sections.length === 0}>
          <Eye className="h-3.5 w-3.5 mr-1.5" /> Собрать превью
        </Button>
        {hasGenerated && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-game-gold/50 text-game-gold hover:bg-game-gold/10 font-mono text-xs"
            onClick={onSubmitProject}
          >
            <Package className="h-3.5 w-3.5 mr-1.5" /> Сдать проект
          </Button>
        )}
      </div>
    </div>
  );
}
