import type {
  NotificationType,
  NotificationEntityType,
} from "../enums";

/**
 * Notification for a user
 */
export interface Notification {
  notificationId: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * GET /notifications response
 */
export type NotificationsListResponse = Notification[];
