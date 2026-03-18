import { NextResponse } from "next/server";
import { authenticateToken } from "../utils/authenticateToken";
import { MediaService } from "../services/mediaService";
import { createMediaDAO } from "../../db/dao/factories/mediaDaoFactory";
import { PracticeLogService } from "../services/practiceLogServices";
import { createPracticeLogDAO } from "../../db/dao/factories/practiceLogDaoFactory";
import { UserService } from "../services/userServices";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import { createFriendsService } from "../services/friendsService";
import { createFriendsDAO } from "../../db/dao/factories/friendsDaoFactory";

const mediaService = new MediaService(createMediaDAO());
const practiceLogService = new PracticeLogService(createPracticeLogDAO());
const userService = new UserService(createUserDAO());
const friendsService = createFriendsService(createFriendsDAO());

export async function createMedia(req: Request, practiceLogId: string) {
  const { user, token, error } = await authenticateToken(req);
  if (error) return error;
  const practiceLog = await practiceLogService.getPracticeLog(practiceLogId);
  if (!practiceLog) return NextResponse.json({ error: "practice_log_not_found" }, { status: 404 });
  if (practiceLog.userId !== user.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const media = await mediaService.createMedia(practiceLogId, body);
    return NextResponse.json({ media }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}

export async function listMedia(req: Request, practiceLogId: string) {
  const { user, token, error } = await authenticateToken(req);
  if (error) return error;
  const practiceLog = await practiceLogService.getPracticeLog(practiceLogId);
  if (!practiceLog) return NextResponse.json({ error: "practice_log_not_found" }, { status: 404 });
  // Authorization: user must be owner, or friend (if friends), or public
  if (practiceLog.userId === user.userId) {
    // owner can always view
    const media = await mediaService.listMedia(practiceLogId);
    return NextResponse.json({ media }, { status: 200 });
  }
  const targetUser = await userService.getUser(practiceLog.userId);
  if (!targetUser) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  if (targetUser.postVisibility === "public") {
    const media = await mediaService.listMedia(practiceLogId);
    return NextResponse.json({ media }, { status: 200 });
  }
  if (targetUser.postVisibility === "friends") {
    const isFriend = await friendsService.isFriend(user.userId, targetUser.userId);
    if (isFriend) {
      const media = await mediaService.listMedia(practiceLogId);
      return NextResponse.json({ media }, { status: 200 });
    }
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export async function deleteMedia(req: Request, mediaId: string) {
  const { user, token, error } = await authenticateToken(req);
  if (error) return error;
  const media = await mediaService.getMedia(mediaId);
  if (!media) return NextResponse.json({ error: "media_not_found" }, { status: 404 });
  const practiceLog = await practiceLogService.getPracticeLog(media.practiceLogId);
  if (!practiceLog) return NextResponse.json({ error: "practice_log_not_found" }, { status: 404 });
  if (practiceLog.userId !== user.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await mediaService.deleteMedia(mediaId);
  return new NextResponse(null, { status: 204 });
}
