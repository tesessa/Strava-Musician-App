import { FriendRequestsDAO } from "../daos/friendRequestsDao";
import { FriendRequestsDao } from "../inMemoryDaos/inMemoryFriendRequestsDao";

export function createFriendRequestsDAO(): FriendRequestsDAO {
  return FriendRequestsDao;
}
