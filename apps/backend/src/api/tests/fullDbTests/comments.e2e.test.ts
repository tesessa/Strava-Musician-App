import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Comments Routes', () => {
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
  });
});
