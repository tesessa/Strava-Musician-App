import { PracticeLog } from "@strava-musician-app/shared";
import { PracticeLogDAO } from "../practiceLogDao";
import db from "./config/SupabaseKnexConnection";
import { SupabaseAuthDao } from "./SupabaseAuthDao";
import { SupabaseUserDao } from "./SupabaseUserDao";
import { SupabaseFriendsDao } from "./SupabaseFriendsDao";

export class SupabasePracticeLogDAO implements PracticeLogDAO {
  authDao = new SupabaseAuthDao(); // replace with factories
  userDao = new SupabaseUserDao(); // replace with factories
  friendDao = new SupabaseFriendsDao(); // replace with factories

  constructor() {
    db.raw("SELECT 1")
      .then(() => console.log("Database connection established"))
      .catch((err) => console.error("Database connection error:", err));
  }

  async getUserPracticeLogs(
    userId: string,
    lastItem: string | null,
    pageSize: number,
  ): Promise<PracticeLog[]> {
    type Cursor = { uuid: string; createdAt: string };
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error("Invalid user ID");
    }

    let cursor: Cursor | undefined = undefined;
    if (lastItem) {
      const lastLog = await this.getPracticeLog(lastItem);
      if (!lastLog) {
        throw new Error("Invalid lastItem cursor");
      }
      if (lastLog.userId !== userId) {
        throw new Error("lastItem cursor does not belong to the user");
      }
      cursor = { uuid: lastLog.practiceLogId, createdAt: lastLog.createdAt };
    }

    let query = db<PracticeLog>("PracticeLog")
      .select("*")
      .where({ userId: userId })
      .orderBy("createdAt", "desc")
      .orderBy("practiceLogId", "desc")
      .limit(pageSize);

    if (cursor) {
      query = query.where(function () {
        this.where("createdAt", "<", cursor.createdAt).orWhere(function () {
          this.where("createdAt", "=", cursor.createdAt).andWhere(
            "practiceLogId",
            "<",
            cursor.uuid,
          );
        });
      });
    }

    const logs = await query;
    return logs;
  }

  async createPracticeLog(practiceLog: PracticeLog): Promise<PracticeLog> {
    const [createdLog] = await db<PracticeLog>("PracticeLog")
      .insert({
        userId: practiceLog.userId,
        practiceLogId: practiceLog.practiceLogId,
        title: practiceLog.title,
        postText: practiceLog.postText,
        privateText: practiceLog.privateText,
        instrument: practiceLog.instrument,
        createdAt: practiceLog.createdAt,
        durationMinutes: practiceLog.durationMinutes,
        tempo: practiceLog.tempo,
        pieceTitle: practiceLog.pieceTitle,
        composer: practiceLog.composer,
      })
      .returning("*");
    if (!createdLog) throw new Error("Practice log insert failed");
    return createdLog;
  }

  async getFeed(
    // TODO add filtering based on friends and privacy settings once those features are implemented
    lastItem: string | null,
    pageSize: number,
    token: string,
  ): Promise<PracticeLog[]> {
    type Cursor = { uuid: string; createdAt: string };
    if (!token) {
      throw new Error("Authentication token is required to access the feed");
    }
    const user = await this.authDao.getUserByToken(token);
    if (!user) {
      throw new Error("Invalid authentication token");
    }
    // For now, this example just returns the most recent practice logs.
    // TODO Once we add friend functionality, we will filter based on the user's friends and privacy settings.
    let cursor: Cursor | undefined = undefined;
    if (lastItem) {
      const lastLog = await this.getPracticeLog(lastItem);
      if (!lastLog) {
        throw new Error("Invalid lastItem cursor");
      }
      cursor = { uuid: lastLog.practiceLogId, createdAt: lastLog.createdAt };
    }

    // join with friend table to get friend's posts
    let query = db<PracticeLog>("PracticeLog")
      .join("Friend", function () {
        this.on("PracticeLog.userId", "=", "Friend.friendId").andOnVal(
          "Friend.userId",
          "=",
          user.userId,
        );
      })
      .select("PracticeLog.*")
      .orderBy("createdAt", "desc")
      .orderBy("practiceLogId", "desc")
      .limit(pageSize);

    if (cursor) {
      query = query.where(function () {
        this.where("createdAt", "<", cursor.createdAt).orWhere(function () {
          this.where("createdAt", "=", cursor.createdAt).andWhere(
            "practiceLogId",
            "<",
            cursor.uuid,
          );
        });
      });
    }

    const logs = await query;
    return logs;
  }

  async getPracticeLog(practiceLogId: string): Promise<PracticeLog | null> {
    const log = await db<PracticeLog>("PracticeLog")
      .where({ practiceLogId: practiceLogId })
      .first();
    if (!log) {
      return null;
    }
    return log;
  }

  async updatePracticeLog(
    practiceLogId: string,
    patch: Partial<PracticeLog>,
  ): Promise<PracticeLog | null> {
    const [updatedLog] = await db<PracticeLog>("PracticeLog")
      .where({ practiceLogId: practiceLogId })
      .update(patch)
      .returning("*");
    if (!updatedLog) {
      return null;
    }
    return updatedLog;
  }

  async deletePracticeLog(practiceLogId: string): Promise<boolean> {
    const deletedCount = await db("PracticeLog")
      .where({ practiceLogId: practiceLogId })
      .delete();
    return deletedCount > 0;
  }
}
