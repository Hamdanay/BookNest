import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateIsbn } from './isbn.js';

test('ISBN-13 valid lolos di frontend', () => {
  assert.equal(validateIsbn('978-0-306-40615-7').ok, true);
});

test('ISBN-13 checksum salah ditolak', () => {
  assert.equal(validateIsbn('978-0-306-40615-0').ok, false);
});
