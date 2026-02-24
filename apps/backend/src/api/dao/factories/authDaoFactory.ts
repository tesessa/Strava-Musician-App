import type { AuthDAO } from "../daoInterfaces/authDao";
import { AuthDao } from "../inMemoryDaos/inMemoryAuthDao";
// import { prismaAuthDao } from "./prismaAuthDao"; // for DB-backed implementation

export function createAuthDAO(): AuthDAO {
  // You can add logic here to choose implementation based on environment
  // For now, always return in-memory
  return AuthDao;
}