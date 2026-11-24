import test from 'node:test';
import assert from 'node:assert/strict';
import { estimate } from './estimate.mjs';
const policy = { adminBps: 1000, contingencyBps: 500, taxBps: 750, taxBase: 'subtotal' };
const line = { id: 'demo', quantityMilli: 2500, unitPriceKobo: 40000 };
test('fractional quantity and transparent subtotal', () => {
  const result = estimate([line], policy);
  assert.equal(result.lines[0].totalKobo, 100000);
  assert.equal(result.subtotalKobo, 100000);
  assert.equal(result.adminKobo, 10000);
  assert.equal(result.contingencyKobo, 5000);
  assert.equal(result.taxKobo, 7500);
  assert.equal(result.grandTotalKobo, 122500);
});
test('explicit alternative tax base', () => {
  const result = estimate([line], { ...policy, taxBase: 'subtotal_plus_charges' });
  assert.equal(result.taxableKobo, 115000);
  assert.equal(result.taxKobo, 8625);
  assert.equal(result.grandTotalKobo, 123625);
});
test('rounds a half kobo upward', () => {
  assert.equal(estimate([{ ...line, quantityMilli: 500, unitPriceKobo: 1 }], policy).subtotalKobo, 1);
});
test('supports lump sum and zero-priced item', () => {
  const result = estimate([{ ...line, quantityMilli: 1000 }, { ...line, id: 'free', unitPriceKobo: 0 }], policy);
  assert.equal(result.subtotalKobo, 40000);
});
test('rejects duplicate line IDs', () => assert.throws(() => estimate([line, { ...line, id: ' demo ' }], policy), /Unique/));
test('rejects negative prices and zero quantities', () => {
  assert.throws(() => estimate([{ ...line, unitPriceKobo: -1 }], policy), RangeError);
  assert.throws(() => estimate([{ ...line, quantityMilli: 0 }], policy), RangeError);
});
test('rejects missing or invalid tax policy', () => {
  assert.throws(() => estimate([line], { ...policy, taxBase: undefined }), RangeError);
  assert.throws(() => estimate([line], { ...policy, taxBps: 10001 }), RangeError);
});
test('rejects unsafe calculated amounts', () => assert.throws(() => estimate([{ ...line, unitPriceKobo: Number.MAX_SAFE_INTEGER }], policy), RangeError));
test('rejects empty lines and noninteger inputs', () => {
  assert.throws(() => estimate([], policy), TypeError);
  assert.throws(() => estimate([{ ...line, quantityMilli: 1.5 }], policy), RangeError);
});
