import { NextResponse } from "next/server";
import { AuthService } from "../services/authServices";
import { createAuthDAO } from "../../db/dao/factories/authDaoFactory";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import { withAuth } from "../utils/withAuth"


const authDao = createAuthDAO();
const userDao = createUserDAO();
const authService = new AuthService(userDao, authDao);

export async function login(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};
    const result = await authService.login(email, password);
    if (result.error)
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

export const logout = withAuth(async (req: Request, token: string) => {
  const result = await authService.logout(token);
  if (result.error)
    return NextResponse.json({ error: result.error }, { status: result.status });
  return new NextResponse(null, { status: result.status });
});

export async function register(req: Request) {
  try {
    const body = await req.json();
    const result = await authService.register(body);
    if (result.error)
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}

export const me = withAuth(async (req: Request, token: string) => {
  const result = await authService.me(token);
  if (result.error)
    return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ user: result.user }, { status: result.status });
});
