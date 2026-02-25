import type { UserDAO } from "../daos/userDao";
import { UserDao } from "../inMemoryDaos/inMemoryUserDao";

export function createUserDAO(): UserDAO {
  return UserDao;
}