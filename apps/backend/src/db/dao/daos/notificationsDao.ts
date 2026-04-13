import { Notification } from "@strava-musician-app/shared";

export interface NotificationsDAO {
  listNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<boolean>;
  deleteNotification(notificationId: string): Promise<boolean>;
  createNotification(notification: Omit<Notification, "notificationId">): Promise<Notification>;
  getNotificationById(notificationId: string): Promise<Notification | null>;
  /** Delete all notifications where user is userId or actorId */
  deleteAllForUser(userId: string): Promise<void>;
}
