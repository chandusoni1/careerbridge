const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');
const http = require('http');

describe('App Integration & Route Tests', () => {
  let server;
  let baseUrl;

  test('setup server for testing', async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  test('GET / should return backend is working', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.message, 'backend is working');
  });

  test('GET /health should return healthy status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.ok(data.uptime >= 0);
  });

  test('GET /unknown-route should return 404', async () => {
    const res = await fetch(`${baseUrl}/unknown-nonexistent-endpoint`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Route not found/);
  });

  test('teardown server', async () => {
    await new Promise((resolve) => server.close(resolve));
  });
});
