import test from 'tape';
import { deepAssign, deepDiff, DEEP_HIDE_ADDITIONAL_KEYS, DEEP_SHOW_REMOVED_KEYS } from '../index.js';

// ─── deepAssign ──────────────────────────────────────────────────────────────

test('deepAssign: assigns primitive values', (t) => {
	let target = { a: 1 };
	deepAssign(target, { a: 99 });
	t.equal(target.a, 99);
	t.end();
});

test('deepAssign: adds new keys', (t) => {
	let target = { a: 1 };
	deepAssign(target, { b: 2 });
	t.equal(target.b, 2);
	t.end();
});

test('deepAssign: recurses into nested objects', (t) => {
	let target = { a: { b: 1, c: 2 } };
	deepAssign(target, { a: { b: 99 } });
	t.equal(target.a.b, 99);
	t.equal(target.a.c, 2, 'preserves untouched nested keys');
	t.end();
});

test('deepAssign: preserves nested object reference', (t) => {
	let nested = { b: 1 };
	let target = { a: nested };
	deepAssign(target, { a: { b: 2 } });
	t.equal(target.a, nested, 'same reference');
	t.equal(nested.b, 2);
	t.end();
});

test('deepAssign: splices arrays in-place', (t) => {
	let arr = [1, 2, 3];
	let target = { a: arr };
	deepAssign(target, { a: [4, 5] });
	t.equal(target.a, arr, 'same array reference');
	t.deepEqual(target.a, [4, 5]);
	t.end();
});

test('deepAssign: skips mismatched types (object -> primitive)', (t) => {
	let target = { a: { b: 1 } };
	deepAssign(target, { a: 'string' });
	t.deepEqual(target.a, { b: 1 }, 'original value preserved');
	t.end();
});

test('deepAssign: skips mismatched types (array -> non-array)', (t) => {
	let target = { a: [1, 2] };
	deepAssign(target, { a: { 0: 9 } });
	t.deepEqual(target.a, [1, 2], 'original value preserved');
	t.end();
});

test('deepAssign: returns target', (t) => {
	let target = {};
	let result = deepAssign(target, { a: 1 });
	t.equal(result, target);
	t.end();
});

// ─── deepDiff ────────────────────────────────────────────────────────────────

test('deepDiff: returns changed keys', (t) => {
	let diff = deepDiff({ a: 1, b: 2 }, { a: 1, b: 99 });
	t.deepEqual(diff, { b: 99 });
	t.end();
});

test('deepDiff: returns empty object when nothing changed', (t) => {
	let diff = deepDiff({ a: 1 }, { a: 1 });
	t.deepEqual(diff, {});
	t.end();
});

test('deepDiff: includes additional keys by default', (t) => {
	let diff = deepDiff({ a: 1 }, { a: 1, b: 2 });
	t.deepEqual(diff, { b: 2 });
	t.end();
});

test('deepDiff: DEEP_HIDE_ADDITIONAL_KEYS hides new keys', (t) => {
	let diff = deepDiff({ a: 1 }, { a: 1, b: 2 }, DEEP_HIDE_ADDITIONAL_KEYS);
	t.deepEqual(diff, {});
	t.end();
});

test('deepDiff: DEEP_SHOW_REMOVED_KEYS includes missing keys as undefined', (t) => {
	let diff = deepDiff({ a: 1, b: 2 }, { a: 1 }, DEEP_SHOW_REMOVED_KEYS);
	t.ok(diff.hasOwnProperty('b'));
	t.equal(diff.b, undefined);
	t.end();
});

test('deepDiff: recurses into nested objects', (t) => {
	let diff = deepDiff({ a: { b: 1, c: 2 } }, { a: { b: 1, c: 99 } });
	t.deepEqual(diff, { a: { c: 99 } });
	t.end();
});

test('deepDiff: DEEP_HIDE_ADDITIONAL_KEYS applies to nested objects', (t) => {
	let diff = deepDiff({ a: { b: 1 } }, { a: { b: 1, c: 2 } }, DEEP_HIDE_ADDITIONAL_KEYS);
	t.deepEqual(diff, {}, 'nested additional key hidden');
	t.end();
});

test('deepDiff: includes additional keys in nested objects by default', (t) => {
	let diff = deepDiff({ a: { b: 1 } }, { a: { b: 1, c: 2 } });
	t.deepEqual(diff, { a: { c: 2 } });
	t.end();
});

test('deepDiff: returns null for arrays with no changes', (t) => {
	let diff = deepDiff([1, 2, 3], [1, 2, 3]);
	t.equal(diff, null);
	t.end();
});

test('deepDiff: returns mapped array when an element changes', (t) => {
	let diff = deepDiff([1, 2, 3], [1, 99, 3]);
	t.deepEqual(diff, [1, 99, 3]);
	t.end();
});

test('deepDiff: returns mapped array when lengths differ', (t) => {
	let diff = deepDiff([1, 2], [1, 2, 3]);
	t.ok(Array.isArray(diff));
	t.end();
});

test('deepDiff: ignoreKeys excludes specified keys', (t) => {
	let diff = deepDiff({ a: 1, b: 2 }, { a: 99, b: 99 }, 0, ['b']);
	t.deepEqual(diff, { a: 99 });
	t.end();
});
