import { InMemoryCommentsDao } from "../inMemoryDaos/inMemoryCommentsDao";
import type { CommentsDAO } from "../daos/commentsDao";

let commentsDao: CommentsDAO | null = null;

export function createCommentsDAO(): CommentsDAO {
  if (!commentsDao) commentsDao = new InMemoryCommentsDao();
  return commentsDao;
}
