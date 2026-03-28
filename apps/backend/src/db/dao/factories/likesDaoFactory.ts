import { LikesDao } from "../inMemoryDaos/inMemoryLikesDao";
import type { LikesDAO } from "../daos/likesDao";

export function createLikesDAO(): LikesDAO {
  return LikesDao;
}
