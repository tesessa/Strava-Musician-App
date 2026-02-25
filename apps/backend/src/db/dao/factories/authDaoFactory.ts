import type { AuthDAO } from "../daos/authDao";
import { AuthDao } from "../inMemoryDaos/inMemoryAuthDao";

export function createAuthDAO(): AuthDAO {
  return AuthDao;
}