import { NextResponse } from "next/server";
import { createAuthDAO } from "../../db/dao/factories/authDaoFactory";

const authDao = createAuthDAO();

export function withAuth(
  handler: (req: Request, token: string, ...args: any[]) => Promise<Response>
) {
  return async (req: Request, ...args: any[]) => {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    console.log("Received token:", token);
    console.log();
    if (!token || !(await authDao.validateToken(token))) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return handler(req, token, ...args);
  };
}