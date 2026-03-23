import type { MediaType } from "../enums";

/**
 * Media attached to a practice log
 */
export interface Media {
  mediaId: string;
  practiceLogId: string;
  type: MediaType;
  url: string;
  createdAt: string;
}

/**
 * POST /practice-logs/:practiceLogId/media body
 */
export interface CreateMediaRequest {
  type: MediaType;
  url: string;
}

/**
 * GET /practice-logs/:practiceLogId/media response
 */
export type MediaListResponse = Media[];
