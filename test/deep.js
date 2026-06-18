import test from 'tape';
import { deepAssign, deepDiff, DEEP_HIDE_ADDITIONAL_KEYS, DEEP_SHOW_REMOVED_KEYS, DEEP_PROPAGATE_IGNORE_KEYS } from '../index.js';

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
	let target = { a: { b: 1, c: 2 }};
	deepAssign(target, { a: { b: 99 }});
	t.equal(target.a.b, 99);
	t.equal(target.a.c, 2, 'preserves untouched nested keys');
	t.end();
});

test('deepAssign: preserves nested object reference', (t) => {
	let nested = { b: 1 };
	let target = { a: nested };
	deepAssign(target, { a: { b: 2 }});
	t.equal(target.a, nested, 'same reference');
	t.equal(nested.b, 2);
	t.end();
});

test('deepAssign: splices arrays in-place', (t) => {
	let arr = [ 1, 2, 3 ];
	let target = { a: arr };
	deepAssign(target, { a: [ 4, 5 ]});
	t.equal(target.a, arr, 'same array reference');
	t.deepEqual(target.a, [ 4, 5 ]);
	t.end();
});

test('deepAssign: skips mismatched types (object -> primitive)', (t) => {
	let target = { a: { b: 1 }};
	deepAssign(target, { a: 'string' });
	t.deepEqual(target.a, { b: 1 }, 'original value preserved');
	t.end();
});

test('deepAssign: skips mismatched types (array -> non-array)', (t) => {
	let target = { a: [ 1, 2 ]};
	deepAssign(target, { a: { 0: 9 }});
	t.deepEqual(target.a, [ 1, 2 ], 'original value preserved');
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
	let diff = deepDiff({ a: { b: 1, c: 2 }}, { a: { b: 1, c: 99 }});
	t.deepEqual(diff, { a: { c: 99 }});
	t.end();
});

test('deepDiff: DEEP_HIDE_ADDITIONAL_KEYS applies to nested objects', (t) => {
	let diff = deepDiff({ a: { b: 1 }}, { a: { b: 1, c: 2 }}, DEEP_HIDE_ADDITIONAL_KEYS);
	t.deepEqual(diff, {}, 'nested additional key hidden');
	t.end();
});

test('deepDiff: includes additional keys in nested objects by default', (t) => {
	let diff = deepDiff({ a: { b: 1 }}, { a: { b: 1, c: 2 }});
	t.deepEqual(diff, { a: { c: 2 }});
	t.end();
});

test('deepDiff: returns null for arrays with no changes', (t) => {
	let diff = deepDiff([ 1, 2, 3 ], [ 1, 2, 3 ]);
	t.equal(diff, null);
	t.end();
});

test('deepDiff: returns mapped array when an element changes', (t) => {
	let diff = deepDiff([ 1, 2, 3 ], [ 1, 99, 3 ]);
	t.deepEqual(diff, [ 1, 99, 3 ]);
	t.end();
});

test('deepDiff: returns mapped array when lengths differ', (t) => {
	let diff = deepDiff([ 1, 2 ], [ 1, 2, 3 ]);
	t.ok(Array.isArray(diff));
	t.end();
});

test('deepDiff: ignoreKeys excludes specified keys', (t) => {
	let diff = deepDiff({ a: 1, b: 2 }, { a: 99, b: 99 }, 0, [ 'b' ]);
	t.deepEqual(diff, { a: 99 });
	t.end();
});

test('deepDiff: ignoreKeys excludes additional keys even without DEEP_HIDE_ADDITIONAL_KEYS', (t) => {
	// 'b' is new in edit; without ignoreKeys it would appear, but it must be suppressed
	let diff = deepDiff({ a: 1 }, { a: 1, b: 99 }, 0, [ 'b' ]);
	t.notOk(diff.hasOwnProperty('b'), 'ignored additional key absent');
	t.deepEqual(diff, {});
	t.end();
});

test('deepDiff: ignoreKeys excludes removed keys even with DEEP_SHOW_REMOVED_KEYS', (t) => {
	// 'b' exists only in original; with DEEP_SHOW_REMOVED_KEYS it would appear as undefined, but must be suppressed
	let diff = deepDiff({ a: 1, b: 2 }, { a: 1 }, DEEP_SHOW_REMOVED_KEYS, [ 'b' ]);
	t.notOk(diff.hasOwnProperty('b'), 'ignored removed key absent');
	t.deepEqual(diff, {});
	t.end();
});

