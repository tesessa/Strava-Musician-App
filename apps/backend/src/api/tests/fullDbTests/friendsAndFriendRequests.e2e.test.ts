import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Friends & Friend Requests Routes', () => {
  it('sends a friend request', async () => {
    const res = await api.post(`/friend-requests/${testContext.users.friends_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200,201]).toContain(res.status);
    testContext.friends = { requestId: res.body.requestId };
  });

  it('lists incoming friend requests', async () => {
    const res = await api.get('/friend-requests/incoming')
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect(res.status).toBe(200);
  });

  it('accepts a friend request', async () => {
    const res = await api.post(`/friend-requests/${testContext.friends.requestId}/accept`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect(res.status).toBe(200);
  });

  it('lists friends', async () => {
    const res = await api.get('/friends')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res.status).toBe(200);
  });

  it('removes a friend', async () => {
    const res = await api.delete(`/friends/${testContext.users.friends_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200]).toContain(res.status);
  });
  it("re adds friend for later tests", async () => {
    const res = await api.post(`/friend-requests/${testContext.users.friends_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200,201]).toContain(res.status);
    const acceptRes = await api.post(`/friend-requests/${res.body.requestId}/accept`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect(acceptRes.status).toBe(200);
    testContext.friends = { requestId: res.body.requestId };    
  });
});
