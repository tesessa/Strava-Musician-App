import { Media, MediaListResponse, MediaType } from "@strava-musician-app/shared";
import { KodaServerApi } from "../network";

// this is for the actual database
export class MediaServiceDB {
    constructor(private readonly server: KodaServerApi) {}

    /** POST /practice-logs/:practiceLogId/media */
    async savePracticeLogMedia(
        practiceLogId: string,
        type: MediaType,
        url: string
    ): Promise<Media> {
        return this.server.createPracticeLogMedia(practiceLogId, { type, url });
    }

    /** GET /practice-logs/:practiceLogId/media */
    async getPracticeLogMedia(practiceLogId: string): Promise<MediaListResponse> {
        return this.server.getPracticeLogMedia(practiceLogId);
    }

    /** DELETE /media/:mediaId */
    async deleteMedia(mediaId: string): Promise<void> {
        return this.server.deleteMedia(mediaId);
    }
}