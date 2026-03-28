/**
 * Like on a practice log
 */
export interface Like {
  userId: string;
  practiceLogId: string;
  createdAt: string;
}

/**
 * GET /practice-logs/:practiceLogId/likes response
 */
export type LikesListResponse = Like[];
