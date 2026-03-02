import type { KodaServerApi } from "../network/KodaServerApi";
import type { PostVisibility, FeedPost } from "@strava-musician-app/shared";

export class PostService {
    constructor(private readonly server: KodaServerApi) {}

    async savePost(userId: string, title: string, visibility: PostVisibility, duration: number, postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string): Promise<string> {
        return this.server.savePost(userId, title, visibility, duration, postText, privateText, instrument, tempo, pieceTitle, composer);
    }

    async discardPost(sessionId: string): Promise<void> {
        return this.server.discardPost(sessionId);
    }

    //Home-feed methods
    async getFeed(): Promise<FeedPost[]> {
        return this.server.getFeed();
    }

    async likePost(postId: string): Promise<void> {
        return this.server.likePost(postId);
    }

    async unlikePost(postId: string): Promise<void> {
        return this.server.unlikePost(postId);
    }

    async commentOnPost(postId: string, text: string): Promise<void> {
        return this.server.commentOnPost(postId, text);
    }

    async sharePost(postId: string): Promise<void> {
        return this.server.sharePost(postId);
    }


}