import type { Challenge, CompletedChallenge } from "@strava-musician-app/shared";
import type { ChallengesDAO } from "../daos/challengesDao";

class InMemoryChallengesDao implements ChallengesDAO {
  private challenges: Challenge[] = [];
  private completed: CompletedChallenge[] = [];

  async listChallenges() {
    return this.challenges;
  }
  async addChallenge(challenge: Challenge) {
    this.challenges.push(challenge);
  }
  async getChallengeById(challengeId: string) {
    return this.challenges.find(c => c.challengeId === challengeId);
  }
  async addCompletedChallenge(completed: CompletedChallenge) {
    this.completed.push(completed);
  }
  async getCompletedChallengesForUser(userId: string) {
    return this.completed.filter(c => c.userId === userId);
  }
}

export const ChallengesDao = new InMemoryChallengesDao();