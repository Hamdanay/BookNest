import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isbn13Checksum, validateIsbn, withValidChecksum, digitsOnly, isbnLookupNeedle } from './isbn.js';

test('checksum ISBN-13 yang dikenal valid', () => {
  assert.equal(isbn13Checksum('978030640615'), '7');
  assert.equal(validateIsbn('978-0-306-40615-7').ok, true);
});

test('menolak ISBN-13 dengan digit periksa salah', () => {
  const result = validateIsbn('978-0-306-40615-0');
  assert.equal(result.ok, false);
});

test('menolak panjang ISBN yang tidak 10 atau 13', () => {
  assert.equal(validateIsbn('12345').ok, false);
});

test('withValidChecksum memperbaiki digit terakhir', () => {
  const fixed = withValidChecksum('978-0-306-40615-0');
  assert.equal(validateIsbn(fixed).ok, true);
  assert.equal(digitsOnly(fixed).length, 13);
});

test('pencarian ISBN mengabaikan tanda hubung dan spasi', () => {
  const stored = digitsOnly('978-0-306-40615-7');
  const needle = isbnLookupNeedle('978-0-306-40615-7');
  assert.equal(needle, '9780306406157');
  assert.equal(stored.includes(needle), true);
  assert.equal(isbnLookupNeedle('978 0 306'), '9780306');
  assert.equal(isbnLookupNeedle('Bumi'), '');
});
