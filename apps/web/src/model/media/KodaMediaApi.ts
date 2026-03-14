/**
 * Frontend media API abstraction for Oracle Object Storage interactions.
 * Implemented by MediaService (real object storage) and FakeMediaService (demo mode).
 */
export interface KodaMediaApi {
  uploadProfileImage(userId: string, file: File): Promise<string>;
  getProfileImageUrl(userId: string, keyOrFilename: string): string;
  uploadPracticeLogAudio(practiceLogId: string, file: File): Promise<string>;
  uploadPracticeLogVideo(practiceLogId: string, file: File): Promise<string>;
}
