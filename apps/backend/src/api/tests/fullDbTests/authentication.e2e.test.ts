import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Authentication Routes', () => {
  it('should not register with missing fields', async () => {
    const res = await api.post('/auth/register').send({ email: 'bob@example.com' });
    expect(res.status).toBe(400);
  });

  it('registers a public user', async () => {
    const res = await api.post('/auth/register').send({
      email: 'public_user@example.com',
      username: 'public_user',
      password: 'password123',
      visibility: 'public'
    });
    expect([201]).toContain(res.status);
    testContext.users.public_user = res.body.user;
  });

  it('should not login with wrong password', async () => {
    const res = await api.post('/auth/login').send({
      email: 'public_user@example.com',
      password: 'wrongpassword'
    });
    expect(res.status).toBe(401);
  });

  it('logs in a user', async () => {
    const res = await api.post('/auth/login').send({
      email: 'public_user@example.com',
      password: 'password123'
    });
    expect(res.status).toBe(200);
    testContext.tokens.public_user = res.body.token;
  });

  it('returns authenticated user profile', async () => {
    const res = await api.get('/auth/me').set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('public_user@example.com');
  });

  it('should not return profile without token', async () => {
    const res = await api.get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('logs out a user', async () => {
    const res = await api.post('/auth/logout').set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    expect([204]).toContain(res.status);
    delete testContext.tokens.public_user;
  });

  afterAll(async () => {
    // delete the test user
    //must be logged in to delete account, so we log in again if needed
    const loginRes = await api.post('/auth/login').send({
        email: 'public_user@example.com',
        password: 'password123'
    });
    testContext.tokens.public_user = loginRes.body.token;

    const res = await api.delete(`/users/${testContext.users.public_user.userId}`)
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`);
    //must make sure user is deleted, but ignore if already deleted
    expect(res.status).toBe(204);
    delete testContext.users.public_user;
    delete testContext.tokens.public_user;
  });

});
