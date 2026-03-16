/**
 * Practice log. Visibility is determined by the log owner's User.postVisibility only.
 */
export interface PracticeLog {
  userId: string;
  practiceLogId: string;
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
 * POST /practice-logs body.
 */
export interface CreatePracticeLogRequest {
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
 * PATCH /practice-logs/:practiceLogId
 */
export type UpdatePracticeLogRequest = Partial<CreatePracticeLogRequest>;

/**
 * GET /practice-logs/feed body (keyset pagination)
 */
export interface FeedRequest {
  lastItem?: string; // practiceLogId of the last item in the previous page
  pageSize?: number;
}

/**
 * GET /practice-logs/feed response
 */
export type FeedResponse = PracticeLog[];
