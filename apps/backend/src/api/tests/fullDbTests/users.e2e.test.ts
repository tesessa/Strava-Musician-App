import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('User Management Routes', () => {
  it('gets a user profile by ID', async () => {
    const res = await api.get(`/users/${testContext.users.public_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('public_user@example.com');
  });

  it('should not get user profile without token', async () => {
    const res = await api.get(`/users/${testContext.users.public_user.userId}`);
    expect(res.status).toBe(401);
  });

  it('updates a user profile', async () => {
    const res = await api.patch(`/users/${testContext.users.public_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ bio: 'Updated bio' });
    expect(res.status).toBe(200);
    expect(res.body.user.bio).toBe('Updated bio');
  });

  it('should not update another user', async () => {
    const res = await api.patch(`/users/${testContext.users.public_user.userId}`)
      .send({ bio: 'Hacker' });
    expect([401,403]).toContain(res.status);
  });

  it('searches for users', async () => {
    const res = await api.get('/users/search?query=public_user')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  it('should not search users without token', async () => {
    const res = await api.get('/users/search?query=public_user');
    expect(res.status).toBe(401);
  });
});
