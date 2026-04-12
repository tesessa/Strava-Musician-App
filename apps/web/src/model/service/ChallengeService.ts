import type {
  Challenge,
  CompletedChallenge,
  CreateChallengeRequest,
} from "@strava-musician-app/shared";
import type { KodaServerApi } from "../network/KodaServerApi";

export interface CompletedChallengeWithDetails {
  completion: CompletedChallenge;
  challenge: Challenge | null;
}

export class ChallengeService {
  constructor(private readonly server: KodaServerApi) {}

  async getChallenges(): Promise<Challenge[]> {
    return this.server.getChallenges();
  }

  async createChallenge(request: CreateChallengeRequest): Promise<Challenge> {
    return this.server.createChallenge(request);
  }

  async completeChallenge(challengeId: string): Promise<void> {
    return this.server.completeChallenge(challengeId);
  }

  async getCompletedChallenges(userId: string): Promise<CompletedChallenge[]> {
    return this.server.getCompletedChallenges(userId);
  }

  async getCompletedChallengesWithDetails(
    userId: string,
  ): Promise<CompletedChallengeWithDetails[]> {
    const [completed, challenges] = await Promise.all([
      this.server.getCompletedChallenges(userId),
      this.server.getChallenges(),
    ]);

    const challengesById = new Map(
      challenges.map((challenge) => [challenge.challengeId, challenge]),
    );

    return completed.map((completion) => ({
      completion,
      challenge: challengesById.get(completion.challengeId) ?? null,
    }));
  }
}