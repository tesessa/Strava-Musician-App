import type { NotificationsDAO } from '../daos/notificationsDao';
import { NotificationsDao } from '../inMemoryDaos/inMemoryNotificationsDao';

export function createNotificationsDao(): NotificationsDAO {
  return NotificationsDao;
}
