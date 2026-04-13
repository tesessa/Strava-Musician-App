import type { PublicUserProfile } from "../users";

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
 * Comment with author profile (list and create responses)
 */
export interface CommentWithAuthor extends Comment {
  author: PublicUserProfile;
}

/**
 * GET /practice-logs/:practiceLogId/comments response
 */
export type CommentsListResponse = CommentWithAuthor[];
