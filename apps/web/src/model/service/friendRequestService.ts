import { 
    FriendRequest,
    IncomingFriendRequestsResponse,
    OutgoingFriendRequestsResponse,
    User
 } from "@strava-musician-app/shared";
import type { KodaServerApi } from "../network/KodaServerApi";

export interface PendingFriendRequestWithProfile {
  request: FriendRequest;
  user: User | null;
}

export class FriendRequestsService {
    constructor(private readonly server: KodaServerApi) {}

    async sendFriendRequest(receiverId: string): Promise<FriendRequest> {
        return this.server.createFriendRequest(receiverId);
    }

    async getIncomingFriendRequests(lastRequestId?: string, pageSize?: number): Promise<IncomingFriendRequestsResponse> {
        return this.server.getIncomingFriendRequests( {lastRequestId, pageSize});
    }

    async getOutgoingFriendRequests(lastRequestId?: string, pageSize?: number): Promise<OutgoingFriendRequestsResponse> {
        return this.server.getOutgoingFriendRequests({lastRequestId, pageSize});
    }

    async acceptFriendRequest(requestId: string): Promise<void> {
        return this.server.acceptFriendRequest(requestId);
    }

    // what is the difference between reject and cancel friend request?
    async rejectFriendRequest(requestId: string): Promise<void> {
        return this.server.rejectFriendRequest(requestId);
    }

    async cancelFriendRequest(requestId: string): Promise<void> {
        return this.server.cancelFriendRequest(requestId);
    }

    // switch these
    async getIncomingFriendRequestsWithProfiles(
        pageSize = 25,
    ): Promise<PendingFriendRequestWithProfile[]> {
        const requests = await this.server.getIncomingFriendRequests({ pageSize });
        const usersById = await this.loadUsersById(
            requests.map((request) => request.senderId),
        );

        return requests.map((request) => ({
            request,
            user: usersById.get(request.senderId) ?? null,
        }));
    }



    private async loadUsersById(userIds: string[]): Promise<Map<string, User>> {
        const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
        const resolved = await Promise.all(
        uniqueUserIds.map(async (userId) => {
            try {
                const user = await this.server.getUser(userId);
                return [userId, user] as const;
            } catch {
                return null;
            }
        }),
    );

    return new Map(
      resolved.filter((entry): entry is readonly [string, User] => entry !== null),
    );
  }
    
}