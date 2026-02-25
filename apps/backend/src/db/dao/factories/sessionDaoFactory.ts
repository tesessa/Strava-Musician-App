import type { SessionDAO } from "../daos/sessionDao";
import { SessionDao } from "../inMemoryDaos/inMemorySessionDao";

export function createSessionDAO(): SessionDAO {
  return SessionDao;
}