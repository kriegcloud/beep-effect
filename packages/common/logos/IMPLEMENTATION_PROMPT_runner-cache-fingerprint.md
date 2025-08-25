# Fix runner cache invalidation: include rule values/config in fingerprint and invalidate on writes

## Problem summary & impact
- __Stale runner due to weak fingerprint__: `prepare()` caches a compiled runner in a WeakMap keyed by root and guarded by `fingerprint(root)` (`packages/common/logos/src/prepare.ts`, `packages/common/logos/src/internal/fingerprint.ts`). The current fingerprint only includes structure and operator tag, not rule values or operator config. See `fingerprint()` in `packages/common/logos/src/internal/fingerprint.ts`:
  - Uses: `R:${child.type}:${child.id}:${child.field}:${child.op._tag}`
  - Missing: value(s), `ignoreCase`, regex pattern, date comparison values, etc.
- __Symptom__: `crud.updateRuleById()` replaces a rule object in place, but if `fingerprint` stays unchanged, `prepare()` reuses a stale runner and evaluates with old values/config.
- __Impact__: Incorrect rule evaluations after updates; non-deterministic behavior that is hard to detect in production.

## Decision & approach
- __Chosen approach: both Option A and Option B__ for robustness.
  1) __Option A__: Strengthen `fingerprint()` to serialize all evaluation-relevant bits of each rule (excluding volatile ids). Include operator config (e.g., regex) and fields like `ignoreCase`, `value`, and any nested structures. Ensure stable serialization for `RegExp`.
  2) __Option B__: Export `invalidatePrepared(root)` from `prepare.ts` and call it from CRUD mutations that replace nodes (`updateRuleById`, `updateGroupById`). This is belt-and-suspenders and guards against any future oversight in the fingerprint function.
- __Alternatives considered__: Only A or only B. A alone should be sufficient; B alone avoids stale runners at the cost of possibly extra recompiles. Doing both keeps correctness even if we later tweak fingerprint content again.

## Step-by-step plan
1) __Update fingerprint serialization__ in `packages/common/logos/src/internal/fingerprint.ts`:
   - Drop rule `id` and `parentId` from serialization.
   - Serialize entire rule payload including `type`, `field`, `op` (with config), `value`, `ignoreCase`, and nested values.
   - Handle `RegExp` in operator config by converting to a stable string form (e.g., `/${source}/${flags}`).
2) __Add cache invalidator__ in `packages/common/logos/src/prepare.ts`:
   - Export `invalidatePrepared(root: RootGroup.Type): void` that deletes the WeakMap entry.
3) __Call invalidator from CRUD updates__ in `packages/common/logos/src/crud.ts`:
   - After replacing the object (`parent.rules[idx] = next`) and invalidating the id index, also call `invalidatePrepared(root)` in both `updateRuleById` and `updateGroupById`.
4) __Tests__ under `packages/common/logos/test/`:
   - Add regression tests that would previously fail (stale runner) and now pass.
   - Cover changes to: value, `ignoreCase`, regex pattern, date comparison values, and group `logicalOp`.
5) __Docs/cleanup__:
   - No public API changes other than exporting `invalidatePrepared` (internal usage). No migrations needed.

## Code snippets (ready to paste)

### 1) `packages/common/logos/src/internal/fingerprint.ts`
```ts
import * as O from "effect/Option";
import { Rule } from "../rules";
import type { RootGroup, RuleGroup } from "../groups";

/**
 * Computes a structural + semantic fingerprint of a group tree.
 * Includes group logical ops and full rule payload that affects evaluation.
 * Excludes volatile ids (rule.id, rule.parentId).
 * Ensures stable serialization for RegExp in operator config.
 */
export function fingerprint(u: RuleGroup.Type | RootGroup.Type): string {
  const parts: string[] = [];

  const visit = (node: RuleGroup.Type | RootGroup.Type): void => {
    parts.push(`U:${node.id}:${node.logicalOp}`);
    for (let i = 0; i < node.rules.length; i++) {
      const child = O.fromNullable(node.rules[i]).pipe(O.getOrThrow);
      if (child.node === "group") {
        visit(child);
      } else {
        const r = child as Rule.Type;
        const payload = JSON.stringify(
          r,
          (k, v) => {
            if (k === "id" || k === "parentId") return undefined;
            if (v instanceof RegExp) return `re:/${v.source}/${v.flags}`;
            return v;
          },
        );
        parts.push(`R:${payload}`);
      }
    }
  };

  visit(u);
  return parts.join("|");
}
```

