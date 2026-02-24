import { NextResponse } from "next/server";
import * as authHandlers from "../../api/handlers/authHandlers";
import * as sessionHandlers from "../../api/handlers/sessionHandlers";

export async function GET(req: Request) { return dispatch(req, "GET"); }
export async function POST(req: Request) { return dispatch(req, "POST"); }
export async function PUT(req: Request) { return dispatch(req, "PUT"); }
export async function PATCH(req: Request) { return dispatch(req, "PATCH"); }
export async function DELETE(req: Request) { return dispatch(req, "DELETE"); }

async function dispatch(req: Request, method: string) {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean);

  let res: Response | NextResponse | null = null;

  // /health
  if (parts[0] === "health" && method === "GET") {
    res = NextResponse.json({ status: "ok" });
  }

  // /auth/*
  if (parts[0] === "auth") {
    if (parts[1] === "login" && method === "POST") res = await authHandlers.login(req);
    else if (parts[1] === "logout" && method === "POST") res = await authHandlers.logout(req);
    else if (parts[1] === "register" && method === "POST") res = await authHandlers.register(req);
    else if (parts[1] === "me" && method === "GET") res = await authHandlers.me?.(req) || NextResponse.json({ error: "not_implemented" }, { status: 501 });
  }

  // /sessions, /sessions/feed, /sessions/:sessionId
  if (parts[0] === "sessions") {
    if (parts.length === 1 && method === "POST") res = await sessionHandlers.createSession(req);
    else if (parts[1] === "feed" && method === "GET") res = await sessionHandlers.getFeed(req);
    else if (parts.length === 2 && method === "GET") res = await sessionHandlers.getSession(req, parts[1]);
    else if (parts.length === 2 && method === "PATCH") res = await sessionHandlers.updateSession(req, parts[1]);
    else if (parts.length === 2 && method === "DELETE") res = await sessionHandlers.deleteSession(req, parts[1]);
  }

  // fallback: 404
  if (!res) {
    res = NextResponse.json({ error: "path_not_found" }, { status: 404 });
  }

  return res;
}