import { NextResponse } from "next/server";
import { FriendRequestsService } from "../services/friendRequestsService";
import { authenticateToken } from "../utils/authenticateToken";
import { createFriendRequestsDAO } from "../../db/dao/factories/friendRequestsDaoFactory";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";
import { batchPublicProfiles } from "../utils/userEnrichment";

const friendRequestsService = new FriendRequestsService(
  createFriendRequestsDAO(),
);
const userDao = createUserDAO();

export async function createFriendRequest(req: Request, receiverId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  if (auth.user.userId === receiverId) {
    return NextResponse.json({ error: "cannot_friend_self" }, { status: 400 });
  }
  const userDao = createUserDAO();
  const receiver = await userDao.findUserById(receiverId);
  if (!receiver) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }
  //fixme check for duplicate friend request or existing friendship
  // const existingRequest = await friendRequestsService.listOutgoing(auth.user.userId, { pageSize: 100 });
  // if (existingRequest.some(req => req.receiverId === receiverId)) {
  //   return NextResponse.json({ error: "request_already_sent" }, { status: 400 });
  // }
  // const existingIncoming = await friendRequestsService.listIncoming(auth.user.userId, { pageSize: 100 });
  // if (existingIncoming.some(req => req.senderId === receiverId)) {
  //   return NextResponse.json({ error: "request_already_received" }, { status: 400 });
  // }
  const friendRequest = await friendRequestsService.createFriendRequest(
    auth.user.userId,
    receiverId,
  );
  return NextResponse.json(friendRequest, { status: 201 });
}

export async function listIncoming(req: Request) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  let lastRequestId: string | null = null;
  let pageSize = 20;
  if (req.method === "GET") {
    const url = new URL(req.url);
    lastRequestId = url.searchParams.get("lastRequestId");
    const pageSizeParam = url.searchParams.get("pageSize");
    if (pageSizeParam && !isNaN(Number(pageSizeParam))) {
      pageSize = Number(pageSizeParam);
    }
  } else {
    try {
      const body = await req.json();
      lastRequestId = body.lastRequestId ?? null;
      pageSize = typeof body.pageSize === "number" ? body.pageSize : 20;
    } catch {
      // use defaults
    }
  }
  const requests = await friendRequestsService.listIncoming(auth.user.userId, {
    lastRequestId: lastRequestId ?? undefined,
    pageSize,
  });
  const map = await batchPublicProfiles(
    userDao,
    requests.map((r) => r.senderId),
  );
  const withSenders = requests.map((r) => {
    const sender = map.get(r.senderId);
    if (!sender) throw new Error(`Missing profile for sender ${r.senderId}`);
    return { ...r, sender };
  });
  return NextResponse.json(withSenders);
}

export async function listOutgoing(req: Request) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  let lastRequestId: string | null = null;
  let pageSize = 20;
  if (req.method === "GET") {
    const url = new URL(req.url);
    lastRequestId = url.searchParams.get("lastRequestId");
    const pageSizeParam = url.searchParams.get("pageSize");
    if (pageSizeParam && !isNaN(Number(pageSizeParam))) {
      pageSize = Number(pageSizeParam);
    }
  } else {
    try {
      const body = await req.json();
      lastRequestId = body.lastRequestId ?? null;
      pageSize = typeof body.pageSize === "number" ? body.pageSize : 20;
    } catch {
      // use defaults
    }
  }
  const requests = await friendRequestsService.listOutgoing(auth.user.userId, {
    lastRequestId: lastRequestId ?? undefined,
    pageSize,
  });
  const map = await batchPublicProfiles(
    userDao,
    requests.map((r) => r.receiverId),
  );
  const withReceivers = requests.map((r) => {
    const receiver = map.get(r.receiverId);
    if (!receiver) throw new Error(`Missing profile for receiver ${r.receiverId}`);
    return { ...r, receiver };
  });
  return NextResponse.json(withReceivers);
}

export async function acceptRequest(req: Request, requestId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const fr = await friendRequestsService.getFriendRequestById(requestId);
  if (!fr) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (fr.receiverId !== auth.user.userId)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await friendRequestsService.acceptRequest(requestId);
  return new NextResponse(null, { status: 204 });
}

export async function rejectRequest(req: Request, requestId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const fr = await friendRequestsService.getFriendRequestById(requestId);
  if (!fr) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (fr.receiverId !== auth.user.userId)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await friendRequestsService.rejectRequest(requestId);
  return new NextResponse(null, { status: 204 });
}

export async function cancelRequest(req: Request, requestId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const fr = await friendRequestsService.getFriendRequestById(requestId);
  if (!fr) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (fr.senderId !== auth.user.userId)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await friendRequestsService.cancelRequest(requestId);
  return new NextResponse(null, { status: 204 });
}
