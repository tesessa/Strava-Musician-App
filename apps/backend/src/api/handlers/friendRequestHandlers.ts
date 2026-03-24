import { NextResponse } from "next/server";
import { createFriendRequestsService } from "../services/friendRequestsService";
import { authenticateToken } from "../utils/authenticateToken";
import { createFriendRequestsDAO } from "../../db/dao/factories/friendRequestsDaoFactory";
import { createUserDAO } from "../../db/dao/factories/userDaoFactory";

const friendRequestsService = createFriendRequestsService(createFriendRequestsDAO());

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
  const result = await friendRequestsService.createFriendRequest(auth.user.userId, receiverId);
  return NextResponse.json({ ...result }, { status: 201 });
}

export async function listIncoming(req: Request) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  let lastRequestId = null;
  let pageSize = 20;
  if (req.method === 'GET') {
    const url = new URL(req.url);
    lastRequestId = url.searchParams.get('lastRequestId');
    const pageSizeParam = url.searchParams.get('pageSize');
    if (pageSizeParam && !isNaN(Number(pageSizeParam))) {
      pageSize = Number(pageSizeParam);
    }
  } else {
    try {
      const body = await req.json();
      lastRequestId = body.lastRequestId ?? null;
      pageSize = typeof body.pageSize === 'number' ? body.pageSize : 20;
    } catch (e) {
      // If no body or invalid JSON, use defaults
    }
  }
  const requests = await friendRequestsService.listIncoming(auth.user.userId, { lastRequestId, pageSize });
  return NextResponse.json(requests);
}

export async function listOutgoing(req: Request) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  let lastRequestId = null;
  let pageSize = 20;
  if (req.method === 'GET') {
    const url = new URL(req.url);
    lastRequestId = url.searchParams.get('lastRequestId');
    const pageSizeParam = url.searchParams.get('pageSize');
    if (pageSizeParam && !isNaN(Number(pageSizeParam))) {
      pageSize = Number(pageSizeParam);
    }
  } else {
    try {
      const body = await req.json();
      lastRequestId = body.lastRequestId ?? null;
      pageSize = typeof body.pageSize === 'number' ? body.pageSize : 20;
    } catch (e) {
      // If no body or invalid JSON, use defaults
    }
  }
  const requests = await friendRequestsService.listOutgoing(auth.user.userId, { lastRequestId, pageSize });
  return NextResponse.json(requests);
}

export async function acceptRequest(req: Request, requestId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const request = await friendRequestsService.getFriendRequestById(requestId);
  if (!request) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (request.receiverId !== auth.user.userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await friendRequestsService.acceptRequest(requestId);
  return NextResponse.json({ success: true });
}

export async function rejectRequest(req: Request, requestId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const request = await friendRequestsService.getFriendRequestById(requestId);
  if (!request) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (request.receiverId !== auth.user.userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await friendRequestsService.rejectRequest(requestId);
  return NextResponse.json({ success: true });
}

export async function cancelRequest(req: Request, requestId: string) {
  const auth = await authenticateToken(req);
  if (auth.error) return auth.error;
  const request = await friendRequestsService.getFriendRequestById(requestId);
  if (!request) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (request.senderId !== auth.user.userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await friendRequestsService.cancelRequest(requestId);
  return NextResponse.json({ success: true });
}
