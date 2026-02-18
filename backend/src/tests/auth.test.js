import test from 'node:test';
import assert from 'node:assert/strict';
import { signAccessToken, verifyAccessToken } from '../utils/jwt.js';

test('jwt sign/verify cycle', () => {
  const token = signAccessToken({ userId: 'user_1' });
  const payload = verifyAccessToken(token);
  assert.equal(payload.userId, 'user_1');
});
