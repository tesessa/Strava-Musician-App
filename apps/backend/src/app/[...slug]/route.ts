import { NextResponse } from "next/server";
import * as authHandlers from "../../lib/apiHandlers/auth";
// import { dumpState } from "../../../lib/authStore";

export async function GET(req: Request) {return dispatch(req, "GET"); }
export async function POST(req: Request) { return dispatch(req, "POST"); }
export async function PUT(req: Request) { return dispatch(req, "PUT");}
export async function DELETE(req: Request) { return dispatch(req, "DELETE");}

async function dispatch(req: Request, method: string) {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  const [resource, action] = parts; // e.g. ["auth", "login"]

  let res: Response | NextResponse | null = null;

  if (resource === "auth") {
    if (action === "login" && method === "POST") res = await authHandlers.login(req);
    else if (action === "logout" && method === "POST") res = await authHandlers.logout(req);
    else if (action === "register" && method === "POST") res = await authHandlers.register(req);
    else if (action === "me" && method === "GET") res = await authHandlers.me?.(req) || NextResponse.json({ error: "not_implemented" }, { status: 501 });
  }

  // fallback: 404
  if (!res) {
    res = NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // // DEBUG: print current in-memory state after handling the request
  // try {
  //   const snapshot = dumpState();
  //   // pretty print to server console
  //   console.log("[API STATE SNAPSHOT]", JSON.stringify(snapshot, null, 2));
  //   // optionally, write to a file for later inspection:
  //   // import fs from "fs";
  //   // fs.appendFileSync("./tmp/api-state.log", new Date().toISOString() + " " + JSON.stringify(snapshot) + "\n");
  // } catch (err) {
  //   console.error("failed to dump state", err);
  // }

  return res;
}