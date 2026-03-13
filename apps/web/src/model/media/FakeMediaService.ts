import type { KodaMediaApi } from "./KodaMediaApi";

/**
 * Demo-mode media API implementation with in-memory URL tracking and no network I/O.
 */
export class FakeMediaService implements KodaMediaApi {
  private profileImagesByUserId = new Map<string, string>();
  private sessionAudioBySessionId = new Map<string, string[]>();
  private sessionVideoBySessionId = new Map<string, string[]>();

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

  async uploadSessionAudio(sessionId: string, file: File): Promise<string> {
    return this.uploadSessionMedia(
      sessionId,
      file,
      "koda-practice-session-audio",
      this.sessionAudioBySessionId,
      "uploadSessionAudio",
    );
  }

  async uploadSessionVideo(sessionId: string, file: File): Promise<string> {
    return this.uploadSessionMedia(
      sessionId,
      file,
      "koda-practice-session-video",
      this.sessionVideoBySessionId,
      "uploadSessionVideo",
    );
  }

  private async uploadSessionMedia(
    sessionId: string,
    file: File,
    bucketName: string,
    targetMap: Map<string, string[]>,
    operation: "uploadSessionAudio" | "uploadSessionVideo",
  ): Promise<string> {
    const url = this.buildFakeUrl(
      bucketName,
      sessionId,
      file.name,
    );
    const current = targetMap.get(sessionId) ?? [];
    current.push(url);
    targetMap.set(sessionId, current);
    console.log(`[FakeMediaService] ${operation}:`, { sessionId, url });
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
