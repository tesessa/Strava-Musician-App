import type { KodaMediaApi } from "./KodaMediaApi";

type OracleMediaConfig = {
  namespace: string;
  region: string;
  profileImagesBucket: string;
  practiceLogAudioBucket: string;
  practiceLogVideoBucket: string;
};

/**
 * Real media service that uploads directly to Oracle Object Storage public buckets.
 * Note: direct browser uploads are acceptable for local/dev scaffolding but production
 * should move to pre-signed URLs or backend-mediated upload authorization.
 */
export class MediaService implements KodaMediaApi {
  private readonly config: OracleMediaConfig = {
    namespace: import.meta.env.VITE_ORACLE_NAMESPACE ?? "axlshhpuhun7",
    region: import.meta.env.VITE_ORACLE_REGION ?? "us-phoenix-1",
    profileImagesBucket:
      import.meta.env.VITE_BUCKET_PROFILE_IMAGES ?? "koda-profile-images",
    practiceLogAudioBucket:
      import.meta.env.VITE_BUCKET_PRACTICE_LOG_AUDIO ?? "koda-practice-session-audio",
    practiceLogVideoBucket:
      import.meta.env.VITE_BUCKET_PRACTICE_LOG_VIDEO ?? "koda-practice-session-video",
  };

  async uploadProfileImage(userId: string, file: File): Promise<string> {
    const objectKey = this.buildProfileImageKey(userId, file.name);
    return this.uploadFile(this.config.profileImagesBucket, objectKey, file);
  }

  getProfileImageUrl(_userId: string, keyOrFilename: string): string {
    return this.buildObjectUrl(this.config.profileImagesBucket, keyOrFilename);
  }

  async uploadPracticeLogAudio(practiceLogId: string, file: File): Promise<string> {
    return this.uploadPracticeLogMedia(
      practiceLogId,
      file,
      this.config.practiceLogAudioBucket,
      "audio",
    );
  }

  async uploadPracticeLogVideo(practiceLogId: string, file: File): Promise<string> {
    return this.uploadPracticeLogMedia(
      practiceLogId,
      file,
      this.config.practiceLogVideoBucket,
      "video",
    );
  }

  private async uploadPracticeLogMedia(
    practiceLogId: string,
    file: File,
    bucketName: string,
    mediaKind: "audio" | "video",
  ): Promise<string> {
    const objectKey = this.buildPracticeLogMediaKey(practiceLogId, file.name, mediaKind);
    return this.uploadFile(bucketName, objectKey, file);
  }

  private async uploadFile(bucketName: string, objectKey: string, file: File): Promise<string> {
    const uploadUrl = this.buildObjectUrl(bucketName, objectKey);
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(
        `[MediaService] Upload failed (${response.status}) for ${uploadUrl}`,
      );
    }

    return uploadUrl;
  }

  private buildProfileImageKey(userId: string, filename: string): string {
    return `profile-images/${this.safePathSegment(userId)}/${this.timestampedFileName(filename)}`;
  }

  private buildPracticeLogMediaKey(
    practiceLogId: string,
    filename: string,
    mediaKind: "audio" | "video",
  ): string {
    return `practice-logs/${this.safePathSegment(practiceLogId)}/${mediaKind}/${this.timestampedFileName(filename)}`;
  }

  private timestampedFileName(filename: string): string {
    return `${Date.now()}-${this.safePathSegment(filename)}`;
  }

  private safePathSegment(value: string): string {
    return value.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._/-]/g, "");
  }

  private buildObjectUrl(bucketName: string, objectKey: string): string {
    const encodedObjectKey = objectKey
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    return `https://objectstorage.${this.config.region}.oraclecloud.com/n/${this.config.namespace}/b/${bucketName}/o/${encodedObjectKey}`;
  }
}
