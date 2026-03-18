import type { CreateMediaRequest, Media, MediaListResponse } from "@strava-musician-app/shared";

export interface MediaDAO {
  createMedia(practiceLogId: string, data: CreateMediaRequest): Promise<Media>;
  listMedia(practiceLogId: string): Promise<MediaListResponse>;
  getMedia(mediaId: string): Promise<Media | null>;
  deleteMedia(mediaId: string): Promise<void>;
}
