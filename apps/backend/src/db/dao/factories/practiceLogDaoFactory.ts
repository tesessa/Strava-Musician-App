import type { PracticeLogDAO } from "../daos/practiceLogDao";
import { PracticeLogDao } from "../inMemoryDaos/inMemoryPracticeLogDao";

export function createPracticeLogDAO(): PracticeLogDAO {
  return PracticeLogDao;
}
