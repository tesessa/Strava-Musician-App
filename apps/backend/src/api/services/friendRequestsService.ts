import { FriendRequestsDAO } from "../../db/dao/daos/friendRequestsDao";
import { NotificationsService } from "./notificationsService";
import { NotificationType, NotificationEntityType } from "@strava-musician-app/shared";

export class FriendRequestsService {
  private friendRequestsDao: FriendRequestsDAO;
  private notificationsService = new NotificationsService();

  constructor(friendRequestsDao: FriendRequestsDAO) {
    this.friendRequestsDao = friendRequestsDao;
  }

  async createFriendRequest(senderId: string, receiverId: string) {
    console.log(`Creating friend request from ${senderId} to ${receiverId}`);
    const result = await this.friendRequestsDao.createFriendRequest(senderId, receiverId);
    console.log(`Friend request created with ID: ${result.requestId}`);
    // Notify the receiver
    console.log(`Creating notification for receiver ${receiverId} about new friend request from ${senderId}`);
    await this.notificationsService.createNotification({
      userId: receiverId,
      actorId: senderId,
      type: "friendRequest" as NotificationType,
      entityType: "user" as NotificationEntityType,
      entityId: result?.requestId || "",
      createdAt: new Date().toISOString(),
      isRead: false,
    });
    console.log(`Notification created for friend request ID: ${result.requestId}`);
    return result;
  }
  async getFriendRequestById(requestId: string) {
    return this.friendRequestsDao.getFriendRequestById(requestId);
  }
  async listIncoming(userId: string, options: { lastRequestId?: string, pageSize?: number } = {}) {
    return this.friendRequestsDao.listIncoming(userId, options);
  }
  async listOutgoing(userId: string, options: { lastRequestId?: string, pageSize?: number } = {}) {
    return this.friendRequestsDao.listOutgoing(userId, options);
  }
  async acceptRequest(requestId: string) {
    return this.friendRequestsDao.acceptRequest(requestId);
  }
  async rejectRequest(requestId: string) {
    return this.friendRequestsDao.rejectRequest(requestId);
  }
  async cancelRequest(requestId: string) {
    return this.friendRequestsDao.cancelRequest(requestId);
  }
};

