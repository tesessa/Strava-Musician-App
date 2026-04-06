import { 
    Challenge,
    ChallengeTask,
    CompletedChallengesResponse
 } from "@strava-musician-app/shared";
import { KodaServerApi } from "../network";


export class ChallengesService {
    constructor(private readonly server: KodaServerApi) {}

    /** GET /challenges */
    async getChallenges(): Promise<Challenge[]> {
        return this.server.getChallenges();
    }

    /** POST /challenges */
    async createChallenge(description: string, task: ChallengeTask | string, targetNumber: number, instrument?: string): Promise<Challenge> {
        return this.server.createChallenge({description, task, targetNumber, instrument});
    }

   /** GET /challenges/:challengeId */ 
    async getChallenge(challengeId: string): Promise<Challenge> {
        return this.server.getChallenge(challengeId);
    }

    /** POST /challenges/:challengeId/complete */
    async completeChallenge(challengeId: string): Promise<void> {
        return this.server.completeChallenge(challengeId);
    }

    async getCompletedChallenges(userId: string): Promise<CompletedChallengesResponse> {
        return this.server.getCompletedChallenges(userId);
    }
}