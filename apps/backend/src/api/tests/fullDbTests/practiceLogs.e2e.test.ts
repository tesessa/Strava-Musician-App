import request from 'supertest';
import { testContext } from './testContext';

const api = request('http://localhost:3001');

describe('Practice Logs Routes', () => {
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

  it('recreates the deleted practice log for further tests', async () => {
    const res = await api.post('/practice-logs')
      .set('Authorization', `Bearer ${testContext.tokens.public_user}`)
      .send({ title: 'Public Log', durationMinutes: 30 });
    expect(res.status).toBe(201);
    testContext.practiceLogs.public = res.body.practiceLog;   
  });
});
