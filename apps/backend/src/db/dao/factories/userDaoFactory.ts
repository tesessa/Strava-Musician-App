import type { UserDAO } from "../daos/userDao";
import { SupabaseUserDao } from "../daos/supabase/SupabaseUserDao";

export function createUserDAO(): UserDAO {
  return new SupabaseUserDao();
}
