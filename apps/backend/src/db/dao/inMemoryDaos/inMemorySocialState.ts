// inMemorySocialState.ts
import type { Friend, FriendRequest } from "@strava-musician-app/shared";

export const inMemorySocialState: {
  friendships: Friend[];
  friendRequests: FriendRequest[];
} = {
  friendships: [],
  friendRequests: [],
};