test('deepDiff: ignoreKeys excludes changed keys regardless of DEEP_HIDE_ADDITIONAL_KEYS', (t) => {
	let diff = deepDiff({ a: 1, b: 2 }, { a: 99, b: 99 }, DEEP_HIDE_ADDITIONAL_KEYS, [ 'b' ]);
	t.notOk(diff.hasOwnProperty('b'), 'ignored key absent with DEEP_HIDE_ADDITIONAL_KEYS');
	t.deepEqual(diff, { a: 99 });
	t.end();
});

test('deepDiff: ignoreKeys excludes changed keys regardless of DEEP_SHOW_REMOVED_KEYS', (t) => {
	let diff = deepDiff({ a: 1, b: 2 }, { a: 99, b: 99 }, DEEP_SHOW_REMOVED_KEYS, [ 'b' ]);
	t.notOk(diff.hasOwnProperty('b'), 'ignored key absent with DEEP_SHOW_REMOVED_KEYS');
	t.deepEqual(diff, { a: 99 });
	t.end();
});

test('deepDiff: ignoreKeys excludes keys regardless of both flags combined', (t) => {
	let diff = deepDiff({ a: 1, b: 2 }, { a: 99, b: 99 }, DEEP_HIDE_ADDITIONAL_KEYS | DEEP_SHOW_REMOVED_KEYS, [ 'b' ]);
	t.notOk(diff.hasOwnProperty('b'), 'ignored key absent with both flags');
	t.deepEqual(diff, { a: 99 });
	t.end();
});

test('deepDiff: dot-notation ignoreKeys excludes nested key regardless of flags', (t) => {
	let diff = deepDiff({ a: { b: 1, c: 2 }}, { a: { b: 99, c: 99 }}, 0, [ 'a.b' ]);
	t.ok(diff.a, 'outer key present');
	t.notOk(diff.a && diff.a.hasOwnProperty('b'), 'nested ignored key absent');
	t.deepEqual(diff, { a: { c: 99 }});
	t.end();
});

test('deepDiff: dot-notation ignoreKeys excludes nested additional key even without DEEP_HIDE_ADDITIONAL_KEYS', (t) => {
	let diff = deepDiff({ a: { b: 1 }}, { a: { b: 1, c: 99 }}, 0, [ 'a.c' ]);
	t.ok(diff.a === undefined || ! diff.a.hasOwnProperty('c'), 'nested ignored additional key absent');
	t.end();
});

// ─── ignoreKeys scope (default: exact depth) ─────────────────────────────────

test('deepDiff: flat ignoreKey ignores only its exact depth by default', (t) => {
	let diff = deepDiff({ a: { inner: 1 }, inner: 2 }, { a: { inner: 99 }, inner: 99 }, 0, [ 'inner' ]);
	t.notOk(diff.hasOwnProperty('inner'), 'top-level inner ignored');
	t.deepEqual(diff.a, { inner: 99 }, 'nested inner not ignored');
	t.end();
});

test('deepDiff: dot-notation ignoreKey ignores only its exact depth by default', (t) => {
	// ['a.b'] strips to ['b'] inside a, but 'b' is not passed deeper; a.x.b is still diffed
	let diff = deepDiff({ a: { b: 1, x: { b: 2 }}}, { a: { b: 99, x: { b: 99 }}}, 0, [ 'a.b' ]);
	t.notOk(diff.a && diff.a.hasOwnProperty('b'), 'a.b ignored');
	t.deepEqual(diff.a && diff.a.x, { b: 99 }, 'a.x.b not ignored');
	t.end();
});

// ─── DEEP_SHOW_REMOVED_KEYS in nested objects ─────────────────────────────────

test('deepDiff: DEEP_SHOW_REMOVED_KEYS surfaces removed keys inside nested objects', (t) => {
	let diff = deepDiff({ a: { b: 1, c: 2 }}, { a: { b: 1 }}, DEEP_SHOW_REMOVED_KEYS);
	t.ok(diff.a, 'outer key present');
	t.ok(diff.a.hasOwnProperty('c'), 'removed nested key present');
	t.equal(diff.a.c, undefined, 'removed nested key is undefined');
	t.end();
});

// ─── falsy primitive values ───────────────────────────────────────────────────

test('deepDiff: detects change to 0', (t) => {
	let diff = deepDiff({ a: 1 }, { a: 0 });
	t.deepEqual(diff, { a: 0 });
	t.end();
});

test('deepDiff: detects change from 0', (t) => {
	let diff = deepDiff({ a: 0 }, { a: 1 });
	t.deepEqual(diff, { a: 1 });
	t.end();
});

test('deepDiff: detects change to false', (t) => {
	let diff = deepDiff({ a: true }, { a: false });
	t.deepEqual(diff, { a: false });
	t.end();
});

test('deepDiff: detects change to null', (t) => {
	let diff = deepDiff({ a: 1 }, { a: null });
	t.deepEqual(diff, { a: null });
	t.end();
});

