import { createCommentsDAO } from "../../db/dao/factories/commentsDaoFactory";
import { createPracticeLogDAO } from "../../db/dao/factories/practiceLogDaoFactory";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import { createFriendsDAO } from "../../db/dao/factories/friendsDaoFactory";
import type { Comment } from "@strava-musician-app/shared";
import { createNotification } from "./notificationsService";
import { NotificationType, NotificationEntityType } from "@strava-musician-app/shared";

export function getCommentsService() {
  const commentsDao = createCommentsDAO();
  const practiceLogDao = createPracticeLogDAO();
  const userDao = createUserDAO();
  const friendsDao = createFriendsDAO();

  return {
    async canUserAccessPracticeLog(userId: string, practiceLogId: string): Promise<boolean> {
      const log = await practiceLogDao.getPracticeLog(practiceLogId);
      if (!log) return false;
      const owner = await userDao.findUserById(log.userId);
      if (!owner) return false;
      if (log.userId === userId) return true;
      if (owner.postVisibility === "public") return true;
      if (owner.postVisibility === "friends") {
        return friendsDao.isFriend(log.userId, userId);
      }
      return false;
    },
    async createComment(userId: string, practiceLogId: string, text: string) {
      const log = await practiceLogDao.getPracticeLog(practiceLogId);
      if (!log) return { error: "not_found", status: 404 };
      const comment: Comment = {
        commentId: crypto.randomUUID(),
        practiceLogId,
        userId,
        text,
        createdAt: new Date().toISOString(),
      };
      await commentsDao.addComment(comment);
      // Notify the log owner
      if (log.userId !== userId) {
        await createNotification({
          userId: log.userId,
          actorId: userId,
          type: "comment" as NotificationType,
          entityType: "practiceLog" as NotificationEntityType,
          entityId: practiceLogId,
          createdAt: new Date().toISOString(),
          isRead: false,
        });
      }
      return { comment };
    },
    async listComments(practiceLogId: string): Promise<Comment[]> {
      return commentsDao.getCommentsForPracticeLog(practiceLogId);
    },
    async deleteComment(userId: string, commentId: string) {
      const comment = await commentsDao.getCommentById(commentId);
      if (!comment) return { error: "not_found", status: 404 };
      if (comment.userId !== userId) return { error: "forbidden", status: 403 };
      await commentsDao.removeComment(commentId);
      return { success: true };
    },
  };
}
