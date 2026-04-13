// Shared context for test data in each file
export const testContext: {
  users: { [key: string]: any },
  tokens: { [key: string]: string },
  practiceLogs: { [key: string]: any },
  friends: { [key: string]: any },
  media: { [key: string]: any },
  comments: { [key: string]: any },
  likes: { [key: string]: any },
  notifications: { [key: string]: any },
} = {
  users: {},
  tokens: {},
  practiceLogs: {},
  friends: {},
  media: {},
  comments: {},
  likes: {},
  notifications: {},
};