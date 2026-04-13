import type { Like } from "@strava-musician-app/shared";
import type { LikesDAO } from "../daos/likesDao";

class InMemoryLikesDao implements LikesDAO {
  private likes: Like[] = [];

  async addLike(like: Like): Promise<void> {
    const exists = this.likes.some(l => l.userId === like.userId && l.practiceLogId === like.practiceLogId);
    if (exists) {
      throw new Error("Like already exists");
    }
    this.likes.push(like);
  }

  async removeLike(userId: string, practiceLogId: string): Promise<void> {
    const index = this.likes.findIndex(l => l.userId === userId && l.practiceLogId === practiceLogId);
    if (index === -1) {
      throw new Error("Like does not exist");
    }
    this.likes.splice(index, 1);
  }

  async hasUserLikedPracticeLog(userId: string, practiceLogId: string): Promise<boolean> {
    return this.likes.some(l => l.userId === userId && l.practiceLogId === practiceLogId);
  }

  async getLikesForPracticeLog(practiceLogId: string) {
    return this.likes.filter(l => l.practiceLogId === practiceLogId);
  }
}

export const LikesDao = new InMemoryLikesDao();
