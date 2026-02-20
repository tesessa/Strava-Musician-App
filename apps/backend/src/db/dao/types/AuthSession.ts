export const SESSION_TTL_MINUTES = 60; // N minutes of inactivity
export type AuthSession = {
  authToken: string;
  userAlias: string;
  createdAt: Date;
  expiration: Date;
};
