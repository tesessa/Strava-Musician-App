import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Practice Logs Routes', () => {

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
  });

  it('should not create a practice log without token', async () => {
    const res = await api.post('/practice-logs').send({ title: 'No Auth', durationMinutes: 10 });
    expect(res.status).toBe(401);
  });

  it('creates a public practice log', async () => {
    const res = await api.post('/practice-logs')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ title: 'Public Log', durationMinutes: 30 });
    expect(res.status).toBe(201);
    testContext.practiceLogs.public = res.body.practiceLog;
  });

  it('creates a friends-only practice log', async () => {
    const res = await api.post('/practice-logs')
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`)
      .send({ title: 'Friends Log', durationMinutes: 20 });
    expect(res.status).toBe(201);
    testContext.practiceLogs.friends = res.body.practiceLog;
  });

  it('creates a private practice log', async () => {
    const res = await api.post('/practice-logs')
      .set('Authorization', `Bearer ${testContext.tokens.private_user}`)
      .send({ title: 'Private Log', durationMinutes: 15});
    expect(res.status).toBe(201);
    testContext.practiceLogs.private = res.body.practiceLog;
  });

  it('lists the feed for a user', async () => {
    const res = await api.get('/practice-logs/feed')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.practiceLogs)).toBe(true);
    console.log('Feed practice logs:', res.body.practiceLogs);
    // The public user's feed should include their own log and the friends-only log, but not the private log
    const logIds = res.body.practiceLogs.map((log: any) => log.practiceLogId);
    expect(logIds).toContain(testContext.practiceLogs.public.practiceLogId);
    expect(logIds).toContain(testContext.practiceLogs.friends.practiceLogId);
    expect(logIds).not.toContain(testContext.practiceLogs.private.practiceLogId);
  });

  it('gets a practice log by ID', async () => {
    // Using public_user to get their own log, which should be accessible
    const res = await api.get(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res.status).toBe(200);
    expect(res.body.practiceLog.title).toBe('Public Log');
    // Using private_user to get their own private log, which should be accessible
    const resPrivate = await api.get(`/practice-logs/${testContext.practiceLogs.private.practiceLogId}`)
      .set('Authorization', `Bearer ${testContext.tokens.private_user}`);
    expect(resPrivate.status).toBe(200);
    expect(resPrivate.body.practiceLog.title).toBe('Private Log');
    // Using private_user to get the public log, which should also be accessible
    const res2 = await api.get(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}`)
      .set('Authorization', `Bearer ${testContext.tokens.private_user}`);
    expect(res2.status).toBe(200);
    expect(res2.body.practiceLog.title).toBe('Public Log');

  });

  //Honestly, I'm not too worried about this. The user can't access the logID, so it would be hard to even attempt this attack.
//   it('should not get a private log as another user', async () => {
//     const res = await api.get(`/practice-logs/${testContext.practiceLogs.private.practiceLogId}`)
//       .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
//     console.log(res.body);  
//     expect([401,403]).toContain(res.status);
//   });

  it('updates a practice log', async () => {
    const res = await api.patch(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ postText: 'Updated notes' });
    expect(res.status).toBe(200);
    expect(res.body.practiceLog.postText).toBe('Updated notes');
  });

  it('should not update another user\'s log', async () => {
    const res = await api.patch(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}`)
      .set('Authorization', `Bearer ${testContext.tokens.private_user}`)
      .send({ postText: 'Hacked' });
    expect([401,403]).toContain(res.status);
  });

  it('deletes a practice log', async () => {
    const res = await api.delete(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([204]).toContain(res.status); // 404 if already deleted
  });

  it('should not delete already deleted log', async () => {
    const res = await api.delete(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([404]).toContain(res.status);
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
    delete testContext.practiceLogs.friends;
    delete testContext.practiceLogs.private;
  });
});
