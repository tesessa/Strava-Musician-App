import { createChallengesDao } from "../../db/dao/factories/challengesDaoFactory";
import type { Challenge, CreateChallengeRequest, CompletedChallenge } from "@strava-musician-app/shared";
import { createNotification } from "./notificationsService";
import { NotificationType, NotificationEntityType } from "@strava-musician-app/shared";

export function getChallengesService() {
  const challengesDao = createChallengesDao();

  return {
    async listChallenges(): Promise<Challenge[]> {
      return challengesDao.listChallenges();
    },
    async createChallenge(data: CreateChallengeRequest) {
      if (!data.description || !data.task || !data.targetNumber) {
        return { error: "missing_fields", status: 400 };
      }
      const challenge: Challenge = {
        challengeId: crypto.randomUUID(),
        ...data,
      };
      await challengesDao.addChallenge(challenge);
      return { challenge };
    },
    async getChallenge(challengeId: string): Promise<Challenge | undefined> {
      return challengesDao.getChallengeById(challengeId);
    },
    async completeChallenge(userId: string, challengeId: string) {
      const challenge = await challengesDao.getChallengeById(challengeId);
      if (!challenge) return { error: "not_found", status: 404 };
      const completed: CompletedChallenge = {
        userId,
        challengeId,
        completedAt: new Date().toISOString(),
      };
      await challengesDao.addCompletedChallenge(completed);
      // Notify the user
      await createNotification({
        userId,
        actorId: userId,
        type: "challengeCompleted" as NotificationType,
        entityType: "challenge" as NotificationEntityType,
        entityId: challengeId,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
      return { success: true };
    },
    async listCompletedChallenges(userId: string): Promise<CompletedChallenge[]> {
      return challengesDao.getCompletedChallengesForUser(userId);
    },
  };
}