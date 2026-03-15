import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  SECTION_TEMPLATES, COLOR_SCHEMES, createSection,
  generateHtmlFromSections, 
  type BuilderSection, type SectionType 
} from '@/lib/siteBuilderData';
import type { FreelanceOrder } from '@/lib/gameData';
import { Send, Loader2, Check, X, ChevronLeft, ChevronRight, Sparkles, Eye, Package, RotateCcw, GripVertical, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SiteBuilderProps {
  order: FreelanceOrder;
  onHtmlGenerated: (html: string) => void;
  onSubmitProject: () => void;
}

type WizardStep = 'prompt' | 'plan' | 'configure' | 'review';

interface PlanItem {
  type: SectionType;
  reason: string;
  included: boolean;
}

export function SiteBuilder({ order, onHtmlGenerated, onSubmitProject }: SiteBuilderProps) {
  const [step, setStep] = useState<WizardStep>('prompt');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [configIdx, setConfigIdx] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);

  // AI edit state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Step 1: Submit prompt → get plan
  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('plan-sections', {
        body: { prompt, orderTitle: order.title, orderDescription: order.description },
      });
      if (error) throw error;
      if (data?.sections) {
        setPlan(data.sections.map((s: any) => ({ ...s, included: true })));
        setStep('plan');
      }
    } catch (e) {
      console.error('Plan error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Approve plan → create sections
  const handleApprovePlan = () => {
    const included = plan.filter(p => p.included);
    const newSections = included.map(p => createSection(p.type));
    setSections(newSections);
    setConfigIdx(0);
    setStep('configure');
  };

  // Step 3: Navigate sections
  const currentSection = sections[configIdx];
  const currentTemplate = currentSection ? SECTION_TEMPLATES.find(t => t.type === currentSection.type) : null;

  const updateCurrentSection = (updates: Partial<BuilderSection>) => {
    setSections(prev => prev.map((s, i) => i === configIdx ? { ...s, ...updates } : s));
  };

  const toggleElement = (elementId: string) => {
    setSections(prev => prev.map((s, i) => {
      if (i !== configIdx) return s;
      return { ...s, elements: s.elements.map(el => el.id === elementId ? { ...el, enabled: !el.enabled } : el) };
    }));
  };

  // AI edit for current section
  const handleAiEdit = async () => {
    if (!aiPrompt.trim() || aiLoading || !currentSection) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-section', {
        body: {
          prompt: aiPrompt,
          sectionType: currentSection.type,
          sectionLabel: currentTemplate?.label,
          currentElements: currentSection.elements,
          currentColorScheme: currentSection.colorScheme,
          currentSubtitle: currentSection.subtitle,
          orderTitle: order.title,
          orderDescription: order.description,
          availableColorSchemes: COLOR_SCHEMES.map(c => c.id),
        },
      });
      if (error) throw error;
      if (data) {
        const updates: Partial<BuilderSection> = {};
        if (data.subtitle) updates.subtitle = data.subtitle;
        if (data.colorScheme && COLOR_SCHEMES.find(c => c.id === data.colorScheme)) updates.colorScheme = data.colorScheme;
        if (data.elements && Array.isArray(data.elements)) {
          updates.elements = currentSection.elements.map(el => {
            const match = data.elements.find((e: any) => e.label === el.label);
            return match ? { ...el, enabled: match.enabled } : el;
          });
        }
        updateCurrentSection(updates);
      }
      setAiPrompt('');
    } catch (e) {
      console.error('AI edit error:', e);
    } finally {
      setAiLoading(false);
    }
  };

  // Step 4: Generate final
  const handleGenerate = () => {
    const html = generateHtmlFromSections(sections, order.title, order.description);
    onHtmlGenerated(html);
    setHasGenerated(true);
  };

  const handleReset = () => {
    setStep('prompt');
    setPrompt('');
    setPlan([]);
    setSections([]);
    setConfigIdx(0);
    setHasGenerated(false);
  };

  return (
    <div className="flex flex-col h-full border-r bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm font-semibold text-primary">{'>'} Конструктор</h2>
          {step !== 'prompt' && (
            <button onClick={handleReset} className="text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {/* Step indicator */}
        <div className="flex gap-1 mt-2">
          {(['prompt', 'plan', 'configure', 'review'] as WizardStep[]).map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${
              i <= ['prompt', 'plan', 'configure', 'review'].indexOf(step) 
                ? 'bg-primary' : 'bg-muted'
            }`} />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
          {step === 'prompt' && '1/4 — Опиши что нужно'}
          {step === 'plan' && '2/4 — Одобри план'}
          {step === 'configure' && `3/4 — Настройка (${configIdx + 1}/${sections.length})`}
          {step === 'review' && '4/4 — Финальная проверка'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">

          {/* === STEP 1: PROMPT === */}
          {step === 'prompt' && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">📋 Заказ:</p>
                <p className="text-xs font-mono text-foreground">{order.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-3">{order.description}</p>
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Опиши что нужно сделать</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitPrompt(); } }}
                  placeholder="Напр: Лендинг с шапкой, блоком преимуществ, ценами, отзывами и формой обратной связи. Тёмная тема."
                  className="w-full mt-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[100px] resize-none"
                  disabled={isLoading}
                />
              </div>
              <Button size="sm" className="w-full font-mono text-xs" onClick={handleSubmitPrompt} disabled={!prompt.trim() || isLoading}>
                {isLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                {isLoading ? 'Составляю план...' : 'Составить план'}
              </Button>
            </div>
          )}

          {/* === STEP 2: PLAN === */}
          {step === 'plan' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Вот план. Убери лишнее или одобри:</p>
              {plan.map((item, i) => {
                const tmpl = SECTION_TEMPLATES.find(t => t.type === item.type);
                return (
                  <div 
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      item.included 
                        ? 'border-primary/30 bg-primary/5' 
                        : 'border-border bg-muted/30 opacity-50'
                    }`}
                  >
                    <span className="text-base">{tmpl?.icon || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-medium text-foreground">{tmpl?.label || item.type}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{item.reason}</div>
                    </div>
                    <button
                      onClick={() => setPlan(prev => prev.map((p, j) => j === i ? { ...p, included: !p.included } : p))}
                      className={`p-1 rounded transition-colors ${
                        item.included 
                          ? 'text-primary hover:text-destructive' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {item.included ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                );
              })}
              <Button 
                size="sm" className="w-full font-mono text-xs mt-3" 
                onClick={handleApprovePlan}
                disabled={plan.filter(p => p.included).length === 0}
              >
                <Check className="h-3.5 w-3.5 mr-1.5" /> 
                Одобрить ({plan.filter(p => p.included).length} секций)
              </Button>
            </div>
          )}

          {/* === STEP 3: CONFIGURE EACH === */}
          {step === 'configure' && currentSection && currentTemplate && (
            <div className="space-y-3">
              {/* Section indicator */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentTemplate.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-mono font-semibold text-foreground">{currentTemplate.label}</div>
                  <div className="text-[10px] text-muted-foreground">{currentTemplate.description}</div>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {configIdx + 1}/{sections.length}
                </span>
              </div>

              {/* AI assist */}
              <div className="bg-game-xp/5 border border-game-xp/20 rounded-lg p-2">
                <div className="flex gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-game-xp shrink-0 mt-0.5" />
                  <input
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAiEdit()}
                    placeholder="AI: «тёмная тема, убери навигацию»"
                    className="flex-1 bg-transparent text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none"
                    disabled={aiLoading}
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-game-xp hover:bg-game-xp/20" 
                    onClick={handleAiEdit} disabled={aiLoading || !aiPrompt.trim()}>
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              {/* Manual config */}
              <div className="space-y-3">
                {/* Subtitle */}
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Заголовок</label>
                  <input
                    value={currentSection.subtitle}
                    onChange={e => updateCurrentSection({ subtitle: e.target.value })}
                    placeholder={currentTemplate.label}
                    className="w-full mt-1 bg-muted border border-border rounded px-2 py-1.5 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Цвет</label>
                  <div className="grid grid-cols-4 gap-1.5 mt-1">
                    {COLOR_SCHEMES.map(cs => (
                      <button
                        key={cs.id}
                        onClick={() => updateCurrentSection({ colorScheme: cs.id })}
                        className={`flex flex-col items-center gap-0.5 p-1.5 rounded border text-[9px] transition-colors ${
                          currentSection.colorScheme === cs.id 
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

                {/* Elements */}
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Элементы</label>
                  <div className="space-y-1 mt-1">
                    {currentSection.elements.map(el => (
                      <label key={el.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={el.enabled} onChange={() => toggleElement(el.id)} className="rounded border-border" />
                        <span className={`text-xs font-mono ${el.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{el.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === STEP 4: REVIEW === */}
          {step === 'review' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Финальная проверка — всё правильно?</p>
              {sections.map((section, i) => {
                const tmpl = SECTION_TEMPLATES.find(t => t.type === section.type)!;
                const enabledCount = section.elements.filter(e => e.enabled).length;
                const cs = COLOR_SCHEMES.find(c => c.id === section.colorScheme);
                return (
                  <div key={section.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-secondary/30">
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-base">{tmpl.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-medium text-foreground truncate">{section.subtitle || tmpl.label}</div>
                      <div className="text-[10px] text-muted-foreground">{enabledCount} эл. • {cs?.label}</div>
                    </div>
                    <button
                      onClick={() => { setConfigIdx(i); setStep('configure'); }}
                      className="text-[10px] font-mono text-primary hover:underline"
                    >
                      изм.
                    </button>
                  </div>
                );
              })}

              <Button size="sm" className="w-full font-mono text-xs mt-3" onClick={handleGenerate}>
                <Eye className="h-3.5 w-3.5 mr-1.5" /> Собрать сайт
              </Button>

              {hasGenerated && (
                <Button
                  variant="outline" size="sm"
                  className="w-full border-game-gold/50 text-game-gold hover:bg-game-gold/10 font-mono text-xs"
                  onClick={onSubmitProject}
                >
                  <Package className="h-3.5 w-3.5 mr-1.5" /> Сдать проект
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Navigation for configure step */}
      {step === 'configure' && (
        <div className="p-3 border-t flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 font-mono text-xs"
            onClick={() => { if (configIdx > 0) setConfigIdx(configIdx - 1); }}
            disabled={configIdx === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Назад
          </Button>
          {configIdx < sections.length - 1 ? (
            <Button size="sm" className="flex-1 font-mono text-xs"
              onClick={() => setConfigIdx(configIdx + 1)}
            >
              Далее <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <Button size="sm" className="flex-1 font-mono text-xs bg-game-success hover:bg-game-success/90"
              onClick={() => setStep('review')}
            >
              <Check className="h-3.5 w-3.5 mr-1" /> К проверке
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
