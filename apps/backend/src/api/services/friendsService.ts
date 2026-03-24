import { FriendsDAO } from "../../db/dao/daos/friendsDao";

export class FriendsService {
  private friendsDao: FriendsDAO;

  constructor(friendsDao: FriendsDAO) {
    this.friendsDao = friendsDao;
  }

  async listFriends(userId: string, options: { lastFriendId?: string | null, pageSize?: number } = {}) {
    return this.friendsDao.listFriends(userId, { lastFriendId: options.lastFriendId, pageSize: options.pageSize });
  }

  async sendOrAcceptFriendRequest(userId: string, friendId: string) {
    return this.friendsDao.sendOrAcceptFriendRequest(userId, friendId);
  }

  async removeFriend(userId: string, friendId: string) {
    return this.friendsDao.removeFriend(userId, friendId);
  }

  async isFriend(userId: string, otherUserId: string) {
    return this.friendsDao.isFriend(userId, otherUserId);
  }
}
