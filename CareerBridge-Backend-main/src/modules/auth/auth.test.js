const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { validateSignup, validateLogin } = require('./auth.validation');

describe('Auth Validation Unit Tests', () => {
  test('validateSignup should reject invalid email', () => {
    const req = {
      body: {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
        role: 'student',
      },
    };
    const result = validateSignup(req);
    assert.equal(result.isValid, false);
    assert.match(result.error, /valid email/i);
  });

  test('validateSignup should reject short passwords', () => {
    const req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
        role: 'student',
      },
    };
    const result = validateSignup(req);
    assert.equal(result.isValid, false);
    assert.match(result.error, /at least 6 characters/i);
  });

  test('validateSignup should accept valid input', () => {
    const req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
      },
    };
    const result = validateSignup(req);
    assert.equal(result.isValid, true);
  });

  test('validateLogin should reject missing credentials', () => {
    const req = { body: {} };
    const result = validateLogin(req);
    assert.equal(result.isValid, false);
  });

  test('validateLogin should accept valid credentials', () => {
    const req = {
      body: {
        email: 'john@example.com',
        password: 'secretPassword',
      },
    };
    const result = validateLogin(req);
    assert.equal(result.isValid, true);
  });
});
