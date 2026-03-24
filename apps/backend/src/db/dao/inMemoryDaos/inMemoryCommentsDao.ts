import type { Comment } from "@strava-musician-app/shared";
import type { CommentsDAO } from "../daos/commentsDao";

class InMemoryCommentsDao implements CommentsDAO {
  private comments: Comment[] = [];

  async addComment(comment: Comment): Promise<void> {
    this.comments.push(comment);
  }

  async getCommentsForPracticeLog(practiceLogId: string): Promise<Comment[]> {
    return this.comments.filter(c => c.practiceLogId === practiceLogId);
  }

  async getCommentById(commentId: string): Promise<Comment | undefined> {
    return this.comments.find(c => c.commentId === commentId);
  }

  async removeComment(commentId: string): Promise<void> {
    const idx = this.comments.findIndex(c => c.commentId === commentId);
    if (idx !== -1) this.comments.splice(idx, 1);
  }
}

export const CommentsDao = new InMemoryCommentsDao();
