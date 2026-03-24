import { NextResponse } from "next/server";
import { NotificationsService } from "../services/notificationsService";
import { authenticateToken } from "../utils/authenticateToken";

const notificationsService = new NotificationsService();

export async function listNotifications(req: Request) {
  const {user, token, error} = await authenticateToken(req);
  if (error) return error;
  const notifications = await notificationsService.listNotifications(user.userId);
  return NextResponse.json({ notifications });
}

export async function markNotificationRead(req: Request, notificationId: string) {
  const {user, token, error} = await authenticateToken(req);
  if (error) return error;
  const updated = await notificationsService.markNotificationRead(user.userId, notificationId);
  if (!updated) return NextResponse.json({ error: "not_found or not authorized" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function deleteNotification(req: Request, notificationId: string) {
  const {user, token, error} = await authenticateToken(req);
  if (error) return error;
  const deleted = await notificationsService.deleteNotification(user.userId, notificationId);
  if (!deleted) return NextResponse.json({ error: "not_found or not authorized" }, { status: 404 });
  return NextResponse.json({ success: true });
}
