import {
  CreateMediaRequest,
  Media,
  MediaListResponse,
} from "@strava-musician-app/shared";
import { MediaDAO } from "../mediaDao";
import db from "./config/SupabaseKnexConnection";

export class SupabaseMediaDao implements MediaDAO {
  async createMedia(
    practiceLogId: string,
    data: CreateMediaRequest,
  ): Promise<Media> {
    const mediaId = crypto.randomUUID();
    const dateNow = new Date();
    const newMedia: Media = {
      mediaId: mediaId,
      practiceLogId,
      type: data.type,
      url: data.url,
      createdAt: dateNow.toISOString(),
    };
    await db("Media").insert({
      mediaId: mediaId,
      practiceLogId,
      type: data.type,
      url: data.url,
      createdAt: dateNow,
    });
    return newMedia;
  }

  async listMedia(practiceLogId: string): Promise<MediaListResponse> {
    const mediaItems = await db("Media").where({ practiceLogId });
    const mediaList: Media[] = mediaItems.map((m) => ({
      mediaId: m.mediaId,
      practiceLogId: m.practiceLogId,
      type: m.type,
      url: m.url,
      createdAt:
        m.createdAt instanceof Date
          ? m.createdAt.toISOString()
          : new Date(m.createdAt).toISOString(),
    }));
    return mediaList;
  }

  async getMedia(mediaId: string): Promise<Media | null> {
    const mediaItem = await db("Media").where({ mediaId }).first();
    if (!mediaItem) {
      return null;
    }
    return {
      mediaId: mediaItem.mediaId,
      practiceLogId: mediaItem.practiceLogId,
      type: mediaItem.type,
      url: mediaItem.url,
      createdAt:
        mediaItem.createdAt instanceof Date
          ? mediaItem.createdAt.toISOString()
          : new Date(mediaItem.createdAt).toISOString(),
    };
  }

  async deleteMedia(mediaId: string): Promise<void> {
    await db("Media").where({ mediaId }).del();
  }
}
