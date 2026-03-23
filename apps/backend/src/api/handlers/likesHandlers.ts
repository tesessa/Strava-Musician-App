import { NextResponse } from "next/server";
import { getLikesService } from "../services/likesService";
import { authenticateToken } from "../utils/authenticateToken";

// POST /practice-logs/:practiceLogId/likes
export async function likePracticeLog(req: Request, { params }: { params: { practiceLogId: string } }) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  const { practiceLogId } = params;
  // Enforce access control: only users with access to the log can like
  const canAccess = await getLikesService().canUserAccessPracticeLog(user.userId, practiceLogId);
  if (!canAccess) {
    // Check if log exists for correct error code
    const ownerId = await getLikesService().getPracticeLogOwnerId(practiceLogId);
    if (!ownerId) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const result = await getLikesService().likePracticeLog(user.userId, practiceLogId);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE /practice-logs/:practiceLogId/likes
export async function unlikePracticeLog(req: Request, { params }: { params: { practiceLogId: string } }) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  const { practiceLogId } = params;
  const result = await getLikesService().unlikePracticeLog(user.userId, practiceLogId);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return new NextResponse(null, { status: 204 });
}

// GET /practice-logs/:practiceLogId/likes
export async function getPracticeLogLikes(req: Request, { params }: { params: { practiceLogId: string } }) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  const { practiceLogId } = params;
  const ownerId = await getLikesService().getPracticeLogOwnerId(practiceLogId);
  if (!ownerId) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const canAccess = await getLikesService().canUserAccessPracticeLog(user.userId, practiceLogId);
  if (!canAccess) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const likes = await getLikesService().getPracticeLogLikes(practiceLogId);
  return NextResponse.json({ likes }, { status: 200 });
}
