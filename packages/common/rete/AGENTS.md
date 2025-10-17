# AGENTS.md — `@beep/rete`

## Purpose & Scope
- Forward-chaining Rete network and ergonomics that power `beep()`—the rule engine façade used by slices that need declarative inference (`apps/*` and `packages/*`).
- Lives in the common layer so it stays UI/runtime agnostic while reusing shared foundations (`@beep/types`, `@beep/utils`, Effect namespaces). Never import slice-specific code.
- Exposes both low-level network primitives for advanced maintainers and a higher-level API plus React bindings for product feature teams.

## Surface Map
- `src/index.ts` — public barrel re-exporting the high-level façade (`beep`, `consoleAuditor`, type contracts, React hooks).
- `core/`
  - `beep.ts` — constructs sessions, wraps low-level Rete operations, and wires condition builders (`conditions`) and production lifecycle (`rule().enact()`).
  - `types.ts` — schema-driven generics defining `ConditionOptions`, `QueryArgs`, `EnactionArgs`, and the `IBeep` contract.
  - `auditor.ts` — thin re-export of network auditing utilities (console streaming / batching).
  - `useRule.ts` — React bindings (`useRule`, `useRuleOne`) that subscribe to productions inside components.
  - `utils.ts` — helpers for turning friendly insertion payloads into internal fact tuples.
- `network/` — canonical Rete implementation (alpha/beta node graph, token propagation).
  - `init-session/`, `init-production/` — session bootstrap, production assembly.
  - `add-conditions-to-production/`, `add-production-to-session/` — alpha/beta wiring helpers used by `beep`.
  - `fire-rules/`, `left-activation/`, `right-activation-with-*` — execution engine; handles recursion guards and rule triggering queues.
  - `query-all/`, `retrieve-fact-value-by-id-attr/`, `subscribe-to-production/` — read/query/subscription surfaces used at runtime.
  - `audit.ts` — enums and console auditor for tracing fact churn and rule firings.
  - `types.ts` — internal graph structures (Alpha/Beta nodes, `TokenKind`, `Field`, `Var`, etc.).
- `test/`
  - `rete/` — Rete core correctness, recursion limit, perf smoke.
  - `lib/usage.test.ts` — end-to-end examples that mirror README snippets.
  - `testingUtils.ts` — reusable schema + session factory for reaching low-level helpers.

## Usage Snapshots
- High-level façade wiring (`beep`, `conditions`, `rule().enact`) — `packages/common/rete/src/core/beep.ts:17`.
- React hook consumption (`useRule`, `useRuleOne`) — `packages/common/rete/src/core/useRule.ts:3`.
- Console auditing for debugging rule cascades — `packages/common/rete/src/network/audit.ts:1`.
- Test harness demonstrating joins & query filters — `packages/common/rete/test/lib/usage.test.ts:12`.

## Tooling & Docs Shortcuts
- Inspect rule authoring across the repo: `jetbrains__search_in_files_by_text` with `{"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","searchText":"beep<","maxUsageCount":50}`.
- Explore alpha/beta wiring quickly: `jetbrains__open_file_in_editor` on `packages/common/rete/src/network/add-conditions-to-production/add-conditions-to-production.ts`.
- Pull Effect documentation on collections/strings before touching helpers: `context7__resolve-library-id` → `context7__get-library-docs` for `/effect-ts/effect` with topics `Array` or `String`.
- For Rete algorithm references, review local primers in `Rete Algorithm.md` and `What is a Rete Network?.md` within this package.

