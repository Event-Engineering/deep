# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run lint   # ESLint across .js/.mjs/.cjs files
```

There is no test script.

## Architecture

`@eventengineering/deep` is a tiny, zero-dependency ES module utility library (`"type": "module"`) with a single source file ([index.js](index.js)).

It exports two functions and two flag constants:

- **`deepAssign(target, value)`** — recursively assigns properties from `value` into `target`, mutating `target` in-place. Arrays are spliced (not replaced). Logs a warning and skips keys where the types are mismatched (object vs. primitive, array vs. non-array).

- **`deepDiff(original, edit, flags?, ignoreKeys?)`** — returns the subset of `edit` that differs from `original`. For objects, returns a partial object of changed keys. For arrays, returns the full mapped array if any element changed or lengths differ, otherwise `null`. `flags` is a bitmask:
  - `DEEP_ADDITIONAL_KEYS` (1) — include keys present in `edit` but not `original`
  - `DEEP_REMOVED_KEYS` (2) — include keys present in `original` but not `edit` (marked `undefined`)
  - `ignoreKeys` supports dot-notation scoping as recursion descends.

## Style

Same ESLint rules as sibling packages: **tabs** for indentation, **semicolons** required, **trailing commas** in multiline arrays/objects/imports/exports, **curly braces** required on all control flow, function call arguments must be consistently single-line or multi-line.
