import { NextResponse } from "next/server";
import { UserService } from "../services/userServices";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import { authenticateToken, authenticateTokenToUserId } from "../utils/authenticateToken";

const userService = new UserService(createUserDAO());

export const getUser = async (req: Request, userId: string) => {
  const { user, token, error } = await authenticateTokenToUserId(req, userId);
  if (error) return error;

  try {
    const userData = await userService.getUser(userId);
    if (!userData) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    return NextResponse.json({ user: userData }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};

export const updateUser = async (req: Request, userId: string) => {
  const { user, token, error } = await authenticateTokenToUserId(req, userId);
  if (error) return error;

  try {
    const body = await req.json();
    const updatedUser = await userService.updateUser(userId, body);
    if (!updatedUser) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};

export const deleteUser = async (req: Request, userId: string) => {
  const { user, token, error } = await authenticateTokenToUserId(req, userId);
  if (error) return error;

  try {
    const ok = await userService.deleteUser(userId);
    if (!ok) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};

export const searchUsers = async (req: Request) => {
  const { user, token, error } = await authenticateToken(req);
  if (error) return error;

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query") ?? "";
    const users = await userService.searchUsers(query);
    return NextResponse.json({ users }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};