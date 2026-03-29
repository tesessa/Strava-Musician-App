import type { Comment } from "@strava-musician-app/shared";

export interface CommentsDAO {
  addComment(comment: Comment): Promise<void>;
  getCommentsForPracticeLog(practiceLogId: string): Promise<Comment[]>;
  getCommentById(commentId: string): Promise<Comment | undefined>;
  removeComment(commentId: string): Promise<void>;
}
