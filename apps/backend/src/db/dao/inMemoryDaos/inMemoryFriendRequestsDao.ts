import { FriendRequestsDAO } from "../daos/friendRequestsDao";
import { inMemorySocialState } from "./inMemorySocialState";
import type { FriendRequest, FriendRequestStatus } from "@strava-musician-app/shared";

function generateId() {
  return Math.random().toString(36).slice(2);
}

class InMemoryFriendRequestsDao implements FriendRequestsDAO {
  private friendRequests = inMemorySocialState.friendRequests;
  private friendships = inMemorySocialState.friendships;

  async createFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest> {
  // Don't create duplicate pending requests
  let req = this.friendRequests.find(r => r.senderId === senderId && r.receiverId === receiverId && r.status === 'pending');
    if (!req) {
      req = {
        requestId: generateId(),
        senderId,
        receiverId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      this.friendRequests.push(req);
    }
    return req;
  }
  async getFriendRequestById(requestId: string): Promise<FriendRequest | null> {
    const req = this.friendRequests.find(r => r.requestId === requestId);
    return req || null;
  }
  async listIncoming(userId: string, options: { lastRequestId?: string | null, pageSize?: number } = {}): Promise<FriendRequest[]> {
    const { lastRequestId = null, pageSize = 20 } = options;
    const incoming = this.friendRequests
      .filter(r => r.receiverId === userId && r.status === 'pending')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    let startIdx = 0;
    if (lastRequestId) {
      const idx = incoming.findIndex(r => r.requestId === lastRequestId);
      if (idx === -1) return [];
      startIdx = idx + 1;
    }
    return incoming.slice(startIdx, startIdx + pageSize);
  }
  async listOutgoing(userId: string, options: { lastRequestId?: string | null, pageSize?: number } = {}): Promise<FriendRequest[]> {
    const { lastRequestId = null, pageSize = 20 } = options;
    const outgoing = this.friendRequests
      .filter(r => r.senderId === userId && r.status === 'pending')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    let startIdx = 0;
    if (lastRequestId) {
      const idx = outgoing.findIndex(r => r.requestId === lastRequestId);
      if (idx === -1) return [];
      startIdx = idx + 1;
    }
    return outgoing.slice(startIdx, startIdx + pageSize);
  }
  async acceptRequest(requestId: string) {
    const req = this.friendRequests.find(r => r.requestId === requestId);
    if (req && req.status === 'pending') {
      req.status = 'accepted';
      req.respondedAt = new Date().toISOString();
      const now = new Date().toISOString();
      // Add friendships both ways if not already present
      if (!this.friendships.some(f => f.userId === req.senderId && f.friendId === req.receiverId)) {
        this.friendships.push({ userId: req.senderId, friendId: req.receiverId, friendsSince: now });
      }
      if (!this.friendships.some(f => f.userId === req.receiverId && f.friendId === req.senderId)) {
        this.friendships.push({ userId: req.receiverId, friendId: req.senderId, friendsSince: now });
      }
    }
  }
  async rejectRequest(requestId: string) {
    const req = this.friendRequests.find(r => r.requestId === requestId);
    if (req) {
      req.status = 'rejected';
      req.respondedAt = new Date().toISOString();
    }
  }
  async cancelRequest(requestId: string) {
    const req = this.friendRequests.find(r => r.requestId === requestId);
    if (req) {
      req.status = 'canceled';
      req.respondedAt = new Date().toISOString();
    }
  }
};

export const FriendRequestsDao = new InMemoryFriendRequestsDao();