import { FriendsDAO } from "../../db/dao/daos/friendsDao";

export function createFriendsService(friendsDao: FriendsDAO) {
  return {
    async listFriends(userId: string, options: { lastFriendId?: string | null, pageSize?: number } = {}) {
      return friendsDao.listFriends(userId, { lastFriendId: options.lastFriendId, pageSize: options.pageSize });
    },
    async sendOrAcceptFriendRequest(userId: string, friendId: string) {
      return friendsDao.sendOrAcceptFriendRequest(userId, friendId);
    },
    async removeFriend(userId: string, friendId: string) {
      return friendsDao.removeFriend(userId, friendId);
    },
    async isFriend(userId: string, otherUserId: string) {
      return friendsDao.isFriend(userId, otherUserId);
    },
  };
}
