import { NextResponse } from "next/server";
import * as authHandlers from "../../api/handlers/authHandlers";

export async function GET(req: Request) {return dispatch(req, "GET"); }
export async function POST(req: Request) { return dispatch(req, "POST"); }
export async function PUT(req: Request) { return dispatch(req, "PUT");}
export async function DELETE(req: Request) { return dispatch(req, "DELETE");}

async function dispatch(req: Request, method: string) {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  const [resource, action] = parts; // e.g. ["auth", "login"]

  let res: Response | NextResponse | null = null;

  if (resource === "health" && method === "GET") {
    res = NextResponse.json({ status: "ok" });
  }
  
  if (resource === "auth") {
    if (action === "login" && method === "POST") res = await authHandlers.login(req);
    else if (action === "logout" && method === "POST") res = await authHandlers.logout(req);
    else if (action === "register" && method === "POST") res = await authHandlers.register(req);
    else if (action === "me" && method === "GET") res = await authHandlers.me?.(req) || NextResponse.json({ error: "not_implemented" }, { status: 501 });
  }

  // fallback: 404
  if (!res) {
    res = NextResponse.json({ error: "path_not_found" }, { status: 404 });
  }

  return res;
}