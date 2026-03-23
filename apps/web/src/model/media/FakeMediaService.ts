import type { KodaMediaApi } from "./KodaMediaApi";

/**
 * Demo-mode media API implementation with in-memory URL tracking and no network I/O.
 */
export class FakeMediaService implements KodaMediaApi {
  private profileImagesByUserId = new Map<string, string>();
  private practiceLogAudioByPracticeLogId = new Map<string, string[]>();
  private practiceLogVideoByPracticeLogId = new Map<string, string[]>();

  async uploadProfileImage(userId: string, file: File): Promise<string> {
    const url = this.buildFakeUrl("koda-profile-images", userId, file.name);
    this.profileImagesByUserId.set(userId, url);
    console.log("[FakeMediaService] uploadProfileImage:", { userId, url });
    return url;
  }

  getProfileImageUrl(userId: string, keyOrFilename: string): string {
    const existingUrl = this.profileImagesByUserId.get(userId);
    if (existingUrl) {
      return existingUrl;
    }

    return this.buildFakeUrl("koda-profile-images", userId, keyOrFilename);
  }

  async uploadPracticeLogAudio(practiceLogId: string, file: File): Promise<string> {
    return this.uploadPracticeLogMedia(
      practiceLogId,
      file,
      "koda-practice-session-audio",
      this.practiceLogAudioByPracticeLogId,
      "uploadPracticeLogAudio",
    );
  }

  async uploadPracticeLogVideo(practiceLogId: string, file: File): Promise<string> {
    return this.uploadPracticeLogMedia(
      practiceLogId,
      file,
      "koda-practice-session-video",
      this.practiceLogVideoByPracticeLogId,
      "uploadPracticeLogVideo",
    );
  }

  private async uploadPracticeLogMedia(
    practiceLogId: string,
    file: File,
    bucketName: string,
    targetMap: Map<string, string[]>,
    operation: "uploadPracticeLogAudio" | "uploadPracticeLogVideo",
  ): Promise<string> {
    const url = this.buildFakeUrl(
      bucketName,
      practiceLogId,
      file.name,
    );
    const current = targetMap.get(practiceLogId) ?? [];
    current.push(url);
    targetMap.set(practiceLogId, current);
    console.log(`[FakeMediaService] ${operation}:`, { practiceLogId, url });
    return url;
  }

  private buildFakeUrl(bucket: string, parentId: string, filename: string): string {
    const safeParentId = this.safePathSegment(parentId);
    const safeFilename = this.safePathSegment(filename);
    return `https://fake-media.koda/${bucket}/${safeParentId}/${Date.now()}-${safeFilename}`;
  }

  private safePathSegment(value: string): string {
    return value.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._/-]/g, "");
  }
}
