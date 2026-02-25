import { NextResponse } from "next/server";
import { createAuthDAO } from "../../db/dao/factories/authDaoFactory";

const authDao = createAuthDAO();

export async function authenticateToken(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  const user = await authDao.getUserByToken(token);
  if (!user) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { user, token };
}

export async function authenticateTokenToUserId(req: Request, userId: string) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  const user = await authDao.getUserByToken(token);
  if (!user || user.id !== userId) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { user, token };
}