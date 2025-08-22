# @beep/logos — Schema‑driven Rules Engine

A small, composable, schema‑driven rules engine built on Effect Schema. Rules and groups are serializable data structures that can be validated, normalized, compiled into fast runner functions, and executed against arbitrary input values.

- Strong runtime validation via `effect/Schema`
- Deterministic, synchronous evaluation (no side effects in rule checks)
- Efficient execution via a compiled runner and caching keyed by a structural fingerprint
- Convenient CRUD helpers and an internal O(1) ID index for large trees

This README documents the architecture, public APIs, and performance model, and outlines where Effect Schema's concurrency and batching annotations could be applied in the future.


## Contents

- Overview
- Data model (entities, rules, groups)
- Operators
- Public API and usage
- Execution model (prepare/runner)
- Validation and normalization
- CRUD and ID index
- Performance model and caching
- Concurrency and batching (Effect / Schema) — opportunities
- Testing notes


## Overview

The engine evaluates a tree of logical groups and rules against an input object. Each rule references a field and an operator and compares it to a provided value. Groups combine child results using `and` or `or`.

Key modules:
- `src/rules.ts` — rule schemas and pure validation logic per rule type
- `src/operators.ts` — operator schemas (IDs + config)
- `src/ruleGroup.ts` — `RuleGroup` and `RootGroup` schemas
- `src/prepare.ts` — compilation to an optimized runner, runner cache, and `runPrepared`
- `src/run.ts` — convenience `run(group, value)`
- `src/normalize.ts` — structure normalization
- `src/validate.ts` — preflight validation of root groups
- `src/crud.ts` — add/update/remove helpers; fast ID index
- `src/internal/*` — shared primitives (`Entity`, `makeRule`, `idIndex`, `fingerprint`)


## Data model

Entities are created with `internal/Entity.ts`:

```ts
// entity shape: { entity: NameLiteral, id: UUID, ...fields }
export const EntityId = S.UUID;
export namespace Entity {
  export const make = (name, fields) => S.Struct({ entity: S.Literal(name), id: EntityId, ...fields });
}
```

Groups are recursive and mutable (for efficient updates):

```ts
// src/ruleGroup.ts
export const RuleGroup = Entity.make("group", {
  parentId: EntityId,
  logicalOp: Operators.LogicalOp, // "and" | "or"
  rules: S.mutable(S.Array(S.Union(Rule, S.suspend(() => RuleGroup))))
});

export const RootGroup = Entity.make("root", {
  logicalOp: Operators.LogicalOp,
  rules: S.mutable(S.Array(S.Union(Rule, RuleGroup)))
}).pipe(S.mutable);
```

Rules are modeled per domain (string/number/array/date/generic, etc.) with schemas and a corresponding pure `validate()` function. All rule validators return boolean and are side‑effect free.

```ts
// Example: StringRule (src/rules.ts)
export namespace StringRule {
  export const { Rule, Input } = makeRule("string", {
    field: S.String,
    op: S.Union(
      Operators.Eq.Schema,
      Operators.Ne.Schema,
      Operators.In.Schema,
      Operators.NotIn.Schema,
      Operators.StartsWith.Schema,
      Operators.NotStartsWith.Schema,
      Operators.EndsWith.Schema,
      Operators.NotEndsWith.Schema,
      Operators.Matches.Schema
    ),
    value: S.String,
    ignoreCase: S.Boolean
  });

  export const validate = (rule: Input, value: string): boolean => { /* ... */ };
}
```


## Operators

Operators are defined via `internal/Operator.ts` and exported in `src/operators.ts`:

- Equality & containment: `Eq`, `Ne`, `In`, `NotIn`, `Every`
- String prefix/suffix & regex: `StartsWith`, `NotStartsWith`, `EndsWith`, `NotEndsWith`, `Matches`
- Numeric comparison: `Gt`, `Gte`, `Lt`, `Lte`
- Temporal ordering (Date rule): `IsBefore`, `IsAfter`, `IsBetween`
- Type guards & truthiness: `IsString`, `IsNumber`, `IsTruthy`, etc.
- Presence/definedness: `IsNull`, `IsUndefined`, etc.
- Logical operator for groups: `LogicalOp = S.Literal("and", "or")`

Each operator exposes:
- `op` — string literal operator ID
- `Schema` — Effect Schema for the operator payload `{ _tag, ...config }`


## Public API and usage

Barrel exports in `src/index.ts`:

