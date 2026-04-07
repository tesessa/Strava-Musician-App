import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Media Routes', () => {
  it('should not add media without token', async () => {
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/media`)
      .send({ type: 'image', url: 'http://example.com/img.png' });
    expect(res.status).toBe(401);
  });

  it('adds media to a practice log', async () => {
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/media`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ type: 'image', url: 'http://example.com/img.png' });
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
});
