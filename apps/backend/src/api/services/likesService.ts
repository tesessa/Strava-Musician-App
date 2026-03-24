import { createLikesDAO } from "../../db/dao/factories/likesDaoFactory";
import { createPracticeLogDAO } from "../../db/dao/factories/practiceLogDaoFactory";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import type { Like } from "@strava-musician-app/shared";
import { createNotification } from "./notificationsService";
import { NotificationType, NotificationEntityType } from "@strava-musician-app/shared";
import { createFriendsDAO } from "@/db/dao/factories/friendsDaoFactory";

export function getLikesService() {
  const likesDao = createLikesDAO();
  const practiceLogDAO = createPracticeLogDAO();
  const userDAO = createUserDAO();
  const friendsDAO = createFriendsDAO();

  return {
    async likePracticeLog(userId: string, practiceLogId: string) {
      // Check if already liked
      if (await likesDao.hasUserLikedPracticeLog(userId, practiceLogId)) {
        return { error: "already_liked", status: 400 };
      }
      await likesDao.addLike({ userId, practiceLogId, createdAt: new Date().toISOString() });
      // Notify the log owner
      const log = await practiceLogDAO.getPracticeLog(practiceLogId);
      if (log && log.userId !== userId) {
        await createNotification({
          userId: log.userId,
          actorId: userId,
          type: "like" as NotificationType,
          entityType: "practiceLog" as NotificationEntityType,
          entityId: practiceLogId,
          createdAt: new Date().toISOString(),
          isRead: false,
        });
      }
      return { success: true };
    },
    async unlikePracticeLog(userId: string, practiceLogId: string) {
      // Check if the practice log exists
      const log = await practiceLogDAO.getPracticeLog(practiceLogId);
      if (!log) {
        return { error: "not_found", status: 404 };
      }
      // Check if the user has liked the log
      const hasLiked = await likesDao.hasUserLikedPracticeLog(userId, practiceLogId);
      if (!hasLiked) {
        return { error: "forbidden", status: 403 };
      }
      await likesDao.removeLike(userId, practiceLogId);
      return { success: true };
    },
    async hasUserLikedPracticeLog(userId: string, practiceLogId: string) {
      return likesDao.hasUserLikedPracticeLog(userId, practiceLogId);
    },
    async getPracticeLogLikes(practiceLogId: string): Promise<Like[]> {
      return likesDao.getLikesForPracticeLog(practiceLogId);
    },
    async getPracticeLogOwnerId(practiceLogId: string): Promise<string | null> {
      const log = await practiceLogDAO.getPracticeLog(practiceLogId);
      return log ? log.userId : null;
    },
    async canUserAccessPracticeLog(userId: string, practiceLogId: string): Promise<boolean> {
      const log = await practiceLogDAO.getPracticeLog(practiceLogId);
      if (!log) return false;
      const owner = await userDAO.findUserById(log.userId);
      if (!owner) return false;
      if (log.userId === userId) return true;
      if (owner.postVisibility === "public") return true;
      if (owner.postVisibility === "friends") {
        // Check if user is a friend
        return friendsDAO.isFriend(log.userId, userId);
      }
      return false;
    },
  };
}
