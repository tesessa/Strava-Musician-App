import { FriendRequestsDAO } from "../daos/friendRequestsDao";
import { SupabaseFriendRequestsDao } from "../daos/supabase/SupabaseFriendRequestsDao";

export function createFriendRequestsDAO(): FriendRequestsDAO {
  return new SupabaseFriendRequestsDao();
}
