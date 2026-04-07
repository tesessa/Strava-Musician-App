import type { User } from "@strava-musician-app/shared";
import type { UserDAO } from "../../db/dao/daos/userDao";
import type { PracticeLogDAO } from "../../db/dao/daos/practiceLogDao";
import type { MediaDAO } from "../../db/dao/daos/mediaDao";
import type { CommentsDAO } from "../../db/dao/daos/commentsDao";
import type { LikesDAO } from "../../db/dao/daos/likesDao";
import type { FriendsDAO } from "../../db/dao/daos/friendsDao";
import type { FriendRequestsDAO } from "../../db/dao/daos/friendRequestsDao";
import type { NotificationsDAO } from "../../db/dao/daos/notificationsDao";
import type { ChallengesDAO } from "../../db/dao/daos/challengesDao";

export class UserService {
  constructor(
    private dao: UserDAO,
    private practiceLogDao: PracticeLogDAO,
    private mediaDao: MediaDAO,
    private commentsDao: CommentsDAO,
    private likesDao: LikesDAO,
    private friendsDao: FriendsDAO,
    private friendRequestsDao: FriendRequestsDAO,
    private notificationsDao: NotificationsDAO,
    private challengesDao: ChallengesDAO
  ) {}

  async getUser(id: string) {
    return await this.dao.findUserById(id);
  }

  async updateUser(id: string, patch: Partial<User>) {
    return await this.dao.updateUser(id, patch);
  }

  async deleteUser(id: string) {
    // Delete practice logs and associated media/comments/likes
    const logs = await this.practiceLogDao.getUserPracticeLogs(id, null, 1000);
    for (const log of logs) {
      await this.mediaDao.listMedia(log.practiceLogId).then(async (res) => {
        for (const media of res) {
          await this.mediaDao.deleteMedia(media.mediaId);
        }
      });
      const comments = await this.commentsDao.getCommentsForPracticeLog(log.practiceLogId);
      for (const comment of comments) {
        await this.commentsDao.removeComment(comment.commentId);
      }
      const likes = await this.likesDao.getLikesForPracticeLog(log.practiceLogId);
      for (const like of likes) {
        await this.likesDao.removeLike(like.userId, log.practiceLogId);
      }
      await this.practiceLogDao.deletePracticeLog(log.practiceLogId);
    }

    // Delete friends
    const friends = await this.friendsDao.listFriends(id, { lastFriendId: null, pageSize: 1000 });
    for (const friend of friends) {
      await this.friendsDao.removeFriend(id, friend.friendId);
    }

    // Delete friend requests
    const incoming = await this.friendRequestsDao.listIncoming(id, { lastRequestId: undefined, pageSize: 1000 });
    for (const req of incoming) {
      await this.friendRequestsDao.cancelRequest(req.requestId);
    }
    const outgoing = await this.friendRequestsDao.listOutgoing(id, { lastRequestId: undefined, pageSize: 1000 });
    for (const req of outgoing) {
      await this.friendRequestsDao.cancelRequest(req.requestId);
    }

    // Delete notifications
    const notifications = await this.notificationsDao.listNotifications(id);
    for (const n of notifications) {
      await this.notificationsDao.deleteNotification(n.notificationId);
    }

    // Finally, delete the user
    return await this.dao.deleteUser(id);
  }

  async searchUsers(query: string) {
    return await this.dao.searchUsers(query);
  }
}
