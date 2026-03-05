# deep

Provides 'deep' tools for objects and arrays in pure JavaScript.

## Installation

```
npm install @eventengineering/deep
```

## API

### `deepAssign(target, value)`

Recursively assigns properties from `value` into `target`, mutating `target` in-place.

- Nested objects are recursed into rather than replaced.
- Arrays are spliced (elements replaced, existing reference preserved).
- Keys where the type changes (e.g. object → primitive, array → non-array) are skipped with a console warning.

```js
import { deepAssign } from '@eventengineering/deep';

const target = { a: 1, b: { c: 2 } };
deepAssign(target, { b: { c: 99, d: 3 } });
// target => { a: 1, b: { c: 99, d: 3 } }
```

### `deepDiff(original, edit[, flags[, ignoreKeys]])`

Returns the subset of `edit` that differs from `original`.

- For objects: returns a partial object containing only changed keys.
- For arrays: returns the full mapped array if any element changed or lengths differ, otherwise `null`.
- Recursion is applied to nested objects and arrays.

```js
import { deepDiff } from '@eventengineering/deep';

deepDiff({ a: 1, b: 2 }, { a: 1, b: 99 });
// => { b: 99 }

deepDiff({ a: 1 }, { a: 1, b: 2 });
// => { b: 2 } (new key included by default)
```

#### Flags

| Constant | Value | Effect |
|---|---|---|
| `DEEP_HIDE_ADDITIONAL_KEYS` | `1` | Exclude keys present in `edit` but not in `original` |
| `DEEP_SHOW_REMOVED_KEYS` | `2` | Include keys present in `original` but not in `edit` (as `undefined`) |
| `DEEP_PROPAGATE_IGNORE_KEYS` | `4` | Propagate each `ignoreKeys` entry into all descendant levels (see below) |

Flags can be combined with bitwise OR.

```js
import { deepDiff, DEEP_HIDE_ADDITIONAL_KEYS, DEEP_SHOW_REMOVED_KEYS } from '@eventengineering/deep';

deepDiff({ a: 1 }, { a: 1, b: 2 }, DEEP_HIDE_ADDITIONAL_KEYS);
// => { }

deepDiff({ a: 1, b: 2 }, { a: 1 }, DEEP_SHOW_REMOVED_KEYS);
// => { b: undefined }
```

#### `ignoreKeys`

An array of key names to exclude from the diff.

**Default behaviour:**

Each entry is matched only at its exact depth. A flat key (e.g. `'b'`) ignores only the top-level key; a dot-notation key (e.g. `'a.b'`) ignores only the direct child named by the final segment.

```js
deepDiff({ a: { b: 1 }, b: 2 }, { a: { b: 99 }, b: 99 }, 0, ['b']);
// => { a: { b: 99 } }  (top-level 'b' ignored; 'a.b' still diffed)

deepDiff({ a: { b: 1, x: { b: 2 } } }, { a: { b: 99, x: { b: 99 } } }, 0, ['a.b']);
// => { a: { x: { b: 99 } } }  ('a.b' ignored; 'a.x.b' still diffed)
```

**With `DEEP_PROPAGATE_IGNORE_KEYS`:**

Flat keys (no dots) are ignored at every depth. Dot-notation keys are unaffected by the flag — they always match at their exact depth regardless.

```js
import { deepDiff, DEEP_PROPAGATE_IGNORE_KEYS } from '@eventengineering/deep';

deepDiff({ a: { b: 1 }, b: 2 }, { a: { b: 99 }, b: 99 }, DEEP_PROPAGATE_IGNORE_KEYS, ['b']);
// => { }  ('b' ignored at all depths)

deepDiff({ a: { b: 1, c: { b: 2 } } }, { a: { b: 99, c: { b: 99 } } }, DEEP_PROPAGATE_IGNORE_KEYS, ['a.b']);
// => { a: { c: { b: 99 } } }  ('a.b' ignored; 'a.c.b' is a different path and is still diffed)
```

## License

MIT
