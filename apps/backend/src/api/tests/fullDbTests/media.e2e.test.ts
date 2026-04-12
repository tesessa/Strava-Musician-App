import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Media Routes', () => {
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
    // create a practice log for media tests
    const res2 = await api.post('/practice-logs')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ title: 'Media Test Log', durationMinutes: 20 });
    expect(res2.status).toBe(201);
    testContext.practiceLogs.public = res2.body.practiceLog;
  });

  it('should not add media without token', async () => {
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/media`)
      .send({ type: 'image', url: 'http://example.com/img.png' });
    expect(res.status).toBe(401);
  });

  it('adds media to a practice log', async () => {
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/media`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ type: 'image', url: 'http://example.com/img.png' });
    if (res.status !== 201) {
      console.log('Media creation error:', res.body);
    }
    expect(res.status).toBe(201);
    testContext.media = { image: res.body.media };
  });

  it('lists media for a practice log', async () => {
    const res = await api.get(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/media`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.media)).toBe(true);
  });

  it('should not list media without access', async () => {
    const res = await api.get(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/media`);
    expect(res.status).toBe(401);
  });

  it('deletes a media item', async () => {
    const res = await api.delete(`/media/${testContext.media.image.mediaId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([204,404]).toContain(res.status);
  });

  afterAll(async () => {
    // delete the test user
    const res = await api.delete(`/users/${testContext.users.public_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    //must make sure user is deleted
    expect(res.status).toBe(204);
    delete testContext.users.public_user;
    delete testContext.tokens.public_user;
    delete testContext.practiceLogs.public;
    delete testContext.media.image;
  });
});
