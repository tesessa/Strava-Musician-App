import { NextResponse } from "next/server";
import type { User } from "@strava-musician-app/shared";
import {
  validateCredentials,
  createTokenForUser,
  revokeToken,
  getUserByToken,
  createUser,
  findUserByEmail,
} from "../authStore";

export async function login(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }

    const user = await validateCredentials(String(email), String(password));
    if (!user) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    }

    const { token, expiresAt } = await createTokenForUser(user.id);

    // return token and full user profile
    return NextResponse.json({
      token,
      expiresAt,
      user: user as User,
    });
  } catch (err) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

export async function logout(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
    }

    const ok = await revokeToken(token);
    if (!ok) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

export async function register(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      username,
      password,
      displayName,
      imageUrl,
      bio,
      instruments,
    } = body ?? {};

    if (!email || !username || !password) {
      return NextResponse.json({ error: "email, username and password required" }, { status: 400 });
    }

    const existing = await findUserByEmail(String(email));
    if (existing) {
      return NextResponse.json({ error: "email_already_exists" }, { status: 409 });
    }

    const user = await createUser({
      username: String(username),
      email: String(email),
      displayName: displayName ?? String(username),
      password: String(password),
      imageUrl: imageUrl ?? undefined,
      bio: bio ?? undefined,
      instruments: instruments ?? undefined,
    });

    const { token, expiresAt } = await createTokenForUser(user.id);

    return NextResponse.json({ token, expiresAt, user: user as User }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}

export async function me(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
    }

    const user = await getUserByToken(token);
    if (!user) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    return NextResponse.json({ user: user as User }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}