### 2) `packages/common/logos/src/prepare.ts`
```ts
// ...existing imports...
import type { RootGroup, RuleGroup } from "./groups";

export type Runner = (value: unknown) => boolean;

type CacheEntry = { runner: Runner; fp: string };
const cache = new WeakMap<RootGroup.Type, CacheEntry>();

// Add this export (belt & suspenders invalidation for callers that mutate the tree)
export function invalidatePrepared(root: RootGroup.Type): void {
  cache.delete(root);
}

// ...rest of file unchanged...
```

### 3) `packages/common/logos/src/crud.ts`
```ts
// ...existing imports...
import { invalidatePrepared } from "./prepare";

export const updateRuleById = (
  root: RootGroup.Type,
  id: NodeId.Type,
  values: RuleInput.Type,
): RuleOrUndefined => {
  // ...existing code...
  const next = { ...(parent.rules[idx] as Rule.Type), ...values };
  parent.rules[idx] = next;
  invalidateIdIndex(root);
  invalidatePrepared(root); // ensure cached runner is rebuilt next time
  return next;
};

export const updateGroupById = (
  root: RootGroup.Type,
  id: NodeId.Type,
  values: GroupInput.Type,
): RootOrRuleGroupOrUndefined => {
  // ...existing code...
  if (foundGroup.node === "root") {
    foundGroup.logicalOp = values.logicalOp;
    invalidateIdIndex(root);
    invalidatePrepared(root);
    return foundGroup;
  }
  // ...existing code...
  const next = { ...(parent.rules[idx] as RuleGroup.Type), ...values };
  parent.rules[idx] = next;
  invalidateIdIndex(root);
  invalidatePrepared(root);
  return next;
};
```

## Exact locations to change
- `packages/common/logos/src/internal/fingerprint.ts`: replace the body of `fingerprint()` with the implementation above.
- `packages/common/logos/src/prepare.ts`: add `export function invalidatePrepared(...)` right after the `cache` WeakMap declaration.
- `packages/common/logos/src/crud.ts`: import `invalidatePrepared` from `./prepare` and invoke it in `updateRuleById()` and `updateGroupById()` immediately after `invalidateIdIndex(root)`.

## Useful links
- __Effect Schema docs__: https://effect.website/docs/schema
- __Effect pattern matching__: https://effect.website/docs/data/match
- __MDN JSON.stringify replacer__: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter
- __MDN RegExp__: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp

## Testing plan
Add regression tests under `packages/common/logos/test/rules-engine/cache-invalidation.test.ts`.

- __[value change]__ reuses cached runner but reflects updated value:
```ts
import { RootGroup, prepare } from "@beep/logos";
import { addRuleToGroup, updateRuleById } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("prepare() cache reflects updated numeric value", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const r = addRuleToGroup(root, { type: "number", field: "age", op: { _tag: "lt" }, value: 30 });

  const before = prepare(root);
  expect(before({ age: 29 })).toBe(true);
  expect(before({ age: 31 })).toBe(false);

  updateRuleById(root, r.id, { type: "number", field: "age", op: { _tag: "lt" }, value: 40 });

  const after = prepare(root); // should rebuild
  expect(after({ age: 39 })).toBe(true);
  expect(after({ age: 31 })).toBe(true);
  expect(after({ age: 41 })).toBe(false);
});
```

- __[ignoreCase change]__ affects string comparisons:
```ts
test("string ignoreCase change updates cached runner", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const r = addRuleToGroup(root, { type: "string", field: "name", op: { _tag: "in" }, value: "bob", ignoreCase: false });

  const before = prepare(root);
  expect(before({ name: "Bob" })).toBe(false);

  updateRuleById(root, r.id, { type: "string", field: "name", op: { _tag: "in" }, value: "bob", ignoreCase: true });

  const after = prepare(root);
  expect(after({ name: "Bob" })).toBe(true);
});
```

