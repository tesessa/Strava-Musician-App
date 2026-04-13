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
    testContext.tokens.public_user = res.body.token;
    // create a practice log for media tests
    const res2 = await api.post('/practice-logs')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ title: 'Media Test Log', durationMinutes: 20 });
    expect([200, 201, 204]).toContain(res2.status);
    testContext.practiceLogs.public = res2.body.practiceLog || res2.body;
  });

  it('should not add media without token', async () => {
    if (!testContext.practiceLogs.public || !testContext.practiceLogs.public.practiceLogId) throw new Error('Missing practiceLogId');
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/media`)
      .send({ type: 'audio', url: 'http://example.com/audio.mp3' });
    expect(res.status).toBe(401);
  });

  it('adds media to a practice log', async () => {
    if (!testContext.practiceLogs.public || !testContext.practiceLogs.public.practiceLogId) throw new Error('Missing practiceLogId');
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/media`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ type: 'audio', url: 'http://example.com/audio.mp3' });
    if (![200, 201, 204].includes(res.status)) {
      console.log('Media creation error:', res.body);
    }
    expect([200, 201, 204]).toContain(res.status);
    testContext.media = { audio: res.body.media || res.body };
  });

  it('lists media for a practice log', async () => {
    if (!testContext.practiceLogs.public || !testContext.practiceLogs.public.practiceLogId) throw new Error('Missing practiceLogId');
    const res = await api.get(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/media`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200, 204]).toContain(res.status);
    const media = res.body.media || res.body;
    expect(Array.isArray(media)).toBe(true);
  });

  it('should not list media without access', async () => {
    if (!testContext.practiceLogs.public || !testContext.practiceLogs.public.practiceLogId) throw new Error('Missing practiceLogId');
    const res = await api.get(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/media`);
    expect(res.status).toBe(401);
  });

  it('deletes a media item', async () => {
    if (!testContext.media.audio || !testContext.media.audio.mediaId) throw new Error('Missing mediaId');
    const res = await api.delete(`/media/${testContext.media.audio.mediaId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200, 204, 404]).toContain(res.status);
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
    delete testContext.media.audio;
  });
});
