import type { MediaType } from "../enums";

/**
 * Media attached to a practice session
 */
export interface Media {
  mediaId: string;
  sessionId: string;
  type: MediaType;
  url: string;
  createdAt: string;
}

/**
 * POST /sessions/:sessionId/media body
 */
export interface CreateMediaRequest {
  type: MediaType;
  url: string;
}

/**
 * GET /sessions/:sessionId/media response
 */
export type MediaListResponse = Media[];
