import type { KodaMediaApi } from "../media/KodaMediaApi";
import type { KodaServerApi } from "../network/KodaServerApi";
import type { CreateMediaRequest } from "@strava-musician-app/shared";

// claude generated this in regards to KodaMediaApi
type MediaEntry = {
  id: string;
  blob: Blob;
  url: string;
  kind: "audio" | "video";
};

/**
 * Service for uploading and managing media files.
 * Uses dependency injection - the actual storage (fake vs real Oracle)
 * is determined by which KodaMediaApi implementation is passed in.
 */
export class MediaUploadService {
  constructor(
    private readonly mediaApi: KodaMediaApi,
    private readonly server: KodaServerApi
  ) {}

  /**
   * Upload media entries (from practice session) and link them to a practice log.
   * 
   * @param practiceLogId - The practice log to attach media to
   * @param mediaEntries - Array of media blobs from the practice session
   * @returns Promise that resolves when all uploads complete
   */
  async uploadMediaForPracticeLog(
    practiceLogId: string,
    mediaEntries: MediaEntry[]
  ): Promise<void> {
    if (mediaEntries.length === 0) {
      return;
    }

    console.log(`[MediaUploadService] Uploading ${mediaEntries.length} media files for practice log ${practiceLogId}`);

    for (const entry of mediaEntries) {
      try {
        await this.uploadSingleMedia(practiceLogId, entry);
      } catch (error) {
        console.error(`[MediaUploadService] Failed to upload ${entry.kind}:`, error);
        // Continue with other media even if one fails
      }
    }
  }

  /**
   * Upload a single media file and create its database record.
   */
  private async uploadSingleMedia(
    practiceLogId: string,
    entry: MediaEntry
  ): Promise<void> {
    // Convert blob to File with proper name
    const file = new File(
      [entry.blob],
      `${entry.kind}-${Date.now()}.${this.getFileExtension(entry.kind, entry.blob.type)}`,
      { type: entry.blob.type }
    );

    console.log(`[MediaUploadService] Uploading ${entry.kind} file:`, file.name);

    // Upload to storage (fake or real based on DI)
    let mediaUrl: string;
    if (entry.kind === "audio") {
      mediaUrl = await this.mediaApi.uploadPracticeLogAudio(practiceLogId, file);
    } else {
      mediaUrl = await this.mediaApi.uploadPracticeLogVideo(practiceLogId, file);
    }

    console.log(`[MediaUploadService] Upload successful: ${mediaUrl}`);

    // Create media record in database
    const mediaRequest: CreateMediaRequest = {
      type: entry.kind,
      url: mediaUrl,
    };
    await this.server.createPracticeLogMedia(practiceLogId, mediaRequest);

    console.log(`[MediaUploadService] Media record created for ${entry.kind}`);
  }

  /**
   * Get appropriate file extension based on media type and mime type.
   */
  private getFileExtension(kind: "audio" | "video", mimeType: string): string {
    // Try to get extension from mime type
    if (mimeType.includes("webm")) return "webm";
    if (mimeType.includes("mp4")) return "mp4";
    if (mimeType.includes("ogg")) return "ogg";
    if (mimeType.includes("wav")) return "wav";
    
    // Default extensions
    return kind === "audio" ? "webm" : "mp4";
  }

  /**
   * Upload a profile image for a user.
   * 
   * @param userId - The user ID
   * @param file - The image file to upload
   * @returns Promise with the uploaded image URL
   */
  async uploadProfileImage(userId: string, file: File): Promise<string> {
    console.log(`[MediaUploadService] Uploading profile image for user ${userId}`);
    const url = await this.mediaApi.uploadProfileImage(userId, file);
    console.log(`[MediaUploadService] Profile image uploaded: ${url}`);
    return url;
  }

  /**
   * Get the URL for a user's profile image.
   * 
   * @param userId - The user ID
   * @param keyOrFilename - The storage key or filename
   * @returns The profile image URL
   */
  getProfileImageUrl(userId: string, keyOrFilename: string): string {
    return this.mediaApi.getProfileImageUrl(userId, keyOrFilename);
  }
}