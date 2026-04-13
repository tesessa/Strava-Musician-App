import { FriendsDAO } from "../daos/friendsDao";
import { SupabaseFriendsDao } from "../daos/supabase/SupabaseFriendsDao";

export function createFriendsDAO(): FriendsDAO {
  return new SupabaseFriendsDao();
}
