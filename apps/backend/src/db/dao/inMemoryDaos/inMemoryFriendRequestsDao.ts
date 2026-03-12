import { FriendRequestsDAO } from "../daos/friendRequestsDao";
import { inMemorySocialState } from "./inMemorySocialState";
import type { FriendRequest, FriendRequestStatus } from "@strava-musician-app/shared";

function generateId() {
  return Math.random().toString(36).slice(2);
}

export function createInMemoryFriendRequestsDAO(): FriendRequestsDAO {
  const { friendRequests, friendships } = inMemorySocialState;
  return {
    async createFriendRequest(senderId, receiverId): Promise<FriendRequest> {
      // Don't create duplicate pending requests
      let req = friendRequests.find(r => r.senderId === senderId && r.receiverId === receiverId && r.status === 'pending');
      if (!req) {
        req = {
          requestId: generateId(),
          senderId,
          receiverId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        friendRequests.push(req);
      }
      return req;
    },
    async getFriendRequestById(requestId): Promise<FriendRequest | null> {
      const req = friendRequests.find(r => r.requestId === requestId);
      return req || null;
    },
    async listIncoming(userId, options = {}): Promise<FriendRequest[]> {
      const { lastRequestId = null, pageSize = 20 } = options;
      const incoming = friendRequests.filter(r => r.receiverId === userId && r.status === 'pending');
      let startIdx = 0;
      if (lastRequestId) {
        const idx = incoming.findIndex(r => r.requestId === lastRequestId);
        if (idx === -1) return [];
        startIdx = idx + 1;
      }
      return incoming.slice(startIdx, startIdx + pageSize);
    },
    async listOutgoing(userId, options = {}): Promise<FriendRequest[]> {
      const { lastRequestId = null, pageSize = 20 } = options;
      const outgoing = friendRequests.filter(r => r.senderId === userId && r.status === 'pending');
      let startIdx = 0;
      if (lastRequestId) {
        const idx = outgoing.findIndex(r => r.requestId === lastRequestId);
        if (idx === -1) return [];
        startIdx = idx + 1;
      }
      return outgoing.slice(startIdx, startIdx + pageSize);
    },
    async acceptRequest(requestId) {
      const req = friendRequests.find(r => r.requestId === requestId);
      if (req && req.status === 'pending') {
        req.status = 'accepted';
        req.respondedAt = new Date().toISOString();
        const now = new Date().toISOString();
        // Add friendships both ways if not already present
        if (!friendships.some(f => f.userId === req.senderId && f.friendId === req.receiverId)) {
          friendships.push({ userId: req.senderId, friendId: req.receiverId, friendsSince: now });
        }
        if (!friendships.some(f => f.userId === req.receiverId && f.friendId === req.senderId)) {
          friendships.push({ userId: req.receiverId, friendId: req.senderId, friendsSince: now });
        }
      }
    },
    async rejectRequest(requestId) {
      const req = friendRequests.find(r => r.requestId === requestId);
      if (req) {
        req.status = 'rejected';
        req.respondedAt = new Date().toISOString();
      }
    },
    async cancelRequest(requestId) {
      const req = friendRequests.find(r => r.requestId === requestId);
      if (req) {
        req.status = 'canceled';
        req.respondedAt = new Date().toISOString();
      }
    },
  };
}
