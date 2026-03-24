import { Notification } from "@strava-musician-app/shared";
import { createNotificationsDao } from "../../db/dao/factories/notificationsDaoFactory";

export async function listNotifications(userId: string): Promise<Notification[]> {
  const dao = createNotificationsDao();
  return dao.listNotifications(userId);
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<boolean> {
  const dao = createNotificationsDao();
  const notification = await getNotificationById(notificationId);
  if (!notification || notification?.userId !== userId) return false; // Only allow marking own notifications that exist
  return dao.markNotificationRead(notificationId);
}

export async function deleteNotification(userId: string, notificationId: string): Promise<boolean> {
  const dao = createNotificationsDao();
  const notification = await getNotificationById(notificationId);
  if (!notification || notification?.userId !== userId) return false; // Only allow deleting own notifications that exist
  return dao.deleteNotification(notificationId);
}

export async function createNotification(notification: Omit<Notification, "notificationId">): Promise<Notification> {
  const dao = createNotificationsDao();
  return dao.createNotification(notification);
}

export async function getNotificationById(notificationId: string): Promise<Notification | null> {
  const dao = createNotificationsDao();
  return dao.getNotificationById(notificationId);

}