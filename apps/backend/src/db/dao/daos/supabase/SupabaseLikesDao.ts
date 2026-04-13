import { Like } from "@strava-musician-app/shared";
import { LikesDAO } from "../likesDao";
import db from "./config/SupabaseKnexConnection";

export class SupabaseLikesDao implements LikesDAO {
  async addLike(like: Like): Promise<void> {
    await db("Likes").insert({
      userId: like.userId,
      practiceLogId: like.practiceLogId,
      createdAt: new Date(like.createdAt),
    });
  }

  async removeLike(userId: string, practiceLogId: string): Promise<void> {
    await db("Likes").where({ userId, practiceLogId }).del();
  }

  async hasUserLikedPracticeLog(
    userId: string,
    practiceLogId: string,
  ): Promise<boolean> {
    const like = await db("Likes").where({ userId, practiceLogId }).first();
    return !!like;
  }

  async getLikesForPracticeLog(practiceLogId: string): Promise<Like[]> {
    const likes = await db("Likes")
      .select("*")
      .where({ practiceLogId })
      .orderBy("createdAt", "asc");
    return likes.map((l) => ({
      userId: l.userId,
      practiceLogId: l.practiceLogId,
      createdAt:
        l.createdAt instanceof Date
          ? l.createdAt.toISOString()
          : new Date(l.createdAt).toISOString(),
    }));
  }

  async clearAll(): Promise<void> {
    await db("Likes").del();
  }
}
