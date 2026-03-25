import type { KodaServerApi } from "../network/KodaServerApi";
import type {
  NotificationsListResponse,
  FriendRequest,
  IncomingFriendRequestsResponse,
} from "@strava-musician-app/shared";

export class NotificationService {
  constructor(private readonly server: KodaServerApi) {}

  async getNotifications(): Promise<NotificationsListResponse> {
    return this.server.getNotifications();
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.server.markNotificationRead(notificationId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return this.server.deleteNotification(notificationId);
  }

  async getIncomingFriendRequests(
    lastItem?: string,
    pageSize?: number
  ): Promise<IncomingFriendRequestsResponse> {
    return this.server.getIncomingFriendRequests({ lastItem, pageSize });
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    return this.server.acceptFriendRequest(requestId);
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    return this.server.rejectFriendRequest(requestId);
  }

  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter((n) => !n.isRead).length;
  }
}