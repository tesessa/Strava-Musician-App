import type { KodaServerApi } from "../network/KodaServerApi";
import type { Visibility, PracticeLog } from "@strava-musician-app/shared";

export class PracticeLogService {
    constructor(private readonly server: KodaServerApi) {}

    async savePracticeLog(userId: string, title: string, visibility: Visibility, duration: number, postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string): Promise<string> {
        return this.server.savePracticeLog(userId, title, visibility, duration, postText, privateText, instrument, tempo, pieceTitle, composer);
    }

    async discardPracticeLog(practiceLogId: string): Promise<void> {
        return this.server.discardPracticeLog(practiceLogId);
    }

    // Home-feed methods
    async getFeed(): Promise<PracticeLog[]> {
        return this.server.getFeed();
    }

    async likePracticeLog(practiceLogId: string): Promise<void> {
        return this.server.likePracticeLog(practiceLogId);
    }

    async unlikePracticeLog(practiceLogId: string): Promise<void> {
        return this.server.unlikePracticeLog(practiceLogId);
    }

    async commentOnPracticeLog(practiceLogId: string, text: string): Promise<void> {
        return this.server.commentOnPracticeLog(practiceLogId, text);
    }

    async sharePracticeLog(practiceLogId: string): Promise<void> {
        return this.server.sharePracticeLog(practiceLogId);
    }
}
