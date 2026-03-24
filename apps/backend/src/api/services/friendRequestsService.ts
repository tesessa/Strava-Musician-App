import { FriendRequestsDAO } from "../../db/dao/daos/friendRequestsDao";
import { createNotification } from "./notificationsService";
import { NotificationType, NotificationEntityType } from "@strava-musician-app/shared";

export function createFriendRequestsService(friendRequestsDao: FriendRequestsDAO) {
  return {
    async createFriendRequest(senderId: string, receiverId: string) {
      const result = await friendRequestsDao.createFriendRequest(senderId, receiverId);
      // Notify the receiver
      await createNotification({
        userId: receiverId,
        actorId: senderId,
        type: "friendRequest" as NotificationType,
        entityType: "user" as NotificationEntityType,
        entityId: result?.requestId || "",
        createdAt: new Date().toISOString(),
        isRead: false,
      });
      return result;
    },
    async getFriendRequestById(requestId: string) {
      return friendRequestsDao.getFriendRequestById(requestId);
    },
    async listIncoming(userId: string, options: { lastRequestId?: string, pageSize?: number } = {}) {
      return friendRequestsDao.listIncoming(userId, options);
    },
    async listOutgoing(userId: string, options: { lastRequestId?: string, pageSize?: number } = {}) {
      return friendRequestsDao.listOutgoing(userId, options);
    },
    async acceptRequest(requestId: string) {
      return friendRequestsDao.acceptRequest(requestId);
    },
    async rejectRequest(requestId: string) {
      return friendRequestsDao.rejectRequest(requestId);
    },
    async cancelRequest(requestId: string) {
      return friendRequestsDao.cancelRequest(requestId);
    },
  };
}
