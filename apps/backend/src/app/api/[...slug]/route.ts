import { NextResponse } from "next/server";
import * as authHandlers from "../../../lib/apiHandlers/auth";
// import other handler modules as they grow:
// import * as usersHandlers from "../../../lib/apiHandlers/users";

export async function GET(req: Request) {
  return dispatch(req, "GET");
}
export async function POST(req: Request) {
  return dispatch(req, "POST");
}
export async function PUT(req: Request) {
  return dispatch(req, "PUT");
}
export async function DELETE(req: Request) {
  return dispatch(req, "DELETE");
}

async function dispatch(req: Request, method: string) {
  const url = new URL(req.url);
  // url.pathname looks like /api/...slug...
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const [resource, action] = parts; // e.g. ["auth", "login"]

  // Simple routing table — add entries as handlers grow
  if (resource === "auth") {
    if (action === "login" && method === "POST") return authHandlers.login(req);
    if (action === "register" && method === "POST") return authHandlers.register(req);
  }

  // fallback: 404
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}