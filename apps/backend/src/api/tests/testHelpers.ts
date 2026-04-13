import request from "supertest";

export const API = "http://localhost:3001";

/**
 * Creates a friendship via the contract flow: POST /friend-requests/:receiverId, then accept.
 * One accepted request creates bidirectional friendship rows in the in-memory DAO.
 */
export async function establishFriendship(
  requesterToken: string,
  receiverToken: string,
  receiverId: string,
): Promise<void> {
  const createRes = await request(API)
    .post(`/friend-requests/${receiverId}`)
    .set("Authorization", `Bearer ${requesterToken}`);
  const requestId = createRes.body.requestId as string;
  await request(API)
    .post(`/friend-requests/${requestId}/accept`)
    .set("Authorization", `Bearer ${receiverToken}`);
}
