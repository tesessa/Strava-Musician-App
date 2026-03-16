import { FriendRequestsDAO } from "../../db/dao/daos/friendRequestsDao";

export function createFriendRequestsService(friendRequestsDao: FriendRequestsDAO) {
  return {
    async createFriendRequest(senderId: string, receiverId: string) {
      return friendRequestsDao.createFriendRequest(senderId, receiverId);
    },
    async getFriendRequestById(requestId: string) {
      return friendRequestsDao.getFriendRequestById(requestId);
    },
    async listIncoming(userId: string, options: { lastRequestId?: string, pageSize?: number } = {}) {
      return friendRequestsDao.listIncoming(userId, options);
    },
    async listOutgoing(userId: string, options: { lastRequestId?: string, pageSize?: number } = {}) {
      return friendRequestsDao.listOutgoing(userId, options);
    },
    async acceptRequest(requestId: string) {
      return friendRequestsDao.acceptRequest(requestId);
    },
    async rejectRequest(requestId: string) {
      return friendRequestsDao.rejectRequest(requestId);
    },
    async cancelRequest(requestId: string) {
      return friendRequestsDao.cancelRequest(requestId);
    },
  };
}
