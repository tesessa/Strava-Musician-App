import { FriendRequestsDAO } from "../daos/friendRequestsDao";
import { createInMemoryFriendRequestsDAO } from "../inMemoryDaos/inMemoryFriendRequestsDao";

export function createFriendRequestsDAO(): FriendRequestsDAO {
  return createInMemoryFriendRequestsDAO();
}
