import type { ClientProfile, Deadline } from './clientSystem';
import type { PlanningResult } from './planningSystem';

export type GamePhase = 'board' | 'planning' | 'working';

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
  // New fields
  deadline?: Deadline;
  industry?: string;
  clientProfile?: ClientProfile;
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
  gamePhase: GamePhase;
  planningResult: PlanningResult | null;
}

export const BASE_MONTHLY_EXPENSES = 330;

export const INITIAL_GAME_STATE: GameState = {
  balance: 500,
  reputation: 0,
  completedOrders: 0,
  currentOrder: null,
  ownedItems: [],
  month: 1,
  introDone: false,
  negotiatedBudget: null,
  gamePhase: 'board',
  planningResult: null,
};
