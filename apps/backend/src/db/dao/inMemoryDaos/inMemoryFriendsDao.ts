import { FriendsDAO } from "../daos/friendsDao";
import { inMemorySocialState } from "./inMemorySocialState";
import type { Friend } from "@strava-musician-app/shared";

function generateId() {
  return Math.random().toString(36).slice(2);
}

class InMemoryFriendsDao implements FriendsDAO {
  private friendships = inMemorySocialState.friendships;
  private friendRequests = inMemorySocialState.friendRequests;

  async listFriends(userId: string, options: { lastFriendId?: string | null, pageSize?: number } = {}): Promise<Friend[]> {
    const { lastFriendId = null, pageSize = 20 } = options;
    // Sort by friendsSince for stable pagination
    const userFriends = this.friendships
      .filter(f => f.userId === userId)
      .sort((a, b) => b.friendsSince.localeCompare(a.friendsSince));
    let startIdx = 0;
    if (lastFriendId) {
      const idx = userFriends.findIndex(f => f.friendId === lastFriendId);
      if (idx === -1) return [];
      startIdx = idx + 1;
    }
    return userFriends.slice(startIdx, startIdx + pageSize);
  }

  async sendOrAcceptFriendRequest(userId: string, friendId: string) {
    // Check for a pending friend request from friendId to userId
    const pendingReq = this.friendRequests.find(r => r.senderId === friendId && r.receiverId === userId && r.status === 'pending');
    if (pendingReq) {
      // Accept the request and create friendship both ways
      pendingReq.status = 'accepted';
      pendingReq.respondedAt = new Date().toISOString();
      const now = new Date().toISOString();
      if (!this.friendships.some(f => f.userId === userId && f.friendId === friendId)) {
        this.friendships.push({ userId, friendId, friendsSince: now });
      }
      if (!this.friendships.some(f => f.userId === friendId && f.friendId === userId)) {
        this.friendships.push({ userId: friendId, friendId: userId, friendsSince: now });
      }
      return { userId, friendId, accepted: true };
    }
    // If no pending request, check if a request already exists from userId to friendId
    let existingReq = this.friendRequests.find(r => r.senderId === userId && r.receiverId === friendId && r.status === 'pending');
    if (!existingReq) {
      // Create a new friend request
      existingReq = {
        requestId: generateId(),
        senderId: userId,
        receiverId: friendId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      this.friendRequests.push(existingReq);
    }
    return { userId, friendId, requestId: existingReq.requestId, requested: true };
  }

  async removeFriend(userId: string, friendId: string) {
    for (const [a, b] of [[userId, friendId], [friendId, userId]]) {
      const idx = this.friendships.findIndex(f => f.userId === a && f.friendId === b);
      if (idx !== -1) this.friendships.splice(idx, 1);
    }
  }

  async isFriend(userId: string, otherUserId: string) {
    return this.friendships.some(f => f.userId === userId && f.friendId === otherUserId);
  }
}

export const FriendsDao = new InMemoryFriendsDao();