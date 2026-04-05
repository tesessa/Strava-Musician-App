import { FriendRequest } from "@strava-musician-app/shared";
import { FriendRequestsDAO } from "../friendRequestsDao";
import db from "./config/SupabaseKnexConnection";

export class SupabaseFriendRequestsDao implements FriendRequestsDAO {
  async createFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<FriendRequest> {
    const request = await db("FriendRequest")
      .insert({
        senderId: senderId,
        receiverId: receiverId,
        status: "pending",
        createdAt: new Date().toISOString(),
      })
      .returning("*");
    return request[0];
  }

  getFriendRequestById(requestId: string): Promise<FriendRequest | null> {
    return db("FriendRequest").select("*").where({ requestId }).first();
  }

  async listIncoming(
    userId: string,
    options?: { lastRequestId?: string; pageSize?: number },
  ): Promise<FriendRequest[]> {
    throw new Error("Method not implemented.");
  }

  async listOutgoing(
    userId: string,
    options?: { lastRequestId?: string; pageSize?: number },
  ): Promise<FriendRequest[]> {
    throw new Error("Method not implemented.");
  }

  async acceptRequest(requestId: string): Promise<void> {
    const request = await db<FriendRequest>("FriendRequest")
      .where({ requestId: requestId })
      .update({
        status: "accepted",
        respondedAt: new Date().toISOString(),
      })
      .returning("*")
      .first();
    if (!request) {
      throw new Error("Friend request not found");
    }
    const now = new Date().toISOString();
    await db("Friend").insert([
      {
        userId: request.senderId,
        friendId: request.receiverId,
        friendsSince: now,
      },
      {
        userId: request.receiverId,
        friendId: request.senderId,
        friendsSince: now,
      },
    ]);
  }

  async rejectRequest(requestId: string): Promise<void> {
    await db("FriendRequest").where({ id: requestId }).update({
      status: "rejected",
      respondedAt: new Date().toISOString(),
    });
  }

  async cancelRequest(requestId: string): Promise<void> {
    await db("FriendRequest").where({ id: requestId }).update({
      status: "cancelled",
      respondedAt: new Date().toISOString(),
    });
  }
}
