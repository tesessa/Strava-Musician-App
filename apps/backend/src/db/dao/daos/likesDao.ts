import type { Like } from "@strava-musician-app/shared";

export interface LikesDAO {
  addLike(like: Like): Promise<void>;
  removeLike(userId: string, practiceLogId: string): Promise<void>;
  hasUserLikedPracticeLog(userId: string, practiceLogId: string): Promise<boolean>;
  getLikesForPracticeLog(practiceLogId: string): Promise<Like[]>;
}
