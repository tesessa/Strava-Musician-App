import { Notification } from "@strava-musician-app/shared";
import { NotificationsDAO } from "../daos/notificationsDao";

const notificationsByUser: Record<string, Notification[]> = {};

class InMemoryNotificationsDao implements NotificationsDAO {
  async listNotifications(userId: string): Promise<Notification[]> {
    return notificationsByUser[userId] || [];
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    for (const userId in notificationsByUser) {
      const notifications = notificationsByUser[userId];
      const notif = notifications.find(n => n.notificationId === notificationId);
      if (notif) {
        notif.isRead = true;
        return true;
      }
    }
    return false;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    for (const userId in notificationsByUser) {
      const notifications = notificationsByUser[userId];
      const idx = notifications.findIndex(n => n.notificationId === notificationId);
      if (idx !== -1) {
        notifications.splice(idx, 1);
        return true;
      }
    }
    return false;
  }

  async createNotification(notification: Omit<Notification, "notificationId">): Promise<Notification> {
    const notif: Notification = { ...notification, notificationId: crypto.randomUUID() };
    if (!notificationsByUser[notif.userId]) notificationsByUser[notif.userId] = [];
    notificationsByUser[notif.userId].push(notif);
    return notif;
  }

  async getNotificationById(notificationId: string): Promise<Notification | null> {
    for (const userId in notificationsByUser) {
      const notif = notificationsByUser[userId].find(n => n.notificationId === notificationId);
      if (notif) return notif;
    }
    return null;
  }
  
  reset() {
    Object.keys(notificationsByUser).forEach(key => delete notificationsByUser[key]);
  }
}

export const NotificationsDao = new InMemoryNotificationsDao();