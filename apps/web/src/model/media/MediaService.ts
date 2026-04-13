import type { KodaMediaApi } from "./KodaMediaApi";

/** Default PAR bases (bucket scope); override per env in production. Each must end with `/o/`. */
const DEFAULT_PAR_AUDIO_BASE =
  "https://objectstorage.us-phoenix-1.oraclecloud.com/p/tLgViBcQ0HTfy4EeNMsaSsJNTGuh9c8ReQyciVvhPhTb7cIrqwpScvn1ZvJVp9iG/n/axlshhpuhun7/b/koda-practice-session-audio/o/";
const DEFAULT_PAR_VIDEO_BASE =
  "https://objectstorage.us-phoenix-1.oraclecloud.com/p/V4dx7GnkuoMEPXXCnJuz4pjZXMSV2qfre_0Hl_uls8HgotEL25ZMGVRqeIAFhh8l/n/axlshhpuhun7/b/koda-practice-session-video/o/";
const DEFAULT_PAR_PROFILE_IMAGES_BASE =
  "https://objectstorage.us-phoenix-1.oraclecloud.com/p/QThiKGHQjwmsb-eHC7KISJTKIZfkQRoIq1l_XLebUACLeFE6ZUyHGaieeb6vY9S7/n/axlshhpuhun7/b/koda-profile-images/o/";

type OracleParMediaConfig = {
  practiceLogAudioParBaseUrl: string;
  practiceLogVideoParBaseUrl: string;
  profileImagesParBaseUrl: string;
};

/**
 * Uploads and resolves URLs via Oracle Object Storage pre-authenticated requests (PAR).
 * Reads and writes use the same object URL returned after PUT.
 */
export class MediaService implements KodaMediaApi {
  private readonly config: OracleParMediaConfig = {
    practiceLogAudioParBaseUrl:
      import.meta.env.VITE_ORACLE_PAR_AUDIO_BASE_URL ?? DEFAULT_PAR_AUDIO_BASE,
    practiceLogVideoParBaseUrl:
      import.meta.env.VITE_ORACLE_PAR_VIDEO_BASE_URL ?? DEFAULT_PAR_VIDEO_BASE,
    profileImagesParBaseUrl:
      import.meta.env.VITE_ORACLE_PAR_PROFILE_IMAGES_BASE_URL ?? DEFAULT_PAR_PROFILE_IMAGES_BASE,
  };

  async uploadProfileImage(userId: string, file: File): Promise<string> {
    const objectKey = this.buildProfileImageKey(userId, file.name);
    return this.uploadFile(this.config.profileImagesParBaseUrl, objectKey, file);
  }

  getProfileImageUrl(_userId: string, keyOrFilename: string): string {
    return this.buildParObjectUrl(this.config.profileImagesParBaseUrl, keyOrFilename);
  }

  async uploadPracticeLogAudio(practiceLogId: string, file: File): Promise<string> {
    const objectKey = this.buildPracticeLogMediaKey(practiceLogId, file.name, "audio");
    return this.uploadFile(this.config.practiceLogAudioParBaseUrl, objectKey, file);
  }

  async uploadPracticeLogVideo(practiceLogId: string, file: File): Promise<string> {
    const objectKey = this.buildPracticeLogMediaKey(practiceLogId, file.name, "video");
    return this.uploadFile(this.config.practiceLogVideoParBaseUrl, objectKey, file);
  }

  private async uploadFile(parBaseUrl: string, objectKey: string, file: File): Promise<string> {
    const uploadUrl = this.buildParObjectUrl(parBaseUrl, objectKey);
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

  private buildParObjectUrl(parBaseUrl: string, objectKey: string): string {
    const base = parBaseUrl.endsWith("/") ? parBaseUrl : `${parBaseUrl}/`;
    const encodedObjectKey = objectKey
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${base}${encodedObjectKey}`;
  }
}
