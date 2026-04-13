import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Friends & Friend Requests Routes', () => {
  beforeAll(async () => {
    // Register a public user for testing
    const res = await api.post('/auth/register').send({
        email: 'public_user@example.com',
        username: 'public_user',
        password: 'password123',
        visibility: 'public'
    });
    expect([201]).toContain(res.status);
    testContext.users.public_user = res.body.user;
    testContext.tokens.public_user = res.body.token;
    // Register a friends-only user for testing
    const res2 = await api.post('/auth/register').send({
        email: 'friends_user@example.com',
        username: 'friends_user',
        password: 'password123',
        visibility: 'friends'
    });
    expect([201]).toContain(res2.status);
    testContext.users.friends_user = res2.body.user;
    testContext.tokens.friends_user = res2.body.token;
    // Register a private user for testing
    const res3 = await api.post('/auth/register').send({
        email: 'private_user@example.com',
        username: 'private_user',
        password: 'password123',
        visibility: 'private'
    });
    expect([201]).toContain(res3.status);
    testContext.users.private_user = res3.body.user;
    testContext.tokens.private_user = res3.body.token;
  });

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
    expect([200, 204]).toContain(res.status);
  });

  it('lists friends', async () => {
    const res = await api.get('/friends')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200, 204]).toContain(res.status);
    const friends = Array.isArray(res.body) ? res.body : (res.body.friends || []);
    expect(Array.isArray(friends)).toBe(true);
    expect(friends.length).toBeGreaterThan(0);
  });

  it('removes a friend', async () => {
    const res = await api.delete(`/friends/${testContext.users.friends_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200, 204]).toContain(res.status);
  });

  it('should not list deleted friend', async () => {
    const res = await api.get('/friends')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200, 204]).toContain(res.status);
    const friends = Array.isArray(res.body) ? res.body : (res.body.friends || []);
    expect(Array.isArray(friends)).toBe(true);
    expect(friends.length).toBe(0);
    expect(friends.find((f: any) => f.userId === testContext.users.friends_user.userId)).toBeUndefined();
  });

  afterAll(async () => {
    // delete the test users
    const res1 = await api.delete(`/users/${testContext.users.public_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res1.status).toBe(204);
    const res2 = await api.delete(`/users/${testContext.users.friends_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect(res2.status).toBe(204);
    const res3 = await api.delete(`/users/${testContext.users.private_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.private_user}`);
    expect(res3.status).toBe(204);
    delete testContext.users.public_user;
    delete testContext.tokens.public_user;
    delete testContext.users.friends_user;
    delete testContext.tokens.friends_user;
    delete testContext.users.private_user;
    delete testContext.tokens.private_user;
    delete testContext.friends.requestId;
  });
});
