import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { distributeQuestions, calculatePlanningResult, type PlanningResult } from '@/lib/planningSystem';
import type { PlanningOption, PlanningQuestion } from '@/lib/planningData';
import type { FreelanceOrder } from '@/lib/gameData';

interface PlanningPhaseProps {
  order: FreelanceOrder;
  onComplete: (result: PlanningResult) => void;
}

export function PlanningPhase({ order, onComplete }: PlanningPhaseProps) {
  const projectType = order.category;
  const industry = order.industry || '';

  const { playerQuestions, autoQuestions } = useMemo(
    () => distributeQuestions(projectType),
    [projectType]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Map<string, PlanningOption>>(new Map());
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = playerQuestions[currentStep];
  const totalSteps = playerQuestions.length;
  const progress = showSummary ? 100 : Math.round((currentStep / totalSteps) * 100);

  const handleSelect = (option: PlanningOption) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, option);
    setAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const planningResult = useMemo(
    () => calculatePlanningResult(answers, projectType, industry),
    [answers, projectType, industry]
  );

  const handleStart = () => {
    onComplete(planningResult);
  };

  const isIndustryFit = (option: PlanningOption) =>
    option.industry_fit.includes(industry);

  // Summary screen
  if (showSummary) {
    const f = planningResult.forecast;
    const aspects = [
      { label: 'Дизайн', value: f.design, emoji: '🎨' },
      { label: 'Функционал', value: f.function, emoji: '⚙️' },
      { label: 'Перформанс', value: f.performance, emoji: '🏎️' },
      { label: 'SEO', value: f.seo, emoji: '🔍' },
    ];

    return (
      <div className="h-full flex flex-col bg-background">
        <div className="border-b p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{order.clientAvatar}</span>
            <div>
              <h2 className="font-mono font-bold text-foreground">{order.title}</h2>
              <p className="text-xs text-muted-foreground">Планирование завершено</p>
            </div>
          </div>
          <Progress value={100} className="h-1.5" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Player decisions */}
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-game-success" />
              Твои решения
            </h3>
            <div className="space-y-2">
              {planningResult.answers
                .filter(a => !a.isDefault)
                .map(a => (
                  <div key={a.questionId} className="flex items-center gap-2 rounded-lg border bg-card p-2.5">
                    <span className="text-lg">{a.selectedOption.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{a.questionText}</p>
                      <p className="text-sm font-medium text-foreground">{a.selectedOption.label}</p>
                    </div>
                    {a.selectedOption.industry_fit.includes(industry) && (
                      <Badge variant="outline" className="text-[10px] border-game-success/30 text-game-success shrink-0">
                        ✓ fit
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Auto-resolved */}
          {autoQuestions.length > 0 && (
            <div>
              <h3 className="font-mono text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-game-warning" />
                Автопилот — качество 30%
              </h3>
              <div className="space-y-1">
                {planningResult.answers
                  .filter(a => a.isDefault)
                  .map(a => (
                    <div key={a.questionId} className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-2 opacity-70">
                      <span className="text-sm">{a.selectedOption.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground truncate">{a.questionText}</p>
                        <p className="text-xs text-muted-foreground">{a.selectedOption.label}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Quality forecast */}
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground mb-3">📊 Прогноз качества</h3>
            <div className="space-y-3">
              {aspects.map(asp => (
                <div key={asp.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{asp.emoji} {asp.label}</span>
                    <span className="font-mono text-foreground">{Math.round(asp.value * 100)}%</span>
                  </div>
                  <Progress value={asp.value * 100} className="h-2" />
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <span className="font-mono text-xs text-muted-foreground">Множитель к оценке: </span>
              <span className={`font-mono font-bold ${planningResult.multiplier >= 1.0 ? 'text-game-success' : planningResult.multiplier >= 0.8 ? 'text-game-warning' : 'text-destructive'}`}>
                x{planningResult.multiplier.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t p-4 flex gap-2">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Назад
          </Button>
          <Button onClick={handleStart} className="flex-1 gap-2">
            <Zap className="h-4 w-4" />
            Начать разработку
          </Button>
        </div>
      </div>
    );
  }

  // Question step
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{order.clientAvatar}</span>
          <div>
            <h2 className="font-mono font-bold text-foreground">{order.title}</h2>
            <p className="text-xs text-muted-foreground">
              Планирование • Вопрос {currentStep + 1} из {totalSteps}
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <Badge variant="outline" className="mb-3 text-xs">
            {currentQuestion.emoji} {currentQuestion.domain === 'strategy' ? 'Стратегия' :
              currentQuestion.domain === 'design' ? 'Дизайн' :
              currentQuestion.domain === 'function' ? 'Функционал' :
              currentQuestion.domain === 'communication' ? 'Коммуникация' :
              currentQuestion.domain === 'seo' ? 'SEO' : 'Перформанс'}
          </Badge>
          <h3 className="font-mono text-lg font-bold text-foreground">
            {currentQuestion.text}
          </h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map(option => {
            const selected = answers.get(currentQuestion.id)?.id === option.id;
            const fit = isIndustryFit(option);
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{option.label}</span>
                      {fit && (
                        <Badge className="text-[10px] bg-game-success/20 text-game-success border-game-success/30">
                          подходит для {industry}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    {/* Effect hints */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {option.effects.design !== undefined && option.effects.design !== 0 && (
                        <span className={`text-[10px] font-mono ${option.effects.design > 0 ? 'text-game-success' : 'text-destructive'}`}>
                          🎨{option.effects.design > 0 ? '+' : ''}{Math.round(option.effects.design * 100)}%
                        </span>
                      )}
                      {option.effects.function !== undefined && option.effects.function !== 0 && (
                        <span className={`text-[10px] font-mono ${option.effects.function > 0 ? 'text-game-success' : 'text-destructive'}`}>
                          ⚙️{option.effects.function > 0 ? '+' : ''}{Math.round(option.effects.function * 100)}%
                        </span>
                      )}
                      {option.effects.performance !== undefined && option.effects.performance !== 0 && (
                        <span className={`text-[10px] font-mono ${option.effects.performance > 0 ? 'text-game-success' : 'text-destructive'}`}>
                          🏎️{option.effects.performance > 0 ? '+' : ''}{Math.round(option.effects.performance * 100)}%
                        </span>
                      )}
                      {option.effects.seo !== undefined && option.effects.seo !== 0 && (
                        <span className={`text-[10px] font-mono ${option.effects.seo > 0 ? 'text-game-success' : 'text-destructive'}`}>
                          🔍{option.effects.seo > 0 ? '+' : ''}{Math.round(option.effects.seo * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {currentStep > 0 && (
        <div className="border-t p-4">
          <Button variant="outline" onClick={handleBack} size="sm">
            ← Назад
          </Button>
        </div>
      )}
    </div>
  );
}
