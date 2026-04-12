import { Friend } from "@strava-musician-app/shared";
import { FriendsDAO } from "../friendsDao";
import db from "./config/SupabaseKnexConnection";
import { SupabaseFriendRequestsDao } from "./SupabaseFriendRequestsDao";

export class SupabaseFriendsDao implements FriendsDAO {
  friendRequestsDao = new SupabaseFriendRequestsDao(); // replace with factories

  async listFriends(
    userId: string,
    options?: { lastFriendId?: string | null; pageSize?: number },
  ): Promise<Friend[]> {
    const pageSize = options?.pageSize ?? 20;

    let query = db("Friend")
      .select("*")
      .where("userId", userId)
      .orderBy("friendsSince", "desc")
      .orderBy("friendId", "desc")
      .limit(pageSize);

    if (options?.lastFriendId) {
      const lastFriend = await db("Friend")
        .select("*")
        .where({ userId, friendId: options.lastFriendId })
        .first();
      if (!lastFriend) {
        throw new Error("Invalid lastFriendId cursor");
      }
      query = query.andWhere(function () {
        this.where("friendsSince", "<", lastFriend.friendsSince).orWhere(
          function () {
            this.where("friendsSince", "=", lastFriend.friendsSince).andWhere(
              "friendId",
              "<",
              options.lastFriendId!,
            );
          },
        );
      });
    }
    return await query;
  }

  async sendOrAcceptFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<{
    userId: string;
    friendId: string;
    accepted?: boolean;
    requestId?: string;
    requested?: boolean;
  }> {
    const incomingRequest = await db("FriendRequest")
      .select("*")
      .where({
        senderId: friendId,
        receiverId: userId,
      })
      .first();
    if (incomingRequest) {
      // Accept the incoming request
      await db("FriendRequest")
        .where({ requestId: incomingRequest.requestId })
        .update({
          status: "accepted",
          respondedAt: new Date().toISOString(),
        });
      const now = new Date().toISOString();
      await db("Friend").insert([
        { userId, friendId, friendsSince: now },
        { userId: friendId, friendId: userId, friendsSince: now },
      ]);
      return { userId, friendId, accepted: true };
    }
    // Check if there's already an outgoing request
    const existingRequest = await db("FriendRequest")
      .select("*")
      .where({
        senderId: userId,
        receiverId: friendId,
      })
      .first();
    if (!existingRequest || existingRequest.status !== "pending") {
      // If no existing request or it's an old request, create a new friend request
      const request = await this.friendRequestsDao.createFriendRequest(
        userId,
        friendId,
      );

      return {
        userId,
        friendId,
        requestId: request.requestId,
        requested: true,
      };
    }
    return {
      userId,
      friendId,
      requestId: existingRequest.requestId,
      requested: true,
    };
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const deletedCount = await db("Friend")
      .where(function () {
        this.where({ userId: userId, friendId: friendId }).orWhere({
          userId: friendId,
          friendId: userId,
        });
      })
      .del();

    if (deletedCount === 0) {
      throw new Error("No friendship found to delete");
    }
  }

  async isFriend(userId: string, otherUserId: string): Promise<boolean> {
    const result = await db("Friend")
      .select("*")
      .where(function () {
        this.where({ userId: userId, friendId: otherUserId }).orWhere({
          userId: otherUserId,
          friendId: userId,
        });
      })
      .first();
    return !!result;
  }

  async clearAll(): Promise<void> {
    await db("Friend").del();
  }
}
