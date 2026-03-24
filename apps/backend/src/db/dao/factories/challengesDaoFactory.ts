import { InMemoryChallengesDao } from "../inMemoryDaos/inMemoryChallengesDao";
import type { ChallengesDAO } from "../daos/challengesDao";

let challengesDao: ChallengesDAO | null = null;

export function createChallengesDao(): ChallengesDAO {
  if (!challengesDao) challengesDao = new InMemoryChallengesDao();
  return challengesDao;
}