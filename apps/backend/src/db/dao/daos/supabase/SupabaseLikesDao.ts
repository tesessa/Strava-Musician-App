import { Like } from "@strava-musician-app/shared";
import { LikesDAO } from "../likesDao";

export class SupabaseLikesDao implements LikesDAO {
  addLike(like: Like): Promise<void> {
    throw new Error("Method not implemented.");
  }

  removeLike(userId: string, practiceLogId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  hasUserLikedPracticeLog(
    userId: string,
    practiceLogId: string,
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  getLikesForPracticeLog(practiceLogId: string): Promise<Like[]> {
    throw new Error("Method not implemented.");
  }
}
