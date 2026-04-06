import { CommentsListResponse } from "@strava-musician-app/shared";
import type { KodaServerApi } from "../network";

export class CommentsService {
    constructor(private readonly server: KodaServerApi) {}

    /** POST /practice-logs/:practiceLogId/comments */
    async commentOnPracticeLog(
        practiceLogId: string,
        text: string,
    ): Promise<void> {
        await this.server.createPracticeLogComment(practiceLogId, {text});
    }

    /** GET /practice-logs/:practiceLogId/comments */
    async getPracticeLogComments(practiceLogId: string): Promise<CommentsListResponse> {
        return this.server.getPracticeLogComments(practiceLogId);
    }

    /** DELETE /comments/:commentId */
    async deleteComment(commentId: string): Promise<void> {
        return this.server.deleteComment(commentId);
    }
}