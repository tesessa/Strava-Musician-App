import { FriendsDAO } from "../daos/friendsDao";
import { createInMemoryFriendsDAO } from "../inMemoryDaos/inMemoryFriendsDao";

export function createFriendsDAO(): FriendsDAO {
  return createInMemoryFriendsDAO();
}
