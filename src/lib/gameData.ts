import type { ClientProfile, TZRequirement } from './clientSystem';
import type { HiredEmployee, EmployeeCandidate } from './hiringSystem';

export interface FreelanceOrder {
  id: string;
  clientName: string;
  clientAvatar: string;
  title: string;
  description: string;
  budget: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  prompt: string;
  deadline?: Deadline;
  industry?: string;
  clientProfile?: ClientProfile;
  runwayAvatarId?: string;
  requirements: TZRequirement[]; // Full visible TZ requirements
}

export interface CompletedReview {
  clientName: string;
  clientAvatar: string;
  orderTitle: string;
  rating: number;
  text: string;
  earned: number;
  month: number;
}

export interface GameState {
  balance: number;
  reputation: number;
  completedOrders: number;
  currentOrder: FreelanceOrder | null;
  ownedItems: string[];
  month: number;
  introDone: boolean;
  negotiatedBudget: number | null;
  reviews: CompletedReview[];
  // Phase 2: Hiring
  studioUnlocked: boolean;
  studioCutsceneDone: boolean;
  employees: HiredEmployee[];
  candidatePool: EmployeeCandidate[];
}

export const BASE_MONTHLY_EXPENSES = 330;
export const STUDIO_UNLOCK_BALANCE = 5000;

export const INITIAL_GAME_STATE: GameState = {
  balance: 500,
  reputation: 0,
  completedOrders: 0,
  currentOrder: null,
  ownedItems: [],
  month: 1,
  introDone: false,
  negotiatedBudget: null,
  reviews: [],
  studioUnlocked: false,
  studioCutsceneDone: false,
  employees: [],
  candidatePool: [],
};

export function getAverageRating(reviews: CompletedReview[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function getFreelancerLevel(completedOrders: number): { level: number; title: string; nextAt: number } {
  if (completedOrders >= 50) return { level: 6, title: 'Легенда', nextAt: 999 };
  if (completedOrders >= 30) return { level: 5, title: 'Мастер', nextAt: 50 };
  if (completedOrders >= 15) return { level: 4, title: 'Эксперт', nextAt: 30 };
  if (completedOrders >= 8) return { level: 3, title: 'Профи', nextAt: 15 };
  if (completedOrders >= 3) return { level: 2, title: 'Исполнитель', nextAt: 8 };
  return { level: 1, title: 'Новичок', nextAt: 3 };
}
