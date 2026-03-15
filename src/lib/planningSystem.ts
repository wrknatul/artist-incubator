// ============================================
// Planning System — Solo Mode Logic
// ============================================

import { getQuestionsForProjectType, type PlanningQuestion, type PlanningOption, type PlanningOptionEffect } from './planningData';

export interface PlanningAnswer {
  questionId: string;
  questionText: string;
  domain: string;
  selectedOption: PlanningOption;
  isDefault: boolean;  // true = auto-resolved at 30% quality
}

export interface QualityForecast {
  design: number;      // 0-1
  function: number;
  performance: number;
  seo: number;
}

export interface PlanningResult {
  answers: PlanningAnswer[];
  forecast: QualityForecast;
  multiplier: number;  // 0.5 - 1.2, applied to final review score
}

const PLAYER_QUESTION_COUNT = 5;
const DEFAULT_QUALITY = 0.3;

/**
 * Select questions for the player (solo mode):
 * 1. All boss_only questions
 * 2. Fill remaining slots with highest-priority questions
 * Returns { playerQuestions, autoQuestions }
 */
export function distributeQuestions(projectType: string): {
  playerQuestions: PlanningQuestion[];
  autoQuestions: PlanningQuestion[];
} {
  const allQuestions = getQuestionsForProjectType(projectType);
  
  const bossQuestions = allQuestions.filter(q => q.boss_only);
  const otherQuestions = allQuestions
    .filter(q => !q.boss_only)
    .sort((a, b) => b.priority - a.priority);

  const playerQuestions = [...bossQuestions];
  for (const q of otherQuestions) {
    if (playerQuestions.length >= PLAYER_QUESTION_COUNT) break;
    playerQuestions.push(q);
  }

  const playerIds = new Set(playerQuestions.map(q => q.id));
  const autoQuestions = allQuestions.filter(q => !playerIds.has(q.id));

  return { playerQuestions, autoQuestions };
}

/**
 * Get the "safe" default option for a question (first option).
 */
function getDefaultOption(question: PlanningQuestion): PlanningOption {
  return question.options[0];
}

/**
 * Calculate the planning result from player answers + auto-resolved questions.
 */
export function calculatePlanningResult(
  playerAnswers: Map<string, PlanningOption>,
  projectType: string,
  industry: string,
): PlanningResult {
  const { playerQuestions, autoQuestions } = distributeQuestions(projectType);
  const allQuestions = [...playerQuestions, ...autoQuestions];

  const answers: PlanningAnswer[] = [];
  const weightedEffects: { effects: PlanningOptionEffect; weight: number; industryBonus: number }[] = [];

  for (const q of allQuestions) {
    const isPlayer = playerAnswers.has(q.id);
    const option = isPlayer ? playerAnswers.get(q.id)! : getDefaultOption(q);
    const isDefault = !isPlayer;

    answers.push({
      questionId: q.id,
      questionText: q.text,
      domain: q.domain,
      selectedOption: option,
      isDefault,
    });

    // Weight: player answers count fully, defaults at 30%
    const weight = isDefault ? DEFAULT_QUALITY : 1.0;
    const industryBonus = option.industry_fit.includes(industry) ? 0.15 : 0;

    weightedEffects.push({ effects: option.effects, weight, industryBonus });
  }

  // Calculate forecast: base 0.5 + weighted effects
  const forecast: QualityForecast = { design: 0.5, function: 0.5, performance: 0.5, seo: 0.5 };
  let totalIndustryBonus = 0;

  for (const { effects, weight, industryBonus } of weightedEffects) {
    forecast.design += (effects.design || 0) * weight;
    forecast.function += (effects.function || 0) * weight;
    forecast.performance += (effects.performance || 0) * weight;
    forecast.seo += (effects.seo || 0) * weight;
    totalIndustryBonus += industryBonus * weight;
  }

  // Clamp all forecasts to 0-1
  forecast.design = clamp(forecast.design, 0, 1);
  forecast.function = clamp(forecast.function, 0, 1);
  forecast.performance = clamp(forecast.performance, 0, 1);
  forecast.seo = clamp(forecast.seo, 0, 1);

  // Overall multiplier: weighted average of aspects + industry bonus
  const avgQuality = (forecast.design + forecast.function + forecast.performance + forecast.seo) / 4;
  const multiplier = clamp(0.5 + avgQuality * 0.7 + totalIndustryBonus, 0.5, 1.2);

  return { answers, forecast, multiplier };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
