import { ChallengesDao } from "../inMemoryDaos/inMemoryChallengesDao";
import type { ChallengesDAO } from "../daos/challengesDao";

export function createChallengesDao(): ChallengesDAO {
  return ChallengesDao;
}