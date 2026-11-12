const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, db, request, resetDb, registerUser } = require('./helpers');

let alice;
let bob;
let postId;
const auth = (u) => ({ Authorization: `Bearer ${u.token}` });

before(async () => {
  await resetDb();
  alice = await registerUser('alice');
  bob = await registerUser('bob');
});

after(() => db.sequelize.close());

test('health check', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
});

test('register validates input and rejects duplicates', async () => {
  let res = await request(app).post('/api/auth/register').send({ email: 'x@example.com' });
  assert.equal(res.status, 400);
  res = await request(app)
    .post('/api/auth/register')
    .send({ username: 'alice2', email: 'alice@example.com', password: 'password123' });
  assert.equal(res.status, 409);
});

test('login succeeds with valid credentials and fails otherwise', async () => {
  let res = await request(app).post('/api/auth/login').send({ email: 'alice@example.com', password: 'password123' });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  res = await request(app).post('/api/auth/login').send({ email: 'alice@example.com', password: 'wrong' });
  assert.equal(res.status, 401);
});

test('protected routes require a token', async () => {
  const res = await request(app).get('/api/posts');
  assert.equal(res.status, 401);
});

test('posts: create, list, get', async () => {
  let res = await request(app).post('/api/posts').set(auth(alice)).field('content', '');
  assert.equal(res.status, 400);

  res = await request(app).post('/api/posts').set(auth(alice)).field('content', 'Hello world');
  assert.equal(res.status, 201);
  postId = res.body.id;

  res = await request(app).get('/api/posts?page=1&limit=10').set(auth(bob));
  assert.equal(res.status, 200);
  assert.equal(res.body.totalPosts, 1);
  assert.equal(res.body.Posts[0].content, 'Hello world');

  res = await request(app).get(`/api/posts/${postId}`).set(auth(bob));
  assert.equal(res.status, 200);
  res = await request(app).get('/api/posts/9999').set(auth(bob));
  assert.equal(res.status, 404);
});

test('likes toggle and report status', async () => {
  let res = await request(app).post(`/api/likes/${postId}/like`).set(auth(bob));
  assert.deepEqual(res.body, { liked: true, likeCount: 1 });
  res = await request(app).get(`/api/likes/${postId}/status`).set(auth(bob));
  assert.equal(res.body.liked, true);
  res = await request(app).post(`/api/likes/${postId}/like`).set(auth(bob));
  assert.deepEqual(res.body, { liked: false, likeCount: 0 });
});

test('comments', async () => {
  let res = await request(app).post(`/api/comments/${postId}`).set(auth(bob)).send({ content: 'Nice!' });
  assert.equal(res.status, 201);
  res = await request(app).post(`/api/comments/${postId}`).set(auth(bob)).send({ content: ' ' });
  assert.equal(res.status, 400);
});

test('friend requests: send, list, accept, unfriend', async () => {
  let res = await request(app).post('/api/Addfriend/send').set(auth(alice)).send({ receiverId: alice.id });
  assert.equal(res.status, 400);

  res = await request(app).post('/api/Addfriend/send').set(auth(alice)).send({ receiverId: String(bob.id) });
  assert.equal(res.status, 201);

  res = await request(app).get('/api/Addfriend/received').set(auth(bob));
  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].Sender.username, 'alice');

  res = await request(app).get('/api/users/search?name=ali').set(auth(bob));
  assert.equal(res.body[0].status, 'request_received');

  res = await request(app).post('/api/Addfriend/accept').set(auth(bob)).send({ senderId: alice.id });
  assert.equal(res.status, 200);

  res = await request(app).get('/api/Addfriend/friends').set(auth(alice));
  assert.deepEqual(res.body.map((f) => f.username), ['bob']);

  res = await request(app).post('/api/Addfriend/unfriend').set(auth(alice)).send({ friendId: bob.id });
  assert.equal(res.status, 200);
  res = await request(app).post('/api/Addfriend/unfriend').set(auth(alice)).send({ friendId: bob.id });
  assert.equal(res.status, 404);
});

test('friend requests: sender can withdraw', async () => {
  await request(app).post('/api/Addfriend/send').set(auth(bob)).send({ receiverId: alice.id });
  const res = await request(app).post('/api/Addfriend/cancel').set(auth(bob)).send({ receiverId: alice.id });
  assert.equal(res.status, 200);
});

test('messages: send and fetch history', async () => {
  let res = await request(app).post('/api/message').set(auth(alice)).send({ receiverId: bob.id, message: 'Hi Bob' });
  assert.equal(res.status, 201);
  await request(app).post('/api/message').set(auth(bob)).send({ receiverId: alice.id, message: 'Hi Alice' });

  res = await request(app).get(`/api/message/${alice.id}`).set(auth(bob));
  assert.deepEqual(res.body.map((m) => m.message), ['Hi Bob', 'Hi Alice']);

  res = await request(app).post('/api/message').set(auth(alice)).send({ receiverId: bob.id });
  assert.equal(res.status, 400);
});

test('profiles', async () => {
  let res = await request(app).get('/api/users/profile').set(auth(alice));
  assert.equal(res.body.username, 'alice');
  assert.equal(res.body.password, undefined);

  res = await request(app).get(`/api/users/Post?userId=${alice.id}`).set(auth(bob));
  assert.equal(res.body.username, 'alice');
  assert.equal(res.body.Posts.length, 1);

  res = await request(app).get('/api/profile/me').set(auth(alice));
  assert.equal(res.body.email, 'alice@example.com');
});

test('unknown routes return 404 JSON', async () => {
  const res = await request(app).get('/api/nope');
  assert.equal(res.status, 404);
  assert.ok(res.body.error);
});
