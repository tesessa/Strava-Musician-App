import { InMemoryMediaDao } from "../inMemoryDaos/inMemoryMediaDao";

export function createMediaDAO() {
  return InMemoryMediaDao;
}
