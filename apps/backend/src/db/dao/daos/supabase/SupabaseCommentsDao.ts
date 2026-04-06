import { Comment } from "@strava-musician-app/shared";
import { CommentsDAO } from "../commentsDao";

export class SupabaseCommentsDao implements CommentsDAO {
  addComment(comment: Comment): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getCommentsForPracticeLog(practiceLogId: string): Promise<Comment[]> {
    throw new Error("Method not implemented.");
  }
  getCommentById(commentId: string): Promise<Comment | undefined> {
    throw new Error("Method not implemented.");
  }
  removeComment(commentId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
