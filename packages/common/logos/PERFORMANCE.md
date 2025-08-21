# @beep/logos — Rules Engine Performance Guide & Optimization Playbook

This document provides a focused plan to improve the runtime performance of the rules engine in `@beep/logos`, with code examples and a ready-to-use prompt for a future GPT-5 thread. The primary target is eliminating per-call schema validation/cleaning in `run()` and introducing a compiled, cacheable runner.


## Current Architecture (as of this PR)

- __Entry__: `packages/common/logos/src/run.ts` → `run(union, value)`
  - Validates and re-encodes the `union` on each call using `effect/Schema`:
    - `S.encodeSync(S.Union(RootUnion, Union))` and `S.decodeSync(S.Union(RootUnion, Union))`.
  - Recursively evaluates a tree of unions/rules using depth-first traversal.
  - Short-circuits:
    - `and` → `Array.every`
    - `or` → `Array.some`
  - Field access via `effect/Record` + `Option`:
    - `R.get(rule.field)(value).pipe(O.getOrThrow)`
  - Dispatch by `_tag` into validators from `packages/common/logos/src/rules.ts`.

- __Schema & Types__:
  - Unions: `packages/common/logos/src/union.ts` (`Union`, `RootUnion`, `UnionInput`)
  - Rules: `packages/common/logos/src/rules.ts` (String/Number/Boolean/Array/Object/Generic/Date)
  - Operators: `packages/common/logos/src/operators.ts`
  - Normalize: `packages/common/logos/src/normalize.ts`
  - Validate-once API already exists: `packages/common/logos/src/validate.ts`

- __Tests__: `packages/common/logos/test/rules-engine/functions/run.test.ts`


## Observed Hotspots

- __Per-call schema encode/decode__: Redundant if the rule tree is stable across runs.
- __Boxing/unboxing overhead__: `Option`, `Record.get`, `Match.value` in tight loops.
- __StringRule case handling__: Recomputes case normalization per evaluation.
- __DateRule parsing__: Decodes to `DateTime.Utc` on each evaluation for both rule and value.
- __Recursive callbacks__: Allocation of closures (callback per `.every`/`.some`) in hot paths.


## Optimization Strategy

1) __One-time Validation & Normalization__
- Validate once when building the engine using `validate(root)` from `validate.ts`.
- Optionally call `normalize(root, { promoteSingleRuleUnions: true, removeEmptyUnions: true, updateParentIds: true })` to:
  - Remove invalid items (uses `S.encodeOption` guards)
  - Flatten single-rule unions
  - Ensure parent IDs

Example:
```ts
import { normalize } from "@beep/logos/normalize";
import { validate } from "@beep/logos/validate";

function assertReady(root: RootUnion.Type) {
  const v = validate(root);
  if (v.isValid === false) throw new Error(v.reason);
  normalize(root);
}
```

2) __Compiled Runner (prepare once, run many)__
- Introduce a `prepare(root)` API that returns a memoized evaluator:
  - Validates + normalizes once
  - Compiles the union tree into imperative predicates
  - Caches by `root.id` (and a `version` if the AST can mutate)

Proposed API (non-breaking addition):
```ts
// packages/common/logos/src/prepare.ts
export type Runner = (value: unknown) => boolean;

export function prepare(root: RootUnion.Type, opts?: { strictMissingField?: boolean }): Runner {
  // 1) validate/normalize
  // 2) compile AST → evaluator
  // 3) return runner(value) → boolean
}
```

`run()` can then delegate to a global WeakMap cache to avoid changing existing call sites:
```ts
// packages/common/logos/src/run.ts (conceptual)
const cache = new WeakMap<RootUnion.Type, (v: unknown) => boolean>();

export function run(union: AnyUnion, value: any): boolean {
  if (union.entity !== "rootUnion") return compileUnion(union)(value);
  let fn = cache.get(union);
  if (!fn) {
    fn = prepare(union);
    cache.set(union, fn);
  }
  return fn(value);
}
```

3) __Imperative, branchless-ish evaluation__
- Replace `Array.every/some` + callback allocation with classic loops.
- Avoid `Match.value` in inner loops; switch on inline `_tag` (string literal union) or map to small integers at compile time.

Example (AND):
```ts
function and(preds: ((v: any, ctx: Ctx) => boolean)[]): (v: any, ctx: Ctx) => boolean {
  return (v, ctx) => {
    for (let i = 0; i < preds.length; i++) {
      if (!preds[i]!(v, ctx)) return false;
    }
    return true;
  };
}
```

