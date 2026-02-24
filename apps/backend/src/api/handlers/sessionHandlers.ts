import { NextResponse } from "next/server";
import { SessionService } from "../services/sessionServices";
import { createSessionDAO } from "../../db/dao/factories/sessionDaoFactory";
import { withAuth } from "../utils/withAuth";

const sessionService = new SessionService(createSessionDAO());

export const createSession = withAuth(async (req: Request, token: string) => {
  try {
    const body = await req.json();

    // Validate required fields
    const { title, durationMinutes, visibility } = body;
    if (
      typeof title !== "string" ||
      typeof durationMinutes !== "number" ||
      !["public", "private", "friends"].includes(visibility)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Only pass allowed fields
    const sessionData = {
      title,
      durationMinutes,
      visibility,
      postText: body.postText,
      privateText: body.privateText,
      instrument: body.instrument,
      tempo: body.tempo,
      pieceTitle: body.pieceTitle,
      composer: body.composer,
    };

    const session = await sessionService.createSession(sessionData, token);
    return NextResponse.json({ session }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
});

export const getFeed = withAuth(async (req: Request, token: string) => {
  try {
    const url = new URL(req.url);
    const lastItemId = url.searchParams.get("lastItemId") ?? null;
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const feed = await sessionService.getFeed({ lastItem: lastItemId, pageSize }, token);
    return NextResponse.json({ sessions: feed }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
});

export const getSession = withAuth(async (req: Request, token: string, sessionId: string) => {
  try {
    const session = await sessionService.getSession(sessionId);
    if (!session) return NextResponse.json({ error: "session_not_found" }, { status: 404 });
    return NextResponse.json({ session }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
});

export const updateSession = withAuth(async (req: Request, token: string, sessionId: string) => {
  try {
    const body = await req.json();
    const session = await sessionService.updateSession(sessionId, body);
    if (!session) return NextResponse.json({ error: "session_not_found" }, { status: 404 });
    return NextResponse.json({ session }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
});

export const deleteSession = withAuth(async (req: Request, token: string, sessionId: string) => {
  try {
    const ok = await sessionService.deleteSession(sessionId);
    if (!ok) return NextResponse.json({ error: "session_not_found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
});