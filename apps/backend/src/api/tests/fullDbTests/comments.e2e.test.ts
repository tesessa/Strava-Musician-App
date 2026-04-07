import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Comments Routes', () => {
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
    // Register a friends-only user for testing
    const res2 = await api.post('/auth/register').send({
        email: 'friends_user@example.com',
        username: 'friends_user',
        password: 'password123',
        visibility: 'friends'
    });
    expect([201]).toContain(res2.status);
    testContext.users.friends_user = res2.body.user;
    testContext.tokens.friends_user = res2.body.authToken.token;
    // Register a private user for testing
    const res3 = await api.post('/auth/register').send({
        email: 'private_user@example.com',
        username: 'private_user',
        password: 'password123',
        visibility: 'private'
    });
    expect([201]).toContain(res3.status);
    testContext.users.private_user = res3.body.user;
    testContext.tokens.private_user = res3.body.authToken.token;
    // create friendship between public and friends-only user
    const res4 = await api.post(`/friend-requests/${testContext.users.friends_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200,201]).toContain(res4.status);
    const res5 = await api.post(`/friend-requests/${res4.body.requestId}/accept`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect(res5.status).toBe(200);
    // create a practice log for comments tests
    const res6 = await api.post('/practice-logs')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ title: 'Comments Test Log', durationMinutes: 15 });
    expect(res6.status).toBe(201);
    testContext.practiceLogs.public = res6.body.practiceLog;
  });

  it('should not comment without token', async () => {
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/comments`)
      .send({ text: 'No Auth' });
    expect(res.status).toBe(401);
  });

  it('adds a comment to a practice log', async () => {
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/comments`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`)
      .send({ text: 'Nice work!' });
    expect(res.status).toBe(201);
    testContext.comments = { commentId: res.body.commentId };
  });

  it('lists comments for a practice log', async () => {
    const res = await api.get(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/comments`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.comments)).toBe(true);
    expect(res.body.comments.length).toBeGreaterThan(0);
  });

  it('should not list comments without access', async () => {
    const res = await api.get(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/comments`);
    expect(res.status).toBe(401);
  });

  it('deletes a comment', async () => {
    const res = await api.delete(`/comments/${testContext.comments.commentId}`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect([204,404]).toContain(res.status);
    delete testContext.comments.commentId;
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
    delete testContext.practiceLogs.public; 
  });
});
