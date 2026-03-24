import { Notification } from "@strava-musician-app/shared";
import { createNotificationsDao } from "../../db/dao/factories/notificationsDaoFactory";

export class NotificationsService {
  private dao = createNotificationsDao();

  async listNotifications(userId: string): Promise<Notification[]> {
    return this.dao.listNotifications(userId);
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<boolean> {
    const notification = await this.getNotificationById(notificationId);
    if (!notification || notification?.userId !== userId) return false; // Only allow marking own notifications that exist
    return this.dao.markNotificationRead(notificationId);
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const notification = await this.getNotificationById(notificationId);
    if (!notification || notification?.userId !== userId) return false; // Only allow deleting own notifications that exist
    return this.dao.deleteNotification(notificationId);
  }

  async createNotification(notification: Omit<Notification, "notificationId">): Promise<Notification> {
    return this.dao.createNotification(notification);
  }

  async getNotificationById(notificationId: string): Promise<Notification | null> {
    return this.dao.getNotificationById(notificationId);
  }
};