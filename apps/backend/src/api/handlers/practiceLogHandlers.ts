import { UserService } from "../services/userServices";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import { createFriendsService } from "../services/friendsService";
import { createFriendsDAO } from "../../db/dao/factories/friendsDaoFactory";
import { NextResponse } from "next/server";
import { PracticeLogService } from "../services/practiceLogServices";
import { createPracticeLogDAO } from "../../db/dao/factories/practiceLogDaoFactory";
import { authenticateToken, authenticateTokenToUserId } from "../utils/authenticateToken";

const practiceLogService = new PracticeLogService(createPracticeLogDAO());
const userService = new UserService(createUserDAO());
const friendsService = createFriendsService(createFriendsDAO());


// GET /users/:userId/practice-logs
export const getUserPracticeLogs = async (req: Request, userId: string) => {
  const { user: requester, token, error } = await authenticateToken(req);
  if (error) return error;

  // Get the target user
  const targetUser = await userService.getUser(userId);
  if (!targetUser) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  // Visibility logic: assume targetUser.visibility is 'public' or 'private'
  const isSelf = requester.userId === userId;
  let isFriend = false;
  if (!isSelf) {
    isFriend = await friendsService.isFriend(requester.userId, userId);
  }
  const isPublic = (targetUser.postVisibility === 'public');
  const isPrivate = (targetUser.postVisibility === 'private');

  // Authorization logic
  if (!isSelf) {
    if (!isFriend && !isPublic) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (isFriend && isPrivate) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  // Pagination params
  const url = new URL(req.url);
  const lastItemId = url.searchParams.get("lastItemId") ?? null;
  const pageSize = Number(url.searchParams.get("pageSize") ?? 20);

  try {
    const logs = await practiceLogService.getUserPracticeLogs({ userId, lastItem: lastItemId, pageSize });
    return NextResponse.json({ practiceLogs: logs }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};

export const createPracticeLog = async (req: Request) => {
  const { user, token, error } = await authenticateToken(req);
  if (error) return error;

  try {
    const body = await req.json();

    // Validate required fields. durationMinutes is a number (minutes).
    const { title, durationMinutes } = body;
    if (
      typeof title !== "string" ||
      typeof durationMinutes !== "number" ||
      durationMinutes < 0
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields (title, durationMinutes as number)" },
        { status: 400 }
      );
    }

    const practiceLogData = {
      title,
      durationMinutes,
      postText: body.postText,
      privateText: body.privateText,
      instrument: body.instrument,
      tempo: body.tempo,
      pieceTitle: body.pieceTitle,
      composer: body.composer,
    };

    const practiceLog = await practiceLogService.createPracticeLog(practiceLogData, token);
    return NextResponse.json({ practiceLog }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};

export const getFeed = async (req: Request) => {
  const { user, token, error } = await authenticateToken(req);
  if (error) return error;

  try {
    const url = new URL(req.url);
    const lastItemId = url.searchParams.get("lastItemId") ?? null;
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
    const feed = await practiceLogService.getFeed(
      { lastItem: lastItemId, pageSize },
      token
    );
    return NextResponse.json({ practiceLogs: feed }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};

export const getPracticeLog = async (req: Request, practiceLogId: string) => {
  const { user, token, error } = await authenticateToken(req);
  if (error) return error;

  try {
    const practiceLog = await practiceLogService.getPracticeLog(practiceLogId);
    if (!practiceLog)
      return NextResponse.json({ error: "practice_log_not_found" }, { status: 404 });
    return NextResponse.json({ practiceLog }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};

export const updatePracticeLog = async (req: Request, practiceLogId: string) => {
  const practiceLog = await practiceLogService.getPracticeLog(practiceLogId);
  if (!practiceLog)
    return NextResponse.json({ error: "practice_log_not_found" }, { status: 404 });
  const { user, token, error } = await authenticateTokenToUserId(
    req,
    practiceLog.userId
  );
  if (error) return error;

  try {
    const body = await req.json();
    const updated = await practiceLogService.updatePracticeLog(practiceLogId, body);
    if (!updated)
      return NextResponse.json({ error: "practice_log_not_found" }, { status: 404 });
    return NextResponse.json({ practiceLog: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};

export const deletePracticeLog = async (req: Request, practiceLogId: string) => {
  const practiceLog = await practiceLogService.getPracticeLog(practiceLogId);
  if (!practiceLog)
    return NextResponse.json({ error: "practice_log_not_found" }, { status: 404 });
  const { user, token, error } = await authenticateTokenToUserId(
    req,
    practiceLog.userId
  );
  if (error) return error;

  try {
    const ok = await practiceLogService.deletePracticeLog(practiceLogId);
    if (!ok)
      return NextResponse.json({ error: "practice_log_not_found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};