4) __Precompile field resolvers and rule constants__
- Pre-resolve `field` accessors once:
  - If fields are direct keys: `(obj: any) => (obj as any)[field]`
  - If nested/dotted paths are introduced later, use a precompiled getter (e.g., `lodash.get`)—but don’t allocate it per evaluation.
- Precompute constants per rule:
  - String: `caseRuleValue`, `ignoreCase`, `regex` already compiled by schema
  - Date: decode and store rule-side `Utc` once

Example:
```ts
type StringRuleCompiled = {
  kind: "string";
  get: (obj: any) => string | undefined;
  op: "eq" | "ne" | "in" | "notIn" | "startsWith" | "notStartsWith" | "endsWith" | "notEndsWith" | "matches";
  caseRuleValue?: string; // for ignoreCase rules
  ignoreCase: boolean;
  regex?: RegExp;
};
```

5) __Precompute per-input derived views__
- For each evaluation, build a light, per-value cache to avoid recomputing derived properties across multiple rules on the same field:
  - Strings: raw, trimmed, lowercased
  - Arrays: `length`, maybe a `Set` for `in` checks if used repeatedly
  - Objects: cached `keys`, `values`

Example:
```ts
type Ctx = {
  strings: Map<string, { raw?: string; trimmed?: string; lower?: string }>;
  arrays: Map<string, { value?: any[]; length?: number; set?: Set<any> }>;
  objects: Map<string, { keys?: string[]; values?: any[] }>;
};
```

6) __Avoid exceptions for missing fields in hot path__
- Replace `O.getOrThrow` with explicit undefined checks. Throwing is expensive.
- Provide an option `strictMissingField` (default true for back-compat) to control behavior when field is missing.

7) __DateRule cost control__
- Pre-decode rule-side dates to `DateTime.Utc` in compile step.
- On each evaluation, decode input once; skip rule if decode fails.

8) __Cache compiled programs__
- Use `WeakMap<RootUnion.Type, Runner>` to avoid memory leaks and invalidation complexity.
- If CRUD mutates the AST, add a `version` counter on the root and bump it in CRUD helpers; include `(root, version)` in the cache key (store on the object).

9) __Fast path API__
- Introduce a documented `runPrepared(root, value)` or expose `prepare(root)` directly.
- Keep `run()` safety-first but internally use the cache so callers get speed without API churn.


## Suggested File Additions

- `packages/common/logos/src/prepare.ts` — compile + cache runner
- `packages/common/logos/src/runFast.ts` — optional explicit fast runner exporting `prepare`/`runPrepared`


## Code Sketches

Compile union → predicate tree:
```ts
// prepare.ts (sketch)
import { RootUnion, Union } from "./union";
import { Rule } from "./rules";

type Ctx = { /* per-input cache as above */ };

type Pred = (value: any, ctx: Ctx) => boolean;

function compileRule(rule: Rule.Type): Pred {
  const get = (obj: any) => (obj as any)[rule.field];
  switch (rule._tag) {
    case "string": {
      const ignore = rule.ignoreCase;
      const caseRuleValue = ignore ? rule.value.trim().toLowerCase() : rule.value.trim();
      const op = rule.op._tag;
      const regex = op === "matches" ? rule.op.regex : undefined;
      return (v) => {
        const res = get(v);
        if (typeof res !== "string") return false;
        const s = ignore ? res.trim().toLowerCase() : res.trim();
        switch (op) {
          case "eq": return s === caseRuleValue;
          case "ne": return s !== caseRuleValue;
          case "in": return s.includes(caseRuleValue);
          case "notIn": return !s.includes(caseRuleValue);
          case "startsWith": return s.startsWith(caseRuleValue);
          case "notStartsWith": return !s.startsWith(caseRuleValue);
          case "endsWith": return s.endsWith(caseRuleValue);
          case "notEndsWith": return !s.endsWith(caseRuleValue);
          case "matches": return !!regex && regex.test(res);
          default: return false;
        }
      };
    }
    // …compile other rule kinds similarly, with precomputed constants…
  }
}

function compileUnion(u: Union.Type | RootUnion.Type): Pred {
  const children: Pred[] = u.rules.map((child) =>
    child.entity === "union" ? compileUnion(child) : compileRule(child),
  );
  if (u.logicalOp === "and") {
    return (v, ctx) => { for (let i = 0; i < children.length; i++) { if (!children[i]!(v, ctx)) return false; } return true; };
  } else {
    return (v, ctx) => { for (let i = 0; i < children.length; i++) { if (children[i]!(v, ctx)) return true; } return false; };
  }
}

export function prepare(root: RootUnion.Type): (value: any) => boolean {
  // validate(root); normalize(root);
  const pred = compileUnion(root);
  return (value) => pred(value, { /* init empty caches if needed */ } as any);
}
```


