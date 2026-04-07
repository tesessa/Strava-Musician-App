import request from 'supertest';
import { testContext } from './testContext';
import { after } from 'node:test';

const api = request('http://localhost:3001');

describe('Notifications Routes', () => {
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
    testContext.tokens.public_user = res.body.authToken.token;
    //register a friends-only user for testing
    const res2 = await api.post('/auth/register').send({
        email: 'friends_user@example.com',
        username: 'friends_user',
        password: 'password123',
        visibility: 'friends'
    });
    expect([201]).toContain(res2.status);
    testContext.users.friends_user = res2.body.user;
    testContext.tokens.friends_user = res2.body.authToken.token;
    // create friend request and thus a notification for testing
    const res4 = await api.post(`/friend-requests/${testContext.users.public_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect([200,201]).toContain(res4.status);
  });

  it('lists notifications for the user', async () => {
    const res = await api.get('/notifications')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  it('should not list notifications without token', async () => {
    const res = await api.get('/notifications');
    expect(res.status).toBe(401);
  });

  it('marks a notification as read (if any)', async () => {
    const list = await api.get('/notifications')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.notifications)).toBe(true);
    expect(list.body.notifications.length).toBeGreaterThanOrEqual(0);
    const res = await api.patch(`/notifications/${list.body.notifications[0].notificationId}/read`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200]).toContain(res.status);
  });

  it('deletes a notification', async () => {
    const list = await api.get('/notifications')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.notifications)).toBe(true);
    expect(list.body.notifications.length).toBeGreaterThanOrEqual(0);
    const res = await api.delete(`/notifications/${list.body.notifications[0].notificationId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200]).toContain(res.status);
  });

  afterAll(async () => {
    // delete the test users
    const res1 = await api.delete(`/users/${testContext.users.public_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res1.status).toBe(204);
    const res2 = await api.delete(`/users/${testContext.users.friends_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect(res2.status).toBe(204);
    delete testContext.users.public_user;
    delete testContext.tokens.public_user;
    delete testContext.users.friends_user;
    delete testContext.tokens.friends_user; 
  });
});
