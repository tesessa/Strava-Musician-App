import { InMemoryNotificationsDao } from "../inMemoryDaos/notificationsInMemoryDao";
import type { NotificationsDao } from "../daos/notificationsDao";

let dao: NotificationsDao | null = null;

export function createNotificationsDao(): NotificationsDao {
  if (!dao) {
    dao = new InMemoryNotificationsDao();
  }
  return dao;
}
