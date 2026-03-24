import type { Media, CreateMediaRequest, MediaListResponse } from "@strava-musician-app/shared";
import type { MediaDAO } from "../daos/mediaDao";

const mediaById = new Map<string, Media>();
const mediaByPracticeLog = new Map<string, Media[]>();

class InMemoryMediaDAO implements MediaDAO {
  async createMedia(practiceLogId: string, data: CreateMediaRequest): Promise<Media> {
    const mediaId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const media: Media = {
      mediaId,
      practiceLogId,
      type: data.type,
      url: data.url,
      createdAt,
    };
    mediaById.set(mediaId, media);
    if (!mediaByPracticeLog.has(practiceLogId)) {
      mediaByPracticeLog.set(practiceLogId, []);
    }
    mediaByPracticeLog.get(practiceLogId)!.push(media);
    return media;
  }

  async listMedia(practiceLogId: string): Promise<MediaListResponse> {
    return mediaByPracticeLog.get(practiceLogId) || [];
  }

  async getMedia(mediaId: string): Promise<Media | null> {
    return mediaById.get(mediaId) || null;
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const media = mediaById.get(mediaId);
    if (!media) return;
    mediaById.delete(mediaId);
    const arr = mediaByPracticeLog.get(media.practiceLogId);
    if (arr) {
      const idx = arr.findIndex(m => m.mediaId === mediaId);
      if (idx !== -1) arr.splice(idx, 1);
    }
  }
};

export const MediaDao = new InMemoryMediaDAO();