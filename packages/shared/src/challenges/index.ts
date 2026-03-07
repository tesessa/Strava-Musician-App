import type { ChallengeTask } from "../enums";

/**
 * Challenge definition
 */
export interface Challenge {
  challengeId: string;
  description: string;
  task: ChallengeTask | string;
  targetNumber: number;
  instrument?: string;
}

/**
 * POST /challenges body (admin)
 */
export interface CreateChallengeRequest {
  description: string;
  task: ChallengeTask | string;
  targetNumber: number;
  instrument?: string;
}

/**
 * User completed a challenge
 */
export interface CompletedChallenge {
  userId: string;
  challengeId: string;
  completedAt: string;
}

/**
 * GET /users/:userId/completed-challenges response
 */
export type CompletedChallengesResponse = CompletedChallenge[];
