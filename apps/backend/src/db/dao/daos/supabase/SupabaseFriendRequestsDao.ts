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
    const pageSize = options?.pageSize ?? 20;

    let query = db("FriendRequest")
      .select("*")
      .where("receiverId", userId)
      .where("status", "pending")
      .orderBy("createdAt", "desc")
      .orderBy("requestId", "desc")
      .limit(pageSize);

    if (options?.lastRequestId) {
      const lastRequest = await db("FriendRequest")
        .select("*")
        .where({ receiverId: userId, requestId: options.lastRequestId })
        .first();
      if (!lastRequest) {
        throw new Error("Invalid lastRequestId cursor");
      }
      query = query.andWhere(function () {
        this.where("createdAt", "<", lastRequest.createdAt).orWhere(
          function () {
            this.where("createdAt", "=", lastRequest.createdAt).andWhere(
              "requestId",
              "<",
              options.lastRequestId!,
            );
          },
        );
      });
    }
    return await query;
  }

  async listOutgoing(
    userId: string,
    options?: { lastRequestId?: string; pageSize?: number },
  ): Promise<FriendRequest[]> {
    const pageSize = options?.pageSize ?? 20;

    let query = db("FriendRequest")
      .select("*")
      .where("senderId", userId)
      .where("status", "pending")
      .orderBy("createdAt", "desc")
      .orderBy("requestId", "desc")
      .limit(pageSize);

    if (options?.lastRequestId) {
      const lastRequest = await db("FriendRequest")
        .select("*")
        .where({ senderId: userId, requestId: options.lastRequestId })
        .first();
      if (!lastRequest) {
        throw new Error("Invalid lastRequestId cursor");
      }
      query = query.andWhere(function () {
        this.where("createdAt", "<", lastRequest.createdAt).orWhere(
          function () {
            this.where("createdAt", "=", lastRequest.createdAt).andWhere(
              "requestId",
              "<",
              options.lastRequestId!,
            );
          },
        );
      });
    }
    return await query;
  }

  async acceptRequest(requestId: string): Promise<void> {
    const [request] = await db<FriendRequest>("FriendRequest")
      .where({ requestId: requestId })
      .update({
        status: "accepted",
        respondedAt: new Date().toISOString(),
      })
      .returning("*");
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
    await db("FriendRequest").where({ requestId }).update({
      status: "rejected",
      respondedAt: new Date().toISOString(),
    });
  }

  async cancelRequest(requestId: string): Promise<void> {
    await db("FriendRequest").where({ requestId }).update({
      status: "canceled",
      respondedAt: new Date().toISOString(),
    });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await db("FriendRequest").where("senderId", userId).orWhere("receiverId", userId).del();
  }

  async clearAll(): Promise<void> {
    await db("FriendRequest").del();
  }
}
