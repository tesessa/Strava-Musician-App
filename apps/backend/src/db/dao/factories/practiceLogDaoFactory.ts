import type { PracticeLogDAO } from "../daos/practiceLogDao";
import { SupabasePracticeLogDAO } from "../daos/supabase/SupabasePracticeLogDao";

export function createPracticeLogDAO(): PracticeLogDAO {
  return new SupabasePracticeLogDAO();
}
