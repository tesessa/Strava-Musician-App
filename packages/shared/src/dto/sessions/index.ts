/**
 * Practice session. Visibility is determined by the session owner's User.postVisibility only.
 */
export interface PracticeSession {
  userId: string;
  sessionId: string;
  title: string;
  postText?: string;
  privateText?: string;
  instrument?: string;
  createdAt: string;
  durationMinutes: number;
  tempo?: number;
  pieceTitle?: string;
  composer?: string;
}

/**
 * POST /sessions body. Visibility is not sent; backend uses authenticated user's postVisibility.
 */
export interface CreateSessionRequest {
  title: string;
  postText?: string;
  privateText?: string;
  instrument?: string;
  durationMinutes: number;
  tempo?: number;
  pieceTitle?: string;
  composer?: string;
}

/**
 * PATCH /sessions/:sessionId. No visibility field.
 */
export type UpdateSessionRequest = Partial<CreateSessionRequest>;

/**
 * GET /sessions/feed body (keyset pagination)
 */
export interface FeedRequest {
  lastItem?: string;
  pageSize?: number;
}

/**
 * GET /sessions/feed response
 */
export type FeedResponse = PracticeSession[];