```ts
export * from "./createRootGroup";        // createRootGroup(newGroup)
export * from "./crud";                   // add/update/find helpers
export { EntityId } from "./internal/Entity";
export * from "./normalize";              // normalize(group, options?)
export * from "./operators";              // operator namespaces
export { prepare, runPrepared } from "./prepare"; // compile & run with cache
export * from "./ruleGroup";              // RuleGroup, RootGroup, GroupInput
export * from "./rules";                  // rule namespaces & validators
export * from "./types";                  // unions for Rule/Group types
export * from "./validate";               // validate(root)
```

Typical usage:

```ts
import { createRootGroup, addRuleToGroup, Operators, prepare } from "@beep/logos";

const root = createRootGroup({ logicalOp: "and" });

addRuleToGroup(root, {
  entity: "rule", // inferred by encoder in addRuleToGroup
  field: "name",
  op: { _tag: Operators.In.op },
  value: "Acme",
  ignoreCase: true,
  type: "string"
});

const runner = prepare(root); // validates once, normalizes, compiles & caches

runner({ name: "  acme  " }); // => true
runner({ name: "Other" });    // => false
```

Alternatively, one‑off:

```ts
import { run } from "@beep/logos";
run(root, { name: "Acme" });
```


## Execution model (prepare/runner)

`src/prepare.ts` compiles the tree into small, fast functions (`Runner = (value) => boolean`).

- Precompute a fast field accessor per rule (`Record.get(field)` with Option safety)
- Compile rules into pure boolean checks using the rule‐specific `validate()`
- Compile groups into tight loops with short‑circuiting:
  - `and`: return false on first false
  - `or`: return true on first true

Caching:
- The compiled runner is cached in a `WeakMap<RootGroup, { fp, runner }>`
- Cache key uses a structural `fingerprint` of the root (see `src/internal/fingerprint.ts`)
- If the fingerprint changes, a new runner is compiled and cached

`runPrepared(root, value)` is a small helper around `prepare(root)(value)`.


## Validation and normalization

- `validate(root)` uses `S.encodeEither(RootGroup)` and formats errors via `ParseResult.ArrayFormatter`
- `normalize(group, options?)` cleans and stabilizes structure:
  - Optionally remove failed validations
  - Drop empty groups
  - Promote single‑rule groups
  - Ensure `parentId` consistency
  - Mutates arrays in place for performance and predictable references

`prepare(root)` applies `validate` and `normalize` once before compiling.


## CRUD and ID index

`src/crud.ts` provides helpers:
- `findAnyById`, `findRuleById`, `findGroupById`
- `addRuleToGroup`, `addGroupToRoot`, `addAnyToGroup`
- `addManyToGroup`, `addRulesToGroup`, `addGroupsToRoot`
- `updateRuleById`, `updateGroupById`, `removeAllById`

Fast lookups are powered by `src/internal/idIndex.ts`:
- Builds an index of `byId`, `parentOf`, `indexInParent` with a fingerprint
- Exposed helpers: `getIdIndex(root)`, `invalidateIdIndex(root)`, `find*Fast`
- `update*ById` use O(1) parent/slot resolution via the index and then invalidate


## Performance model and caching

Hot paths the engine optimizes:
- Avoid per‑call schema validation; validate once in `prepare()`
- Normalize once to simplify the runtime traversal
- Tight loops for `and`/`or` with short‑circuit
- Precomputed field accessors and pure rule validators
- Runner cache keyed by structural fingerprint (auto‑GC via `WeakMap`)

See also: internal `fingerprint` and `idIndex` modules.

## Testing notes

Tests live under `packages/common/logos/test/rules-engine/`. They demonstrate intended behavior across operators, rule types, and group composition. Use them as examples for payload shape and engine expectations.


## Appendix: Export surface

- `createRootGroup(newGroup)` — create a new root group
- `prepare(root)` / `runPrepared(root, value)` — compile & run with caching
- `run(group, value)` — convenience runtime (root uses `prepare`, nested validates then compiles once per call)
- `normalize(group, options?)` — restructure tree for efficient execution
- `validate(root)` — preflight schema validation
- `operators` — operator IDs and schemas
- `rules` — rule schemas and pure boolean validators per rule type
- `crud` — helpers for add/update/remove/find (with ID index support)
- `types` — helpful unions for Rule/Group typing


## Roadmap (future work)

- Optional effectful runner (`prepareEffect`) with configurable concurrency/batching
- Granular schema annotations for validation concurrency in large trees
- Benchmarks (tinybench) and PERFORMANCE.md updates as features evolve
- Document the ID index and fingerprint strategies in a dedicated performance guide
