import { NextResponse } from "next/server";
import { validateCredentials, createTokenForUser, seedDevUser } from "../authStore";

seedDevUser(); // ensure demo user exists

export async function login(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }
    const user = validateCredentials(String(email), String(password));
    if (!user) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    }
    const { token, expiresAt } = createTokenForUser(user.id);
    return NextResponse.json({
      token,
      expiresAt,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

export async function register(req: Request) {
  // optional: implement register by delegating to authStore.seedDevUser or similar
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}