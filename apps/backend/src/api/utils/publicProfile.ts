import type { PublicUserProfile, User } from "@strava-musician-app/shared";

export function toPublicUserProfile(user: User): PublicUserProfile {
  return {
    userId: user.userId,
    username: user.username,
    profilePhoto: user.profilePhoto,
    bio: user.bio,
    postVisibility: user.postVisibility,
    instruments: user.instruments,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
