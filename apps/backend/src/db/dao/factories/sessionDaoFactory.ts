import type { SessionDAO } from "../daos/sessionDao";
import { SessionDao } from "../inMemoryDaos/inMemorySessionDao";
// import { prismaSessionDao } from "../prismaDaos/prismaSessionDao"; // for DB-backed

export function createSessionDAO(): SessionDAO {
  // Add logic to switch implementations if needed
  return SessionDao;
}