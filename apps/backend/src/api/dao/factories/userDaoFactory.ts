import type { UserDAO } from "../daos/userDao";
import { UserDao } from "../inMemoryDaos/inMemoryUserDao";
// import { prismaUserDao } from "./prismaUserDao"; // for DB-backed implementation

export function createUserDAO(): UserDAO {
  // You can add logic here to choose implementation based on environment
  // For now, always return in-memory
  return UserDao;
}