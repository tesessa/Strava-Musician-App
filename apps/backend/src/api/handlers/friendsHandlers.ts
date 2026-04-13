import { NextResponse } from "next/server";
import { FriendsService } from "../services/friendsService";
import { authenticateToken } from "../utils/authenticateToken";
import { createFriendsDAO } from "@/db/dao/factories/friendsDaoFactory";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import { batchPublicProfiles } from "../utils/userEnrichment";

const friendsService = new FriendsService(createFriendsDAO());
const userDao = createUserDAO();

export async function listFriends(req: Request) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  let lastFriendId: string | null = null;
  let pageSize = 20;
  if (req.method === "GET") {
    const url = new URL(req.url);
    lastFriendId = url.searchParams.get("lastFriendId");
    const pageSizeParam = url.searchParams.get("pageSize");
    if (pageSizeParam && !isNaN(Number(pageSizeParam))) {
      pageSize = Number(pageSizeParam);
    }
  } else {
    try {
      const body = await req.json();
      lastFriendId = body.lastFriendId ?? null;
      pageSize = typeof body.pageSize === "number" ? body.pageSize : 20;
    } catch {
      // use defaults
    }
  }
  const friends = await friendsService.listFriends(auth.user.userId, { lastFriendId, pageSize });
  const map = await batchPublicProfiles(
    userDao,
    friends.map((f) => f.friendId),
  );
  const withProfiles = friends.map((f) => {
    const friend = map.get(f.friendId);
    if (!friend) {
      throw new Error(`Missing profile for friendId ${f.friendId}`);
    }
    return { ...f, friend };
  });
  return NextResponse.json(withProfiles);
}

export async function removeFriend(req: Request, friendId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const isFriend = await friendsService.isFriend(auth.user.userId, friendId);
  if (!isFriend) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await friendsService.removeFriend(auth.user.userId, friendId);
  return new NextResponse(null, { status: 204 });
}

export async function isFriend(req: Request, userId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const result = await friendsService.isFriend(auth.user.userId, userId);
  return NextResponse.json({ isFriend: result });
}
