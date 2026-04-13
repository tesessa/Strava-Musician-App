import { NextResponse } from "next/server";
import { UserService } from "../services/userServices";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import { authenticateToken, authenticateTokenToUserId } from "../utils/authenticateToken";
import { createPracticeLogDAO } from "@/db/dao/factories/practiceLogDaoFactory";
import { createMediaDAO } from "@/db/dao/factories/mediaDaoFactory";
import { createCommentsDAO } from "@/db/dao/factories/commentsDaoFactory";
import { createLikesDAO } from "@/db/dao/factories/likesDaoFactory";
import { createFriendsDAO } from "@/db/dao/factories/friendsDaoFactory";
import { createFriendRequestsDAO } from "@/db/dao/factories/friendRequestsDaoFactory";
import { createNotificationsDao } from "@/db/dao/factories/notificationsDaoFactory";
import { createChallengesDao } from "@/db/dao/factories/challengesDaoFactory";

const userService = new UserService(
  createUserDAO(),
  createPracticeLogDAO(),
  createMediaDAO(),
  createCommentsDAO(),
  createLikesDAO(),
  createFriendsDAO(),
  createFriendRequestsDAO(),
  createNotificationsDao(),
  createChallengesDao()
);

export const getUser = async (req: Request, userId: string) => {
  // const { error } = await authenticateTokenToUserId(req, userId);
  const { error } = await authenticateToken(req);
  if (error) return error;

  try {
    const userData = await userService.getUser(userId);
    if (!userData) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    return NextResponse.json(userData, { status: 200 });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};

export const updateUser = async (req: Request, userId: string) => {
  const { error } = await authenticateTokenToUserId(req, userId);
  if (error) return error;

  try {
    const body = await req.json();
    const updatedUser = await userService.updateUser(userId, body);
    if (!updatedUser) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};

export const deleteUser = async (req: Request, userId: string) => {
  const { error } = await authenticateTokenToUserId(req, userId);
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
  const { error } = await authenticateToken(req);
  if (error) return error;

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query") ?? "";
    const users = await userService.searchUsers(query);
    return NextResponse.json(users, { status: 200 });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
};
