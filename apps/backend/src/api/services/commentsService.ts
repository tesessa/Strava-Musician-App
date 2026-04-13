import { createCommentsDAO } from "../../db/dao/factories/commentsDaoFactory";
import { createPracticeLogDAO } from "../../db/dao/factories/practiceLogDaoFactory";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import { createFriendsDAO } from "../../db/dao/factories/friendsDaoFactory";
import type { Comment, CommentWithAuthor } from "@strava-musician-app/shared";
import { NotificationsService } from "./notificationsService";
import { NotificationType, NotificationEntityType } from "@strava-musician-app/shared";
import { enrichCommentsWithAuthors } from "../utils/userEnrichment";
import { toPublicUserProfile } from "../utils/publicProfile";

export class CommentsService {
  private commentsDao = createCommentsDAO();
  private practiceLogDao = createPracticeLogDAO();
  private notificationsService = new NotificationsService();
  private userDao = createUserDAO();
  private friendsDao = createFriendsDAO();

  async canUserAccessPracticeLog(userId: string, practiceLogId: string): Promise<boolean> {
    const log = await this.practiceLogDao.getPracticeLog(practiceLogId);
    if (!log) return false;
    const owner = await this.userDao.findUserById(log.userId);
    if (!owner) return false;
    if (log.userId === userId) return true;
    if (owner.postVisibility === "public") return true;
    if (owner.postVisibility === "friends") {
      return this.friendsDao.isFriend(log.userId, userId);
    }
    return false;
  }
  async createComment(userId: string, practiceLogId: string, text: string) {
    const log = await this.practiceLogDao.getPracticeLog(practiceLogId);
    if (!log) return { error: "not_found", status: 404 };
    const comment: Comment = {
      commentId: crypto.randomUUID(),
      practiceLogId,
      userId,
      text,
      createdAt: new Date().toISOString(),
    };
    await this.commentsDao.addComment(comment);
    const authorUser = await this.userDao.findUserById(userId);
    if (!authorUser) return { error: "not_found", status: 404 };
    const commentWithAuthor: CommentWithAuthor = {
      ...comment,
      author: toPublicUserProfile(authorUser),
    };
    // Notify the log owner
    if (log.userId !== userId) {
      await this.notificationsService.createNotification({
        userId: log.userId,
        actorId: userId,
        type: "comment" as NotificationType,
        entityType: "practiceLog" as NotificationEntityType,
        entityId: practiceLogId,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }
    return { comment: commentWithAuthor };
  }
  async listComments(practiceLogId: string): Promise<CommentWithAuthor[]> {
    const comments = await this.commentsDao.getCommentsForPracticeLog(practiceLogId);
    return enrichCommentsWithAuthors(this.userDao, comments);
  }
  async deleteComment(userId: string, commentId: string) {
    const comment = await this.commentsDao.getCommentById(commentId);
    if (!comment) return { error: "not_found", status: 404 };
    if (comment.userId !== userId) return { error: "forbidden", status: 403 };
    await this.commentsDao.removeComment(commentId);
    return;
  }
};

