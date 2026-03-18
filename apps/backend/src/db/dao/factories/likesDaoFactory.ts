import { InMemoryLikesDao } from "../inMemoryDaos/inMemoryLikesDao";
import type { LikesDAO } from "../daos/likesDao";

let likesDao: LikesDAO | null = null;

export function createLikesDAO(): LikesDAO {
  if (!likesDao) likesDao = new InMemoryLikesDao();
  return likesDao;
}
