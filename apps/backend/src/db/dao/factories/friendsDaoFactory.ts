import { FriendsDAO } from "../daos/friendsDao";
import { FriendsDao } from "../inMemoryDaos/inMemoryFriendsDao";

export function createFriendsDAO(): FriendsDAO {
  return FriendsDao;
}
