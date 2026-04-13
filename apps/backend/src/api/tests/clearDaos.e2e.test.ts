// clearDaos.e2e.test.ts
// Jest test to clear all Supabase-backed tables

import { SupabaseUserDao } from "../../db/dao/daos/supabase/SupabaseUserDao";
import { SupabaseFriendsDao } from "../../db/dao/daos/supabase/SupabaseFriendsDao";
import { SupabaseLikesDao } from "../../db/dao/daos/supabase/SupabaseLikesDao";
import { SupabasePracticeLogDAO } from "../../db/dao/daos/supabase/SupabasePracticeLogDao";
import { SupabaseCommentsDao } from "../../db/dao/daos/supabase/SupabaseCommentsDao";
import { SupabaseMediaDao } from "../../db/dao/daos/supabase/SupabaseMediaDao";
import { SupabaseFriendRequestsDao } from "../../db/dao/daos/supabase/SupabaseFriendRequestsDao";
import { SupabaseNotificationsDao } from "../../db/dao/daos/supabase/SupabaseNotificationsDao";
import { SupabaseAuthDao } from "../../db/dao/daos/supabase/SupabaseAuthDao";
import { db } from "../../db/dao/daos/supabase/config/SupabaseKnexConnection";

describe("Clear all Supabase tables", () => {
  console.log("Starting clearDaos.e2e.test.ts with testcontext:", process.env);
  it("should clear all tables without error", async () => {
    const daos = [
      new SupabaseAuthDao(),
      new SupabaseUserDao(),
      new SupabaseFriendsDao(),
      new SupabaseLikesDao(),
      new SupabasePracticeLogDAO(),
      new SupabaseCommentsDao(),
      new SupabaseMediaDao(),
      new SupabaseFriendRequestsDao(),
      new SupabaseNotificationsDao(),
    ];

    for (const dao of daos) {
      if (typeof dao.clearAll === "function") {
        // eslint-disable-next-line no-console
        console.log(`Clearing: ${dao.constructor.name}`);
        await dao.clearAll();
      }
    }
    // eslint-disable-next-line no-console
    console.log("All Supabase tables cleared.");
  });
  afterAll(async () => {
    await db.destroy();
  });
});

