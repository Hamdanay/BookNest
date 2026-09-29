import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateKondisiStatus, suggestedStatus, allowedStatuses } from './inventory-rules.js';

const ALL = ['Tersedia', 'Sebagian Rusak', 'Tidak Tersedia', 'Hilang', 'Diarsipkan'];

test('Rusak Berat tidak boleh Tersedia', () => {
  assert.equal(validateKondisiStatus('Rusak Berat', 'Tersedia').ok, false);
  assert.equal(suggestedStatus('Rusak Berat'), 'Tidak Tersedia');
});

test('Baik tidak boleh Sebagian Rusak', () => {
  assert.equal(validateKondisiStatus('Baik', 'Sebagian Rusak').ok, false);
  assert.equal(validateKondisiStatus('Baik', 'Tersedia').ok, true);
});

test('Rusak Ringan boleh Tersedia atau Sebagian Rusak', () => {
  assert.equal(validateKondisiStatus('Rusak Ringan', 'Tersedia').ok, true);
  assert.equal(validateKondisiStatus('Rusak Ringan', 'Sebagian Rusak').ok, true);
});

test('Cukup Baik tidak boleh Tidak Tersedia', () => {
  assert.equal(validateKondisiStatus('Cukup Baik', 'Tidak Tersedia').ok, false);
  assert.equal(validateKondisiStatus('Cukup Baik', 'Tersedia').ok, true);
});

test('allowedStatuses menyaring opsi tidak sah', () => {
  const allowed = allowedStatuses('Rusak Berat', ALL);
  assert.equal(allowed.includes('Tersedia'), false);
  assert.equal(allowed.includes('Tidak Tersedia'), true);
});
