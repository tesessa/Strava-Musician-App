import type { NotificationsDAO } from "../daos/notificationsDao";
import { SupabaseNotificationsDao } from "../daos/supabase/SupabaseNotificationsDao";

export function createNotificationsDao(): NotificationsDAO {
  return new SupabaseNotificationsDao();
}