## Back-Compat & Safety

- Keep existing `run()` behavior for callers relying on runtime validation/cleaning.
- Implement `run()` on top of the prepared cache for a performance win without API changes.
- Provide a strict mode toggle to match current missing-field semantics (throw vs. false).


## Testing & Benchmarks

- __Parity tests__: Ensure `run(root, v)` === `prepare(root)(v)` across:
  - Unit tests from `test/rules-engine/functions/run.test.ts`
  - Fuzzed inputs (random shapes/values) where fields exist/missing

- __Microbench__: Use `tinybench` or `vitest` bench to compare:
  - Current `run()` vs. `prepare(root)`
  - Datasets: small (10 rules), medium (100 rules), deep nesting (depth 4–6)

Example tinybench:
```ts
import { Bench } from "tinybench";
import { run } from "@beep/logos/run";
import { prepare } from "@beep/logos/prepare";

const bench = new Bench({ time: 1000 });
const runner = prepare(root);

bench
  .add("run()", () => { run(root, sample); })
  .add("prepare(root)", () => { runner(sample); });

await bench.run();
console.table(bench.table());
```


## Effect Schema Notes (v3.x)

- Use `S.encodeEither/Option` or `S.is` for guards outside hot path.
- Avoid `encodeSync/decodeSync` in tight loops—prefer one-time validation.
- When you must parse dynamically, prefer `S.decodeOption(schema)(value)` and handle `None` without throwing.

Refs:
- `run.ts` per-call encode/decode hot path
- `validate.ts` one-time validation entry point
- `normalize.ts` AST cleanup and parentId propagation


## Migration Plan (Incremental)

- __Phase 1__: Add `prepare(root)` and `runPrepared(root, value)` (exported). Keep `run()` as-is.
- __Phase 2__: Make `run()` use the prepared cache under the hood, preserving external semantics.
- __Phase 3__: Add strict/lenient modes for missing fields; default to current behavior.
- __Phase 4__: Optimize rule-specific code paths (string pre-case, date pre-decode, loop-based AND/OR).
- __Phase 5__: Bench + document gains; adjust defaults if safe.


## Prompt for GPT-5 (copy-paste into a new thread)

System:
- You are refactoring `@beep/logos` rules engine for performance without changing observable semantics. Output must be small, targeted PRs with tests.

Context:
- Codebase paths:
  - `packages/common/logos/src/run.ts` — current engine with per-call `encodeSync/decodeSync`
  - `packages/common/logos/src/validate.ts` — one-time validation
  - `packages/common/logos/src/normalize.ts` — AST normalization utilities
  - `packages/common/logos/src/rules.ts` — rule validators
  - `packages/common/logos/src/union.ts` — union schemas
- Current usage short-circuits AND/OR and recursively evaluates unions.
- Avoid API breaking changes. Add new APIs if needed, then switch `run()` internally once parity is proven.

Goals:
1) Add `prepare(root)` that validates + normalizes once and returns a compiled runner.
2) Compile to imperative predicates (no per-eval schema work, no `Match.value` in hot path).
3) Cache prepared runners via `WeakMap` keyed by root object.
4) Keep `run()` functional; in Phase 2 delegate to cached runner.
5) Add parity tests and microbenchmarks.

Constraints:
- Do not change semantics without a flag. Missing fields should behave as today by default.
- Keep code small and readable. Prefer loops to callbacks in hot code.
- Use `effect` 3.17.x APIs (as present in `package.json`).

Tasks:
- Create `packages/common/logos/src/prepare.ts` with compiler + cache.
- Export `prepare` and optionally `runPrepared` in `src/index.ts`.
- Add unit tests comparing `run()` and prepared runner outputs.
- Add `tinybench` microbenchmarks under `test/perf/`.
- Update docs (`PERFORMANCE.md`) if behavior flags are introduced.

Acceptance:
- All tests pass.
- Parity: 100% match on existing test suite + new fuzz tests.
- Benchmark shows ≥2x speedup for repeated evaluations on the same rule tree.


---
If you have questions or need clarifications (e.g., strict vs lenient missing-field semantics), ask before implementing Phase 2.
