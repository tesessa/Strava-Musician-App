/**
 * Like on a practice session
 */
export interface Like {
  userId: string;
  sessionId: string;
  createdAt: string;
}

/**
 * GET /sessions/:sessionId/likes response
 */
export type LikesListResponse = Like[];
