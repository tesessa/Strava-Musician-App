/**
 * Demo database seed for Supabase/Postgres (same schema as Supabase* DAOs).
 *
 * Run from repo root (requires SUPABASE_CONNECTION in .env):
 *   npm run seed:demo
 *
 * Idempotent: removes prior demo rows (emails ending with @demo.koda.seed), then inserts fresh data.
 *
 * Main character login (also printed on success):
 *   Email:    tessa.m@demo.koda.seed
 *   Password: DemoKoda2026!
 *
 * Login uses POST /auth/login with { email, password } (see authHandlers).
 */

import { createHash } from "node:crypto";
import { hashPassword } from "../src/api/utils/hashPassword";
import db from "../src/db/dao/daos/supabase/config/SupabaseKnexConnection";

const DEMO_EMAIL_SUFFIX = "@demo.koda.seed";

/** Deterministic UUID v4 (RFC 4122) from SHA-256(seed) for stable re-runs */
function stableUuid(seed: string): string {
  const buf = createHash("sha256").update(seed).digest().subarray(0, 16);
  buf[6] = (buf[6]! & 0x0f) | 0x40;
  buf[8] = (buf[8]! & 0x3f) | 0x80;
  const hex = buf.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

const U = {
  tessa: stableUuid("user-tessa"),
  sam: stableUuid("user-sam"),
  kona: stableUuid("user-kona"),
  foster: stableUuid("user-foster"),
  hudson: stableUuid("user-hudson"),
  jocelyn: stableUuid("user-jocelyn"),
  colby: stableUuid("user-colby"),
  riley: stableUuid("user-riley"),
  morgan: stableUuid("user-morgan"),
  quinn: stableUuid("user-quinn"),
} as const;

const CLIQUE = [
  U.foster,
  U.hudson,
  U.jocelyn,
  U.colby,
  U.riley,
  U.morgan,
  U.quinn,
];

const DEMO_PASSWORD = "DemoKoda2026!";

const REQ_M_TO_SAM = stableUuid("req-m-to-sam");
const REQ_KONA_TO_M = stableUuid("req-kona-to-m");

async function ensureEventTable(): Promise<void> {
  const has = await db.schema.hasTable("Event");
  if (has) return;
  await db.raw(`
    CREATE TABLE "Event" (
      "eventId" uuid PRIMARY KEY,
      "userId" uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "title" text NOT NULL,
      "description" text NOT NULL DEFAULT '',
      "date" date NOT NULL,
      "startTime" text NOT NULL,
      "endTime" text NOT NULL,
      "isAllDay" boolean NOT NULL DEFAULT false,
      "location" text NOT NULL DEFAULT '',
      "reminderMinBefore" integer NOT NULL DEFAULT 0,
      "eventType" text NOT NULL,
      "visibility" text NOT NULL
    );
  `);
}

async function removePreviousDemoSeed(): Promise<void> {
  const users = await db("User")
    .where("email", "like", `%${DEMO_EMAIL_SUFFIX}`)
    .select("id");
  const userIds = users.map((r: { id: string }) => r.id);
  if (userIds.length === 0) return;

  if (await db.schema.hasTable("Event")) {
    await db("Event").whereIn("userId", userIds).del();
  }

  await db("AuthSession").whereIn("user_id", userIds).del();

  await db("Notification")
    .where(function () {
      this.whereIn("userId", userIds).orWhereIn("actorId", userIds);
    })
    .del();

  const logIds = (
    await db("PracticeLog").whereIn("userId", userIds).select("practiceLogId")
  ).map((r: { practiceLogId: string }) => r.practiceLogId);

  if (logIds.length > 0) {
    await db("Media").whereIn("practiceLogId", logIds).del();
    await db("Comments").whereIn("practiceLogId", logIds).del();
    await db("Likes").whereIn("practiceLogId", logIds).del();
  }

  await db("PracticeLog").whereIn("userId", userIds).del();

  await db("Friend")
    .where(function () {
      this.whereIn("userId", userIds).orWhereIn("friendId", userIds);
    })
    .del();

  await db("FriendRequest")
    .where(function () {
      this.whereIn("senderId", userIds).orWhereIn("receiverId", userIds);
    })
    .del();

  await db("User").whereIn("id", userIds).del();
}

function weekdaysAprilMay2026(): { date: string; month: "04" | "05" }[] {
  const out: { date: string; month: "04" | "05" }[] = [];
  for (let month = 3; month <= 4; month++) {
    const year = 2026;
    const lastDay = month === 3 ? 30 : 31;
    for (let day = 1; day <= lastDay; day++) {
      const dt = new Date(year, month, day);
      const wd = dt.getDay();
      if (wd === 0 || wd === 6) continue;
      const mm = month === 3 ? "04" : "05";
      out.push({
        date: `2026-${mm}-${String(day).padStart(2, "0")}`,
        month: mm as "04" | "05",
      });
    }
  }
  return out;
}

async function main(): Promise<void> {
  const pwHash = hashPassword(DEMO_PASSWORD);
  const now = new Date();

  await removePreviousDemoSeed();
  await ensureEventTable();

  const userRows = [
    {
      id: U.tessa,
      email: `tessa.m${DEMO_EMAIL_SUFFIX}`,
      username: "tessa_m",
      bio: "Violinist · daily practice, big on Bach partitas.",
      post_visibility: "friends" as const,
      instruments: ["Violin"],
    },
    {
      id: U.sam,
      email: `sam.lee${DEMO_EMAIL_SUFFIX}`,
      username: "sam_k",
      bio: "Piano · working through late Beethoven.",
      post_visibility: "friends" as const,
      instruments: ["Piano"],
    },
    {
      id: U.kona,
      email: `kona.m${DEMO_EMAIL_SUFFIX}`,
      username: "kona_k",
      bio: "Cello · orchestra + solo rep.",
      post_visibility: "friends" as const,
      instruments: ["Cello"],
    },
    {
      id: U.foster,
      email: `foster.h${DEMO_EMAIL_SUFFIX}`,
      username: "foster_h",
      bio: "Classical guitar · tone and phrasing nerd.",
      post_visibility: "friends" as const,
      instruments: ["Acoustic Guitar"],
    },
    {
      id: U.hudson,
      email: `hudson.r${DEMO_EMAIL_SUFFIX}`,
      username: "hudson_r",
      bio: "Saxophone · jazz combos and transcription.",
      post_visibility: "friends" as const,
      instruments: ["Saxophone"],
    },
    {
      id: U.jocelyn,
      email: `jocelyn.t${DEMO_EMAIL_SUFFIX}`,
      username: "jocelyn_t",
      bio: "Voice · art songs and choral work.",
      post_visibility: "friends" as const,
      instruments: ["Singing"],
    },
    {
      id: U.colby,
      email: `colby.p${DEMO_EMAIL_SUFFIX}`,
      username: "colby_p",
      bio: "Drums · groove and brush work.",
      post_visibility: "friends" as const,
      instruments: ["Drums"],
    },
    {
      id: U.riley,
      email: `riley.a${DEMO_EMAIL_SUFFIX}`,
      username: "riley_a",
      bio: "Flute · etudes and chamber.",
      post_visibility: "friends" as const,
      instruments: ["Flute"],
    },
    {
      id: U.morgan,
      email: `morgan.c${DEMO_EMAIL_SUFFIX}`,
      username: "morgan_c",
      bio: "Clarinet · orchestral excerpts.",
      post_visibility: "friends" as const,
      instruments: ["Clarinet"],
    },
    {
      id: U.quinn,
      email: `quinn.d${DEMO_EMAIL_SUFFIX}`,
      username: "quinn_d",
      bio: "Trumpet · lead and section playing.",
      post_visibility: "friends" as const,
      instruments: ["Trumpet"],
    },
  ];

  await db("User").insert(
    userRows.map((u) => ({
      id: u.id,
      created_at: now,
      updated_at: now,
      email: u.email,
      username: u.username,
      password: pwHash,
      image_url: "",
      bio: u.bio,
      post_visibility: u.post_visibility,
      instruments: u.instruments,
    })),
  );

  const friendRows: { userId: string; friendId: string; friendsSince: string }[] =
    [];
  const fs = now.toISOString();

  for (let i = 0; i < CLIQUE.length; i++) {
    for (let j = i + 1; j < CLIQUE.length; j++) {
      const a = CLIQUE[i];
      const b = CLIQUE[j];
      friendRows.push(
        { userId: a, friendId: b, friendsSince: fs },
        { userId: b, friendId: a, friendsSince: fs },
      );
    }
  }

  for (const f of CLIQUE) {
    friendRows.push(
      { userId: U.tessa, friendId: f, friendsSince: fs },
      { userId: f, friendId: U.tessa, friendsSince: fs },
    );
  }

  friendRows.push(
    { userId: U.sam, friendId: U.riley, friendsSince: fs },
    { userId: U.riley, friendId: U.sam, friendsSince: fs },
    { userId: U.kona, friendId: U.morgan, friendsSince: fs },
    { userId: U.morgan, friendId: U.kona, friendsSince: fs },
  );

  await db("Friend").insert(friendRows);

  await db("FriendRequest").insert([
    {
      requestId: REQ_M_TO_SAM,
      senderId: U.tessa,
      receiverId: U.sam,
      status: "pending",
      createdAt: fs,
    },
    {
      requestId: REQ_KONA_TO_M,
      senderId: U.kona,
      receiverId: U.tessa,
      status: "pending",
      createdAt: fs,
    },
  ]);

  type LogRow = {
    practiceLogId: string;
    userId: string;
    title: string;
    postText: string;
    privateText: string;
    instrument: string;
    createdAt: Date;
    durationMinutes: number;
    tempo: number;
    pieceTitle: string;
    composer: string;
  };

  const logs: LogRow[] = [];
  let logIdx = 0;

  function addLogs(
    userId: string,
    titles: { title: string; post: string; piece: string; composer: string; inst: string }[],
    baseDay: number,
  ) {
    for (const t of titles) {
      const day = Math.min(28, Math.max(1, baseDay + (logIdx % 5)));
      logIdx++;
      const createdAt = new Date(Date.UTC(2026, 2, day, 14 + (logIdx % 5), 30, 0));
      logs.push({
        practiceLogId: stableUuid(`plog-${userId}-${t.title}-${logIdx}`),
        userId,
        title: t.title,
        postText: t.post,
        privateText: "Private notes for this session.",
        instrument: t.inst,
        createdAt,
        durationMinutes: 25 + (logIdx % 40),
        tempo: 72 + (logIdx % 40),
        pieceTitle: t.piece,
        composer: t.composer,
      });
    }
  }

  addLogs(U.tessa, [
    { title: "Bach — Allemande", post: "Voicing and bow strokes.", piece: "Partita No. 2", composer: "Bach", inst: "Violin" },
    { title: "Scales — G melodic minor", post: "Even tone across registers.", piece: "Scales", composer: "—", inst: "Violin" },
    { title: "Double — slow tempo", post: "String crossings clean.", piece: "Partita No. 2", composer: "Bach", inst: "Violin" },
    { title: "Orchestra excerpt", post: "Beethoven 9 — rhythmic clarity.", piece: "Symphony No. 9", composer: "Beethoven", inst: "Violin" },
    { title: "Warm-up — long tones", post: "Fourth finger strength.", piece: "Exercises", composer: "—", inst: "Violin" },
    { title: "Sight-reading", post: "Telemann — light articulation.", piece: "Fantasia", composer: "Telemann", inst: "Violin" },
    { title: "Chamber prep", post: "Matching intonation with cello.", piece: "Piano Trio", composer: "Schubert", inst: "Violin" },
    { title: "Recording take", post: "Two passes, compare phrasing.", piece: "Gigue", composer: "Bach", inst: "Violin" },
  ], 3);

  const friendTemplates = [
    { uid: U.foster, inst: "Acoustic Guitar", rows: [
      { title: "Tarrega — Adelita", post: "Rubato and bass sustain.", piece: "Adelita", composer: "Tarrega" },
      { title: "Right-hand arpeggios", post: "Even volume per finger.", piece: "Studies", composer: "—" },
      { title: "Bar chord shifts", post: "Minimal squeaks.", piece: "Exercises", composer: "—" },
      { title: "Bach — Prelude", post: "Voice leading on guitar.", piece: "BWV 998", composer: "Bach" },
    ]},
    { uid: U.hudson, inst: "Saxophone", rows: [
      { title: "Transcription — Parker", post: "Bebop language.", piece: "Donna Lee", composer: "Parker" },
      { title: "Long tones", post: "Altissimo check-in.", piece: "Long tones", composer: "—" },
      { title: "Rhythm changes", post: "Guide tones on ii-V.", piece: "Rhythm changes", composer: "—" },
      { title: "Ballad", post: "Breath support and vibrato.", piece: "Body and Soul", composer: "—" },
    ]},
    { uid: U.jocelyn, inst: "Singing", rows: [
      { title: "Schubert — Gretchen", post: "Text painting on piano dynamics.", piece: "Gretchen am Spinnrade", composer: "Schubert" },
      { title: "Vocalises", post: "Legato through passaggio.", piece: "Vocalise", composer: "—" },
      { title: "French art song", post: "Nasal resonance balance.", piece: "Mandoline", composer: "Debussy" },
      { title: "Choral score", post: "Blend and tuning with section.", piece: "Requiem", composer: "Faure" },
    ]},
    { uid: U.colby, inst: "Drums", rows: [
      { title: "Brush circles", post: "Tempo 120, even texture.", piece: "Brushes", composer: "—" },
      { title: "Linear fills", post: "No flams on ghost notes.", piece: "Coordination", composer: "—" },
      { title: "Play-along", post: "Funk pocket.", piece: "Play-along", composer: "—" },
      { title: "Odd meters", post: "7/8 ostinato.", piece: "Odd meters", composer: "—" },
    ]},
    { uid: U.riley, inst: "Flute", rows: [
      { title: "Taffanel-Gaubert", post: "Finger evenness day.", piece: "Daily exercises", composer: "Taffanel" },
      { title: "Mozart — Concerto", post: "Cadence outline.", piece: "Concerto in G", composer: "Mozart" },
      { title: "Tone — harmonics", post: "Support and aperture.", piece: "Harmonics", composer: "—" },
      { title: "Etude", post: "Articulation at mm=96.", piece: "Etudes", composer: "Andersen" },
    ]},
    { uid: U.morgan, inst: "Clarinet", rows: [
      { title: "Rose etudes", post: "Staccato clarity.", piece: "Etudes", composer: "Rose" },
      { title: "Orchestra book", post: "Nutcracker — clarinet solo.", piece: "Nutcracker", composer: "Tchaikovsky" },
      { title: "Long tones", post: "Pitch center on throat tones.", piece: "Long tones", composer: "—" },
      { title: "Chamber", post: "Blend with strings.", piece: "Quintet", composer: "Mozart" },
    ]},
    { uid: U.quinn, inst: "Trumpet", rows: [
      { title: "Clarke studies", post: "Finger dexterity.", piece: "Technical Studies", composer: "Clarke" },
      { title: "Arban", post: "Slurs across partials.", piece: "Arban", composer: "Arban" },
      { title: "Lead chart", post: "High C endurance.", piece: "Big band set", composer: "—" },
      { title: "Warm down", post: "Mouthpiece buzzing.", piece: "Warm down", composer: "—" },
    ]},
  ];

  for (const ft of friendTemplates) {
    addLogs(
      ft.uid,
      ft.rows.map((r) => ({
        title: r.title,
        post: r.post,
        piece: r.piece,
        composer: r.composer,
        inst: ft.inst,
      })),
      5,
    );
  }

  addLogs(U.sam, [
    { title: "Beethoven — Op. 110", post: "Arioso return, voicing.", piece: "Piano Sonata", composer: "Beethoven", inst: "Piano" },
    { title: "Chopin étude", post: "RH lightness.", piece: "Etude Op. 10", composer: "Chopin", inst: "Piano" },
    { title: "Slow movement", post: "Pedal plan.", piece: "Sonata", composer: "Schubert", inst: "Piano" },
  ], 8);

  addLogs(U.kona, [
    { title: "Popper etude", post: "String crossings at tip.", piece: "High School", composer: "Popper", inst: "Cello" },
    { title: "Bach suite", post: "Courante pulse.", piece: "Suite No. 3", composer: "Bach", inst: "Cello" },
    { title: "Orchestra tutti", post: "Brahms — rhythmic drive.", piece: "Symphony No. 1", composer: "Brahms", inst: "Cello" },
  ], 9);

  await db("PracticeLog").insert(
    logs.map((l) => ({
      userId: l.userId,
      practiceLogId: l.practiceLogId,
      title: l.title,
      postText: l.postText,
      privateText: l.privateText,
      instrument: l.instrument,
      createdAt: l.createdAt,
      durationMinutes: l.durationMinutes,
      tempo: l.tempo,
      pieceTitle: l.pieceTitle,
      composer: l.composer,
    })),
  );

  const tessaLogs = logs.filter((l) => l.userId === U.tessa);
  const fosterLogs = logs.filter((l) => l.userId === U.foster);
  const samLogs = logs.filter((l) => l.userId === U.sam);

  const likeRows: { userId: string; practiceLogId: string; createdAt: Date }[] =
    [];
  const commentRows: {
    commentId: string;
    practiceLogId: string;
    userId: string;
    text: string;
    createdAt: Date;
  }[] = [];

  function pushLike(userId: string, practiceLogId: string) {
    likeRows.push({
      userId,
      practiceLogId,
      createdAt: new Date(Date.UTC(2026, 3, 10, 18, 0, 0)),
    });
  }

  if (tessaLogs[0]) pushLike(U.foster, tessaLogs[0].practiceLogId);
  if (tessaLogs[1]) pushLike(U.hudson, tessaLogs[1].practiceLogId);
  if (tessaLogs[2]) pushLike(U.jocelyn, tessaLogs[2].practiceLogId);
  if (tessaLogs[3]) pushLike(U.colby, tessaLogs[3].practiceLogId);
  if (tessaLogs[0]) pushLike(U.riley, tessaLogs[0].practiceLogId);
  if (fosterLogs[0]) pushLike(U.tessa, fosterLogs[0].practiceLogId);
  if (fosterLogs[1]) pushLike(U.hudson, fosterLogs[1].practiceLogId);
  if (samLogs[0]) pushLike(U.riley, samLogs[0].practiceLogId);

  await db("Likes").insert(likeRows);

  if (tessaLogs[0]) {
    commentRows.push({
      commentId: stableUuid("c1"),
      practiceLogId: tessaLogs[0].practiceLogId,
      userId: U.foster,
      text: "Love the phrasing here — try a hair more bow on the peak.",
      createdAt: new Date(Date.UTC(2026, 3, 11, 12, 5, 0)),
    });
  }
  if (tessaLogs[1]) {
    commentRows.push({
      commentId: stableUuid("c2"),
      practiceLogId: tessaLogs[1].practiceLogId,
      userId: U.quinn,
      text: "Scales sound locked in. Maybe record with a drone?",
      createdAt: new Date(Date.UTC(2026, 3, 12, 9, 20, 0)),
    });
  }
  if (fosterLogs[0]) {
    commentRows.push({
      commentId: stableUuid("c3"),
      practiceLogId: fosterLogs[0].practiceLogId,
      userId: U.tessa,
      text: "Beautiful bass resonance on the repeats.",
      createdAt: new Date(Date.UTC(2026, 3, 13, 16, 0, 0)),
    });
  }
  if (fosterLogs[0]) {
    commentRows.push({
      commentId: stableUuid("c4"),
      practiceLogId: fosterLogs[0].practiceLogId,
      userId: U.jocelyn,
      text: "Guitar singing today 🎶",
      createdAt: new Date(Date.UTC(2026, 3, 14, 8, 45, 0)),
    });
  }

  await db("Comments").insert(commentRows);

  const notifRows: {
    notificationId: string;
    userId: string;
    actorId: string;
    type: string;
    entityType: string;
    entityId: string;
    createdAt: Date;
    isRead: boolean;
  }[] = [];

  let ni = 0;
  for (const lk of likeRows) {
    const log = logs.find((l) => l.practiceLogId === lk.practiceLogId);
    if (!log || log.userId === lk.userId) continue;
    notifRows.push({
      notificationId: stableUuid(`notif-like-${ni++}`),
      userId: log.userId,
      actorId: lk.userId,
      type: "like",
      entityType: "practiceLog",
      entityId: lk.practiceLogId,
      createdAt: lk.createdAt,
      isRead: false,
    });
  }
  for (const c of commentRows) {
    const log = logs.find((l) => l.practiceLogId === c.practiceLogId);
    if (!log || log.userId === c.userId) continue;
    notifRows.push({
      notificationId: stableUuid(`notif-comment-${ni++}`),
      userId: log.userId,
      actorId: c.userId,
      type: "comment",
      entityType: "practiceLog",
      entityId: c.practiceLogId,
      createdAt: c.createdAt,
      isRead: false,
    });
  }

  if (notifRows.length > 0) {
    await db("Notification").insert(notifRows);
  }

  const eventRows: Record<string, unknown>[] = [];
  let ei = 0;

  for (const { date } of weekdaysAprilMay2026()) {
    eventRows.push({
      eventId: stableUuid(`evt-tessa-daily-${ei++}`),
      userId: U.tessa,
      title: "Morning practice block",
      description: "Warm-up, repertoire, and recording pass.",
      date,
      startTime: "07:00",
      endTime: "08:15",
      isAllDay: false,
      location: "Home studio",
      reminderMinBefore: 15,
      eventType: "practice",
      visibility: "friends",
    });
  }

  const performances: {
    userId: string;
    date: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    visibility: string;
  }[] = [
    {
      userId: U.foster,
      date: "2026-05-03",
      title: "Spring studio recital",
      description: "Solo set — Tarrega and Bach.",
      startTime: "15:00",
      endTime: "15:40",
      location: "Community Hall A",
      visibility: "friends",
    },
    {
      userId: U.hudson,
      date: "2026-05-17",
      title: "Jazz ensemble night",
      description: "Feature on two charts; rhythm section showcase.",
      startTime: "19:30",
      endTime: "21:00",
      location: "Blue Rail Club",
      visibility: "public",
    },
    {
      userId: U.jocelyn,
      date: "2026-05-24",
      title: "Chamber vocal concert",
      description: "Art song set with piano.",
      startTime: "18:00",
      endTime: "19:30",
      location: "Arts Center Recital Hall",
      visibility: "friends",
    },
    {
      userId: U.colby,
      date: "2026-05-31",
      title: "Year-end percussion showcase",
      description: "Brushes + small group numbers.",
      startTime: "17:00",
      endTime: "18:30",
      location: "HS Auditorium",
      visibility: "public",
    },
  ];

  for (const p of performances) {
    eventRows.push({
      eventId: stableUuid(`evt-perf-${p.userId}-${p.date}`),
      userId: p.userId,
      title: p.title,
      description: p.description,
      date: p.date,
      startTime: p.startTime,
      endTime: p.endTime,
      isAllDay: false,
      location: p.location,
      reminderMinBefore: 60,
      eventType: "performance",
      visibility: p.visibility,
    });
  }

  if (eventRows.length > 0) {
    await db("Event").insert(eventRows);
  }

  // eslint-disable-next-line no-console
  console.log(`
Demo seed complete.
  Users:              ${userRows.length}
  Practice logs:      ${logs.length}
  Friend rows:        ${friendRows.length}
  Friend requests:    2 (M→Sam outgoing pending, Kona→M incoming pending)
  Likes:              ${likeRows.length}
  Comments:           ${commentRows.length}
  Events (Apr–May):   ${eventRows.length}

Main character (Tessa) — sign in:
  Email:    tessa.m${DEMO_EMAIL_SUFFIX}
  Password: ${DEMO_PASSWORD}

All demo users share the same password (demo-only). Auth uses email + password (hash matches apps/backend/src/api/utils/hashPassword.ts).
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