test('deepDiff: no diff when nested value changes to 0 then back', (t) => {
	t.deepEqual(deepDiff({ a: { b: 0 }}, { a: { b: 0 }}), {});
	t.end();
});

test('deepDiff: detects change inside nested object when sibling is falsy', (t) => {
	let diff = deepDiff({ a: { b: 0, c: 1 }}, { a: { b: 0, c: 99 }});
	t.deepEqual(diff, { a: { c: 99 }});
	t.end();
});

// ─── DEEP_PROPAGATE_IGNORE_KEYS ───────────────────────────────────────────────

test('deepDiff: DEEP_PROPAGATE_IGNORE_KEYS makes flat ignoreKey apply at all depths', (t) => {
	let diff = deepDiff({ a: { inner: 1 }, inner: 2 }, { a: { inner: 99 }, inner: 99 }, DEEP_PROPAGATE_IGNORE_KEYS, [ 'inner' ]);
	t.notOk(diff.hasOwnProperty('inner'), 'top-level inner ignored');
	t.notOk(diff.a && diff.a.hasOwnProperty('inner'), 'nested inner also ignored');
	t.end();
});

test('deepDiff: DEEP_PROPAGATE_IGNORE_KEYS flat key matches same-named key nested under any parent', (t) => {
	// 'a' should match b.a, c.b.a, etc — any path ending with the key name
	let diff = deepDiff({ b: { a: 1 }}, { b: { a: 99 }}, DEEP_PROPAGATE_IGNORE_KEYS, [ 'a' ]);
	t.deepEqual(diff, {}, 'b.a ignored via flat key propagation');
	t.end();
});

test('deepDiff: without DEEP_PROPAGATE_IGNORE_KEYS flat key does not match same-named nested key', (t) => {
	let diff = deepDiff({ b: { a: 1 }}, { b: { a: 99 }}, 0, [ 'a' ]);
	t.deepEqual(diff, { b: { a: 99 }}, 'b.a not ignored — flat key scoped to top level only');
	t.end();
});

test('deepDiff: DEEP_PROPAGATE_IGNORE_KEYS dot-notation key matches the same path at any depth', (t) => {
	// 'a.b' matches c.a.b because the path ends with '.a.b'
	let diff = deepDiff({ c: { a: { b: 1 }}}, { c: { a: { b: 99 }}}, DEEP_PROPAGATE_IGNORE_KEYS, [ 'a.b' ]);
	t.notOk(diff.c && diff.c.a && diff.c.a.hasOwnProperty('b'), 'c.a.b ignored via suffix match');
	t.end();
});

test('deepDiff: DEEP_PROPAGATE_IGNORE_KEYS dot-notation key does not match partial path segments', (t) => {
	// 'a.b' should not match a.x.b — the path must end with exactly '.a.b'
	let diff = deepDiff({ a: { b: 1, x: { b: 2 }}}, { a: { b: 99, x: { b: 99 }}}, DEEP_PROPAGATE_IGNORE_KEYS, [ 'a.b' ]);
	t.notOk(diff.a && diff.a.hasOwnProperty('b'), 'a.b ignored');
	t.deepEqual(diff.a && diff.a.x, { b: 99 }, 'a.x.b not ignored — different path');
	t.end();
});

test('deepDiff: DEEP_PROPAGATE_IGNORE_KEYS works alongside DEEP_HIDE_ADDITIONAL_KEYS', (t) => {
	let diff = deepDiff({ a: { b: 1, c: 2 }}, { a: { b: 99, c: 99 }, b: 99 }, DEEP_PROPAGATE_IGNORE_KEYS | DEEP_HIDE_ADDITIONAL_KEYS, [ 'b' ]);
	t.notOk(diff.hasOwnProperty('b'), 'top-level b ignored (also additional)');
	t.notOk(diff.a && diff.a.hasOwnProperty('b'), 'nested b ignored due to propagation');
	t.deepEqual(diff, { a: { c: 99 }});
	t.end();
});

test('deepDiff: DEEP_PROPAGATE_IGNORE_KEYS works alongside DEEP_SHOW_REMOVED_KEYS', (t) => {
	let diff = deepDiff({ a: { b: 1, c: 2 }, b: 2 }, { a: { b: 99, c: 99 }}, DEEP_PROPAGATE_IGNORE_KEYS | DEEP_SHOW_REMOVED_KEYS, [ 'b' ]);
	t.notOk(diff.hasOwnProperty('b'), 'top-level b ignored (not shown as removed)');
	t.notOk(diff.a && diff.a.hasOwnProperty('b'), 'nested b ignored due to propagation');
	t.deepEqual(diff, { a: { c: 99 }});
	t.end();
});
