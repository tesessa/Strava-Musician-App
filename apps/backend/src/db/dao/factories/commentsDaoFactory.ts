import { SupabaseCommentsDao } from "../daos/supabase/SupabaseCommentsDao";
import type { CommentsDAO } from "../daos/commentsDao";

export function createCommentsDAO(): CommentsDAO {
  return new SupabaseCommentsDao();
}
