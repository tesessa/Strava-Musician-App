import type { Challenge, CompletedChallenge } from "@strava-musician-app/shared";

export interface ChallengesDAO {
  listChallenges(): Promise<Challenge[]>;
  addChallenge(challenge: Challenge): Promise<void>;
  getChallengeById(challengeId: string): Promise<Challenge | undefined>;
  addCompletedChallenge(completed: CompletedChallenge): Promise<void>;
  getCompletedChallengesForUser(userId: string): Promise<CompletedChallenge[]>;
}