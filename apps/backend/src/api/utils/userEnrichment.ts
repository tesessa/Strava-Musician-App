import type {
  Comment,
  CommentWithAuthor,
  PracticeLog,
  PracticeLogWithAuthor,
  PublicUserProfile,
} from "@strava-musician-app/shared";
import type { UserDAO } from "../../db/dao/daos/userDao";
import { toPublicUserProfile } from "./publicProfile";

export async function batchPublicProfiles(
  userDao: UserDAO,
  ids: string[],
): Promise<Map<string, PublicUserProfile>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const users = await userDao.findUsersByIds(unique);
  const map = new Map<string, PublicUserProfile>();
  for (const u of users) {
    map.set(u.userId, toPublicUserProfile(u));
  }
  return map;
}

export async function enrichPracticeLogsWithAuthors(
  userDao: UserDAO,
  logs: PracticeLog[],
): Promise<PracticeLogWithAuthor[]> {
  const map = await batchPublicProfiles(userDao, logs.map((l) => l.userId));
  return logs.map((log) => {
    const author = map.get(log.userId);
    if (!author) {
      throw new Error(`User not found for practice log ${log.practiceLogId}`);
    }
    return { ...log, author };
  });
}

export async function enrichCommentsWithAuthors(
  userDao: UserDAO,
  comments: Comment[],
): Promise<CommentWithAuthor[]> {
  const map = await batchPublicProfiles(userDao, comments.map((c) => c.userId));
  return comments.map((c) => {
    const author = map.get(c.userId);
    if (!author) {
      throw new Error(`User not found for comment ${c.commentId}`);
    }
    return { ...c, author };
  });
}
