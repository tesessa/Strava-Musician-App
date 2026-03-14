/**
 * Comment on a practice log
 */
export interface Comment {
  commentId: string;
  practiceLogId: string;
  userId: string;
  text: string;
  createdAt: string;
}

/**
 * POST /practice-logs/:practiceLogId/comments body
 */
export interface CreateCommentRequest {
  text: string;
}

/**
 * GET /practice-logs/:practiceLogId/comments response
 */
export type CommentsListResponse = Comment[];