## Authoring Guardrails
- **Effect-first operations**: every array/string/object transform must run through Effect namespaces (`F.pipe` + `A.*`, `Str.*`, `Struct.*`, `Record.*`). Native `.map`, `.split`, `for...of`, etc. are forbidden—treat existing legacy occurrences as debt, never expand them.
- **Schema-driven facts**: the façade relies on `$Schema` definitions (Effect `Struct` fields). Keep additions generic; no domain-coupled schema assumptions or stringly typed IDs.
- **Condition options**: `ConditionOptions` allow `match`, `join`, `then`. `match` and `join` are mutually exclusive—mirror the runtime check in `core/beep.ts` when extending builders. `then: false` suppresses re-triggering on updates; preserve that default behavior.
- **Id/key encoding**: Use `Field.Enum` constants when interacting with low-level helpers (`addConditionsToProduction`, `Var`). Never hardcode numeric enum values or rely on string prefixes other than the documented `$` join convention.
- **Session safety**: `fire` guards against recursion; if you add rule orchestrations ensure they respect `recursionLimit` and avoid inserting facts in infinite loops (`thenFinally` is your escape hatch).
- **Auditing**: Prefer `consoleAuditor(AuditorMode.BATCH)` when debugging cascades. Avoid wiring auditors in production builds unless gated, as they buffer fact payloads.
- **React hooks**: `useRule` / `useRuleOne` assume stable `rule` references; memoize rule creation outside React render loops to prevent resubscription churn.
- **Purity & side-effects**: Core/network code must stay deterministic. Side-effects belong in `then` blocks supplied by consumers. Do not introduce logging, timers, or randomness inside the engine itself.
- **Testing debt**: When adjusting matching behavior, add/extend Vitest coverage under `test/rete` or `test/lib` to capture regressions (joins, filters, subscription semantics, recursion).

## Quick Recipes
```ts
import { beep } from "@beep/rete";
import * as F from "effect/Function";

type InventorySchema = {
  Quantity: number;
  CriticalThreshold: number;
  Status: "GOOD" | "CRITICAL";
  LocationId: string;
};

const session = beep<InventorySchema>(true);
const updateStatus = session
  .rule("Status updater", ({ Quantity, CriticalThreshold, Status }) => ({
    $location: { CriticalThreshold },
    $inventory: {
      LocationId: { join: "$location" },
      Quantity,
      Status: { then: false },
    },
  }))
  .enact({
    then: ({ $inventory, $location }) => {
      const next = $inventory.Quantity <= $location.CriticalThreshold ? "CRITICAL" : "GOOD";
      session.insert({ [$inventory.id]: { Status: next } });
    },
  });

session.insert({
  LocationA: { CriticalThreshold: 12 },
  InventoryA: { LocationId: "LocationA", Quantity: 8, Status: "GOOD" },
});
session.fire();
const result = updateStatus.queryOne();
```

```ts
import { consoleAuditor, AuditorMode, beep } from "@beep/rete";

const auditor = consoleAuditor(AuditorMode.BATCH);
const session = beep<{ X: number; Delta: number }>(false, auditor);

session
  .rule("MoveX", ({ X, Delta }) => ({
    Player: { X: { then: false } },
    Global: { Delta },
  }))
  .enact({
    then: ({ Player, Global }) => session.insert({ Player: { X: Player.X + Global.Delta } }),
    thenFinally: () => auditor.flush(),
  });
```

```tsx
import { useMemo } from "react";
import { beep, useRuleOne } from "@beep/rete";

const session = beep<{ Count: number }>();
const countRule = session
  .rule("counter", ({ Count }) => ({
    Counter: { Count },
  }))
  .enact();

export function Counter() {
  const rule = useMemo(() => countRule, []);
  const match = useRuleOne(rule);
  return <span>{match?.Counter.Count ?? 0}</span>;
}
```

## Verifications
- Repo root (preferred): `bun run lint --filter=@beep/rete`, `bun run check --filter=@beep/rete`, `bun run test --filter=@beep/rete`.
- Package local: `bun run lint`, `bun run check`, `bun test`, `bun run coverage` (from `packages/common/rete`).
- Watch build while iterating on low-level code: `bun run dev` (TypeScript project references).

## Contributor Checklist
- [ ] API changes mirrored in `src/index.ts` and documented in README snippets (`Rete Algorithm.md`, `What is a Rete Network?.md`) when applicable.
- [ ] No native collection/string helpers introduced; Effect namespaces + `F.pipe` everywhere.
- [ ] Added/updated Vitest coverage capturing joins, recursion limits, and subscription behavior for your change.
- [ ] Verified rule builders reject invalid `join`/`match` combos when expanding condition DSL.
- [ ] Considered auditor impact (disabled or guarded in production paths).
- [ ] Ran `bun run check --filter=@beep/rete` and `bun run test --filter=@beep/rete` (or package-local equivalents).
