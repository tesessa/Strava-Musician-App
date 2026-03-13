import { NextResponse } from "next/server";
import { createFriendsService } from "../services/friendsService";
import { authenticateToken } from "../utils/authenticateToken";
import { createFriendsDAO } from "@/db/dao/factories/friendsDaoFactory";

const friendsService = createFriendsService(createFriendsDAO());

export async function listFriends(req: Request) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  let lastFriendId = null;
  let pageSize = 20;
  if (req.method === 'GET') {
    const url = new URL(req.url);
    lastFriendId = url.searchParams.get('lastFriendId');
    const pageSizeParam = url.searchParams.get('pageSize');
    if (pageSizeParam && !isNaN(Number(pageSizeParam))) {
      pageSize = Number(pageSizeParam);
    }
  } else {
    try {
      const body = await req.json();
      lastFriendId = body.lastFriendId ?? null;
      pageSize = typeof body.pageSize === 'number' ? body.pageSize : 20;
    } catch (e) {
      // If no body or invalid JSON, use defaults
    }
  }
  const friends = await friendsService.listFriends(auth.user.userId, { lastFriendId, pageSize });
  return NextResponse.json(friends);
}

export async function sendOrAcceptFriendRequest(req: Request, friendId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const result = await friendsService.sendOrAcceptFriendRequest(auth.user.userId, friendId);
  return NextResponse.json(result);
}

export async function removeFriend(req: Request, friendId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const isFriend = await friendsService.isFriend(auth.user.userId, friendId);
  if (!isFriend) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await friendsService.removeFriend(auth.user.userId, friendId);
  return NextResponse.json({ success: true });
}

export async function isFriend(req: Request, userId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const result = await friendsService.isFriend(auth.user.userId, userId);
  return NextResponse.json({ isFriend: result });
}
