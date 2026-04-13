import { SupabaseLikesDao } from "../daos/supabase/SupabaseLikesDao";
import type { LikesDAO } from "../daos/likesDao";

export function createLikesDAO(): LikesDAO {
  return new SupabaseLikesDao();
}