- __[regex change]__ affects `matches` operator:
```ts
test("regex change updates cached runner", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const r = addRuleToGroup(root, { type: "string", field: "name", op: { _tag: "matches", regex: new RegExp("^A.*$") }, value: "" as any, ignoreCase: false });
  const before = prepare(root);
  expect(before({ name: "Alice" })).toBe(true);
  expect(before({ name: "bob" })).toBe(false);

  updateRuleById(root, r.id, { type: "string", field: "name", op: { _tag: "matches", regex: new RegExp("^B.*$") }, value: "" as any, ignoreCase: false });

  const after = prepare(root);
  expect(after({ name: "Alice" })).toBe(false);
  expect(after({ name: "bob" })).toBe(true);
});
```

- __[date comparison change]__ affects temporal rules:
```ts
test("date comparison change updates cached runner", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const r = addRuleToGroup(root, { type: "date", field: "createdAt", op: { _tag: "isAfter" }, value: { _tag: "comparison", value: "2024-01-01T00:00:00Z" } });
  const before = prepare(root);
  expect(before({ createdAt: "2024-06-01T00:00:00Z" })).toBe(true);

  updateRuleById(root, r.id, { type: "date", field: "createdAt", op: { _tag: "isAfter" }, value: { _tag: "comparison", value: "2025-01-01T00:00:00Z" } });

  const after = prepare(root);
  expect(after({ createdAt: "2024-06-01T00:00:00Z" })).toBe(false);
});
```

- __[group logicalOp change]__ affects OR/AND evaluation and must refresh cache:
```ts
import { updateGroupById } from "@beep/logos/crud";

test("group logicalOp change refreshes cache", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  addRuleToGroup(root, { type: "number", field: "age", op: { _tag: "lt" }, value: 30 });
  addRuleToGroup(root, { type: "number", field: "age", op: { _tag: "gt" }, value: 10 });

  const before = prepare(root);
  expect(before({ age: 25 })).toBe(true); // 10 < 25 < 30

  // Flip AND -> OR (use updateGroupById to change root logical op)
  updateGroupById(root, root.id, { logicalOp: "or" });

  const after = prepare(root);
  expect(after({ age: 35 })).toBe(false); // 35 fails both OR branches
  expect(after({ age: 5 })).toBe(false);
  expect(after({ age: 25 })).toBe(true);
});
```

Notes:
- We purposely call `prepare(root)` before and after updates to exercise the cache path.
- In the regex test, `value` is unused by `matches`; cast to `any` to satisfy the `StringRule.Input` shape in tests.

## Acceptance criteria / DoD
- __Correctness__: After any `updateRuleById` or `updateGroupById`, the next `prepare(root)` must compile a fresh runner that respects the new values/config or logicalOp.
- __Fingerprint__: `packages/common/logos/src/internal/fingerprint.ts` no longer uses `rule.id` in the rule part and includes evaluation-relevant fields (incl. regex, ignoreCase, value).
- __Invalidation__: `invalidatePrepared(root)` exists and is invoked from CRUD updates.
- __Tests__: New tests added; all existing tests pass.
- __Quality__: No `any` in library code; new code is typed and pure; serialization is deterministic for RegExp.
- __No public API breakage__ beyond internal export used by in-package code.

## Migration / cleanup
- No migrations required. Confirm no other call sites rely on the old (insufficient) fingerprint semantics.
- Keep `invalidateIdIndex(root)` in updates; it remains useful because we replace object references.

## Quality gates
Ask user to run these commands and wait for their response which should contain the output or whether they all passed:

```bash
pnpm check
pnpm test
```

If anything fails, paste the output in the PR for review.

## Commit plan
- __Commit 1__: feat(logos): strengthen fingerprint to include rule values/config and stabilize regex serialization
- __Commit 2__: feat(logos): export invalidatePrepared and call from CRUD updates to refresh runner cache
- __Commit 3__: test(logos): add cache invalidation regression tests for values, ignoreCase, regex, dates, and logicalOp

Final squash message suggestion:

```
fix(logos): correct runner cache invalidation by strengthening fingerprint and explicitly invalidating on writes

- Fingerprint now includes rule values and operator config (excludes ids), with stable RegExp serialization
- Exported invalidatePrepared(root) and invoked from CRUD updates (updateRuleById, updateGroupById)
- Added regression tests for value, ignoreCase, regex, date, and logicalOp changes
```
