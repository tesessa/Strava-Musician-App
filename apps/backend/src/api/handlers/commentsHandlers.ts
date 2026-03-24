import { NextRequest, NextResponse } from "next/server";
import { getCommentsService } from "../services/commentsService";
import { authenticateToken } from "../utils/authenticateToken";

// POST /practice-logs/:practiceLogId/comments
export async function createComment(req: Request, practiceLogId: string) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  // Only users with access to the log can comment
  const canAccess = await getCommentsService().canUserAccessPracticeLog(user.userId, practiceLogId);
  if (!canAccess) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.text || typeof body.text !== "string") {
    return NextResponse.json({ error: "text_required" }, { status: 400 });
  }
  const result = await getCommentsService().createComment(user.userId, practiceLogId, body.text);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ comment: result.comment }, { status: 201 });
}

// GET /practice-logs/:practiceLogId/comments
export async function listComments(req: Request, practiceLogId: string) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  // Only users with access to the log can view comments
  const canAccess = await getCommentsService().canUserAccessPracticeLog(user.userId, practiceLogId);
  if (!canAccess) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const comments = await getCommentsService().listComments(practiceLogId);
  return NextResponse.json({ comments }, { status: 200 });
}

// DELETE /comments/:commentId
export async function deleteComment(req: Request, commentId: string) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  // Only the poster can delete
  const result = await getCommentsService().deleteComment(user.userId, commentId);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return new NextResponse(null, { status: 204 });
}
