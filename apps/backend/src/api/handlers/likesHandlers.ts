import { NextResponse } from "next/server";
import { LikesService } from "../services/likesService";
import { authenticateToken } from "../utils/authenticateToken";

const likesService = new LikesService();

// POST /practice-logs/:practiceLogId/likes
export async function likePracticeLog(req: Request, { params }: { params: { practiceLogId: string } }) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  const { practiceLogId } = params;
  // Enforce access control: only users with access to the log can like
  const canAccess = await likesService.canUserAccessPracticeLog(user.userId, practiceLogId);
  if (!canAccess) {
    // Check if log exists for correct error code
    const ownerId = await likesService.getPracticeLogOwnerId(practiceLogId);
    if (!ownerId) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const result = await likesService.likePracticeLog(user.userId, practiceLogId);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE /practice-logs/:practiceLogId/likes
export async function unlikePracticeLog(req: Request, { params }: { params: { practiceLogId: string } }) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  const { practiceLogId } = params;
  const result = await likesService.unlikePracticeLog(user.userId, practiceLogId);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return new NextResponse(null, { status: 204 });
}

// GET /practice-logs/:practiceLogId/likes
export async function getPracticeLogLikes(req: Request, { params }: { params: { practiceLogId: string } }) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  const { practiceLogId } = params;
  const ownerId = await likesService.getPracticeLogOwnerId(practiceLogId);
  if (!ownerId) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const canAccess = await likesService.canUserAccessPracticeLog(user.userId, practiceLogId);
  if (!canAccess) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const likes = await likesService.getPracticeLogLikes(practiceLogId);
  return NextResponse.json({ likes }, { status: 200 });
}
