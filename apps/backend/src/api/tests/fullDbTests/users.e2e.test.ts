import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('User Management Routes', () => {
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
  });

  it('gets a user profile by ID', async () => {
    const res = await api.get(`/users/${testContext.users.public_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200, 204]).toContain(res.status);
    // Support both { user: {...} } and flat user object
    const user = res.body.user || res.body;
    expect(user.email).toBe('public_user@example.com');
  });

  it('should not get user profile without token', async () => {
    const res = await api.get(`/users/${testContext.users.public_user.userId}`);
    expect(res.status).toBe(401);
  });

  it('updates a user profile', async () => {
    const res = await api.patch(`/users/${testContext.users.public_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ bio: 'Updated bio' });
    expect([200, 204]).toContain(res.status);
    const user = res.body.user || res.body;
    expect(user.bio).toBe('Updated bio');
  });

  it('should not update another user', async () => {
    const res = await api.patch(`/users/${testContext.users.public_user.userId}`)
      .send({ bio: 'Hacker' });
    expect([401,403]).toContain(res.status);
  });

  it('searches for users', async () => {
    const res = await api.get('/users/search?query=public_user')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([200, 204]).toContain(res.status);
    // Support both { users: [...] } and flat array
    const users = res.body.users || res.body;
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  it('should not search users without token', async () => {
    const res = await api.get('/users/search?query=public_user');
    expect(res.status).toBe(401);
  });

  afterAll(async () => {
    // delete the test user
    const res = await api.delete(`/users/${testContext.users.public_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    //must make sure user is deleted
    expect(res.status).toBe(204);
    delete testContext.users.public_user;
    delete testContext.tokens.public_user;
  });
});
