import type { AuthDAO } from "../daos/authDao";
import { SupabaseAuthDao } from "../daos/supabase/SupabaseAuthDao";

export function createAuthDAO(): AuthDAO {
  return new SupabaseAuthDao();
}
