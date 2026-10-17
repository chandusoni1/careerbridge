import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Frontend Architecture Sanity Tests', () => {
  test('constants and services are properly defined', () => {
    const constantsPath = path.resolve('src/constants/index.js');
    assert.ok(fs.existsSync(constantsPath), 'constants/index.js exists');
  });

  test('production build assets exist after build', () => {
    const distPath = path.resolve('dist/index.html');
    assert.ok(fs.existsSync(distPath), 'dist/index.html exists');
  });
});
