import { NextResponse } from "next/server";
import { AuthService } from "../services/authServices";
import { createAuthDAO } from "../dao/factories/authDaoFactory";
import { createUserDAO } from "../dao/factories/userDaoFactory";

const authDao = createAuthDAO();
const userDao = createUserDAO();
const authService = new AuthService(userDao, authDao);

export async function login(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};
    const result = await authService.login(email, password);
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

export async function logout(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
    const result = await authService.logout(token);
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
    return new NextResponse(null, { status: result.status });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

export async function register(req: Request) {
  try {
    const body = await req.json();
    const result = await authService.register(body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}

export async function me(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
    const result = await authService.me(token);
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ user: result.user }, { status: result.status });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}