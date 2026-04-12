import type { CreateMediaRequest, Media, MediaListResponse } from "@strava-musician-app/shared";
import type { MediaDAO } from "../../db/dao/daos/mediaDao";

export class MediaService {
  constructor(private dao: MediaDAO) {}

  async createMedia(practiceLogId: string, data: CreateMediaRequest): Promise<Media> {
    console.log(`Creating media for practice log ${practiceLogId} with data:`, data);
    return this.dao.createMedia(practiceLogId, data);
  }

  async listMedia(practiceLogId: string): Promise<MediaListResponse> {
    return this.dao.listMedia(practiceLogId);
  }

  async getMedia(mediaId: string): Promise<Media | null> {
    return this.dao.getMedia(mediaId);
  }

  async deleteMedia(mediaId: string): Promise<void> {
    return this.dao.deleteMedia(mediaId);
  }
}
