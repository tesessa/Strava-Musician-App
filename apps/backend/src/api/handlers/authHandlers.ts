import { NextResponse } from "next/server";
import { AuthService, type AuthFailure } from "../services/authServices";
import { createAuthDAO } from "../../db/dao/factories/authDaoFactory";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import { authenticateToken } from "../utils/authenticateToken";

const authDao = createAuthDAO();
const userDao = createUserDAO();
const authService = new AuthService(userDao, authDao);

function isAuthFailure(r: unknown): r is AuthFailure {
  return (
    typeof r === "object" &&
    r !== null &&
    "error" in r &&
    "status" in r &&
    typeof (r as { error: unknown }).error === "string" &&
    typeof (r as { status: unknown }).status === "number"
  );
}

export async function login(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};
    const result = await authService.login(email, password);
    if (isAuthFailure(result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(
      { token: result.token, user: result.user },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}

export async function logout(req: Request) {
  const { token, error } = await authenticateToken(req);
  if (error) return error;

  const result = await authService.logout(token);
  if (isAuthFailure(result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return new NextResponse(null, { status: 204 });
}

export async function register(req: Request) {
  try {
    const body = await req.json();
    const result = await authService.register(body);
    if (isAuthFailure(result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(
      { token: result.token, user: result.user },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}

export async function me(req: Request) {
  const { token, error } = await authenticateToken(req);
  if (error) return error;

  const result = await authService.me(token);
  if (isAuthFailure(result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.user, { status: 200 });
}
