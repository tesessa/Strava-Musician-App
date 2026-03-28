import type { UserSearchResult } from "../users";
import type { PracticeLog } from "../practiceLogs";
import type { Event } from "../events";

/**
 * GET /search?q=... — unified search across users, practice logs, events
 */
export interface UnifiedSearchResponse {
  users?: UserSearchResult[];
  practiceLogs?: PracticeLog[];
  events?: Event[];
}

/**
 * GET /stats/user/:userId — aggregated practice stats for profile
 */
export interface UserStatsResponse {
  numberOfPracticeLogs?: number;
  totalHoursPracticed?: number;
}
