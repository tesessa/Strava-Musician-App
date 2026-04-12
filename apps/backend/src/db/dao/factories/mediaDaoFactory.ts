import { MediaDAO } from "../daos/mediaDao";
import { SupabaseMediaDao } from "../daos/supabase/SupabaseMediaDao";

export function createMediaDAO(): MediaDAO {
  return new SupabaseMediaDao();
}
