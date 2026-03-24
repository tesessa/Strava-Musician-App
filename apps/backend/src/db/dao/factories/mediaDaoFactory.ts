import { MediaDAO } from "../daos/mediaDao";
import { MediaDao } from "../inMemoryDaos/inMemoryMediaDao";

export function createMediaDAO(): MediaDAO {
  return MediaDao;
}
