import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Likes Routes', () => {
  it('should not like without token', async () => {
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/likes`);
    expect(res.status).toBe(401);
  });

  it('likes a practice log', async () => {
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/likes`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect([201]).toContain(res.status); // 400 if already liked
    testContext.likes = { likeId: res.body.id };
  });

  it('should not like a log twice', async () => {
    const res = await api.post(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/likes`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect([400]).toContain(res.status);
  });

  it('lists users who liked the log', async () => {
    const res = await api.get(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/likes`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.likes)).toBe(true);
    expect(res.body.likes.length).toBeGreaterThan(0);
  });

  it('unlikes a practice log', async () => {
    const res = await api.delete(`/practice-logs/${testContext.practiceLogs.public.practiceLogId}/likes`)
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect([204]).toContain(res.status);
  });
});
