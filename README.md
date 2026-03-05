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

```js
import { deepDiff, DEEP_HIDE_ADDITIONAL_KEYS, DEEP_SHOW_REMOVED_KEYS } from '@eventengineering/deep';

deepDiff({ a: 1 }, { a: 1, b: 2 }, DEEP_HIDE_ADDITIONAL_KEYS);
// => { }

deepDiff({ a: 1, b: 2 }, { a: 1 }, DEEP_SHOW_REMOVED_KEYS);
// => { b: undefined }
```

#### `ignoreKeys`

An array of key names to exclude from the diff. Supports dot-notation for nested keys (e.g. `'b.c'` will be scoped as recursion descends into `b`).

```js
deepDiff({ a: 1, b: 2 }, { a: 99, b: 99 }, 0, ['b']);
// => { a: 99 }
```

## License

MIT
