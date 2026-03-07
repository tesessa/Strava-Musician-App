import type { UserSearchResult } from "../users";
import type { PracticeSession } from "../sessions";
import type { Event } from "../events";

/**
 * GET /search?q=... — unified search across users, sessions, events
 */
export interface UnifiedSearchResponse {
  users?: UserSearchResult[];
  sessions?: PracticeSession[];
  events?: Event[];
}

/**
 * GET /stats/user/:userId — aggregated practice stats for profile
 */
export interface UserStatsResponse {
  numberOfSessions?: number;
  totalHoursPracticed?: number;
}
