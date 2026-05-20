# Effect-Native Migration

## Status

Phase 0 complete (scaffold, normative SPEC, phased PLAN, and the discovery /
remediation sub-agent templates exist). Phase 1 pending.

## Mission

Migrate native JavaScript `Map`, `Set`, `String`, `Object`, `Date`, `JSON`, and
`Array` usage in first-party `packages/**` and `apps/**` to their Effect-native
counterparts, in accordance with `.claude/skills/effect-first-development/`
(Law #7: "No native `Object/Map/Set/Date/String` helpers in domain logic").

Where a package can depend on `@beep/utils` without creating a cycle, the
migration prefers the `@beep/utils/*` re-export wrappers (`Str`, `Struct`,
`Array`, `DateTime`) over raw `effect/*` imports.

## Approach

This goal is **bootstrapped, not yet executed**. The design was fully resolved
up front (see `research/grilling-notes.md`); the new session runs the phases:

1. **Phase 1** — build per-category symbol inventories of the target modules.
2. **Phase 1.5** — stress-test `PLAN.md` with the `grill-with-docs` skill.
3. **Phase 2** — one discovery agent per in-scope package finds native-usage
   violations.
4. **Phase 3** — one remediation agent per package (topo order) replaces them
   and passes a per-package verification gate.

Fan-out is **one agent per package per phase** (all categories), run in bounded
parallel waves — not one agent per category per package.

## Reading Order

- [SPEC.md](./SPEC.md) — normative source of truth: scope, category→target
  mapping, import-precedence/cycle rule, decision rules, inventory schemas, and
  acceptance gates.
- [PLAN.md](./PLAN.md) — the phased execution plan.
- [ops/manifest.json](./ops/manifest.json) — machine-readable routing metadata.
- [ops/progress.json](./ops/progress.json) — resumable per-package × per-phase
  status manifest.
- [ops/prompts/discovery.agent.md](./ops/prompts/discovery.agent.md) — Phase 2
  per-package discovery template.
- [ops/prompts/remediation.agent.md](./ops/prompts/remediation.agent.md) —
  Phase 3 per-package remediation template.
- [research/grilling-notes.md](./research/grilling-notes.md) — the decisions and
  findings this goal was built from.

## Outputs

- `ops/inventory/symbols/effect-native-<Category>.json` — Phase 1 symbol maps.
- `ops/inventory/usages/<sanitized-package>/<Category>.json` — Phase 2 findings.
- Source edits + per-package commits — Phase 3.
