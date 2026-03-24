import { createChallengesDao } from "../../db/dao/factories/challengesDaoFactory";
import type { Challenge, CreateChallengeRequest, CompletedChallenge } from "@strava-musician-app/shared";
import { NotificationsService } from "./notificationsService";
import { NotificationType, NotificationEntityType } from "@strava-musician-app/shared";

export class ChallengesService {
  private challengesDao = createChallengesDao();
  private notificationsService = new NotificationsService();
  async listChallenges(): Promise<Challenge[]> {
    return this.challengesDao.listChallenges();
  }
  async createChallenge(data: CreateChallengeRequest) {
    if (!data.description || !data.task || !data.targetNumber) {
      return { error: "missing_fields", status: 400 };
    }
    const challenge: Challenge = {
      challengeId: crypto.randomUUID(),
      ...data,
    };
    await this.challengesDao.addChallenge(challenge);
    return { challenge };
  }
  async getChallenge(challengeId: string): Promise<Challenge | undefined> {
    return this.challengesDao.getChallengeById(challengeId);
  }
  async completeChallenge(userId: string, challengeId: string) {
    const challenge = await this.challengesDao.getChallengeById(challengeId);
    if (!challenge) return { error: "not_found", status: 404 };
    const completed: CompletedChallenge = {
      userId,
      challengeId,
      completedAt: new Date().toISOString(),
    };
    await this.challengesDao.addCompletedChallenge(completed);
    // Notify the user
    await this.notificationsService.createNotification({
      userId,
      actorId: userId,
      type: "challengeCompleted" as NotificationType,
      entityType: "challenge" as NotificationEntityType,
      entityId: challengeId,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
    return { success: true };
  }
  async listCompletedChallenges(userId: string): Promise<CompletedChallenge[]> {
    return this.challengesDao.getCompletedChallengesForUser(userId);
  }
};