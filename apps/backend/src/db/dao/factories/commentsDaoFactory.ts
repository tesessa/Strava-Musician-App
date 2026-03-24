import { CommentsDao } from "../inMemoryDaos/inMemoryCommentsDao";
import type { CommentsDAO } from "../daos/commentsDao";

export function createCommentsDAO(): CommentsDAO {
  return CommentsDao;
}
