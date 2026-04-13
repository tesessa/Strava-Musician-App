import { Notification } from "@strava-musician-app/shared";
import { NotificationsDAO } from "../notificationsDao";
import db from "./config/SupabaseKnexConnection";

export class SupabaseNotificationsDao implements NotificationsDAO {
  async listNotifications(userId: string): Promise<Notification[]> {
    const notifications = await db("Notification")
      .select("*")
      .where({ userId })
      .orderBy("createdAt", "desc");
    return notifications.map((n) => ({
      notificationId: n.notificationId,
      userId: n.userId,
      actorId: n.actorId,
      type: n.type,
      entityType: n.entityType,
      entityId: n.entityId,
      isRead: n.isRead,
      createdAt:
        n.createdAt instanceof Date
          ? n.createdAt.toISOString()
          : new Date(n.createdAt).toISOString(),
    }));
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    const updatedRows = await db("Notification")
      .where({ notificationId })
      .update({ isRead: true });
    return updatedRows > 0;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    const deletedRows = await db("Notification")
      .where({ notificationId })
      .del();
    return deletedRows > 0;
  }

  async createNotification(
    notification: Omit<Notification, "notificationId">,
  ): Promise<Notification> {
    const notificationId = crypto.randomUUID();
    const newNotification: Notification = {
      notificationId,
      ...notification,
    };
    await db("Notification").insert({
      notificationId,
      userId: notification.userId,
      actorId: notification.actorId,
      type: notification.type,
      entityType: notification.entityType,
      entityId: notification.entityId,
      isRead: notification.isRead,
      createdAt: new Date(notification.createdAt),
    });
    return newNotification;
  }

  async getNotificationById(
    notificationId: string,
  ): Promise<Notification | null> {
    const notification = await db("Notification")
      .select("*")
      .where({ notificationId })
      .first();
    if (!notification) {
      return null;
    }
    return {
      notificationId: notification.notificationId,
      userId: notification.userId,
      actorId: notification.actorId,
      type: notification.type,
      entityType: notification.entityType,
      entityId: notification.entityId,
      isRead: notification.isRead,
      createdAt:
        notification.createdAt instanceof Date
          ? notification.createdAt.toISOString()
          : new Date(notification.createdAt).toISOString(),
    };
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await db("Notification").where("userId", userId).orWhere("actorId", userId).del();
  }

  async clearAll(): Promise<void> {
    await db("Notification").del();
  }
}
