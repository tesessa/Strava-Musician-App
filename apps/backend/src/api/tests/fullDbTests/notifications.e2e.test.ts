import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Notifications Routes', () => {
  it('lists notifications for the user', async () => {
    const res = await api.get('/notifications')
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  it('should not list notifications without token', async () => {
    const res = await api.get('/notifications');
    expect(res.status).toBe(401);
  });

  it('marks a notification as read (if any)', async () => {
    const list = await api.get('/notifications')
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    if (list.body.length > 0) {
      const res = await api.patch(`/notifications/${list.body[0].id}/read`)
        .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
      expect([200,404]).toContain(res.status);
    }
  });

  it('deletes a notification (if any)', async () => {
    const list = await api.get('/notifications')
      .set('Authorization', `Bearer ${testContext.tokens.friends_user}`);
    if (list.body.length > 0) {
      const res = await api.delete(`/notifications/${list.body[0].id}`)
        .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
      expect([204,404]).toContain(res.status);
    }
  });
});
