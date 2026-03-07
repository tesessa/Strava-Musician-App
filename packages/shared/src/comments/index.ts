/**
 * Comment on a practice session
 */
export interface Comment {
  commentId: string;
  sessionId: string;
  userId: string;
  text: string;
  createdAt: string;
}

/**
 * POST /sessions/:sessionId/comments body
 */
export interface CreateCommentRequest {
  text: string;
}

/**
 * GET /sessions/:sessionId/comments response
 */
export type CommentsListResponse = Comment[];
