import {
  CreateMediaRequest,
  Media,
  MediaListResponse,
} from "@strava-musician-app/shared";
import { MediaDAO } from "../mediaDao";

export class SupabaseMediaDao implements MediaDAO {
  createMedia(practiceLogId: string, data: CreateMediaRequest): Promise<Media> {
    throw new Error("Method not implemented.");
  }
  listMedia(practiceLogId: string): Promise<MediaListResponse> {
    throw new Error("Method not implemented.");
  }
  getMedia(mediaId: string): Promise<Media | null> {
    throw new Error("Method not implemented.");
  }
  deleteMedia(mediaId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
