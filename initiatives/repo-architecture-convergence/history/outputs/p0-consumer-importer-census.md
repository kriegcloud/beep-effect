# P0 Consumer And Importer Census

## Artifact Status

Scaffolded - execution not started

## Role In Phase Model

This is a required companion artifact for
[p0-repo-census-and-routing-canon.md](./p0-repo-census-and-routing-canon.md).
P0 is not complete until both the primary execution record and this census are
updated from real repo evidence.

## Census Coverage Rules

- Enumerate every moved package family, legacy root, root script, app, and
  direct importer surface that P0 expects downstream phases to touch.
- Cite exact search audits, dependency queries, or command evidence for every
  non-empty consumer set.
- Link temporary holds, compatibility shims, or unresolved routing tensions to
  the live history ledgers.

## Package Family And Legacy Root Census

| Surface or family | Current importers or path consumers | Root consumers or apps | Planned owner phase | Evidence query or command | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `packages/common/*` | Pending execution | Pending execution | Pending execution | Pending execution | Scaffolded | Replace with measured importers and cutover scope. |
| `packages/runtime/*` | Pending execution | Pending execution | Pending execution | Pending execution | Scaffolded | Include runtime package importers and root entrypoints. |
| `tooling/*` | Pending execution | Pending execution | Pending execution | Pending execution | Scaffolded | Record scripts, generators, and config consumers. |
| `.agents/**` | Pending execution | Pending execution | Pending execution | Pending execution | Scaffolded | Include direct path consumers and planned rewrite shape. |
| `.claude/**` | Pending execution | Pending execution | Pending execution | Pending execution | Scaffolded | Capture skill-tree and prompt-asset consumers. |
| `.codex/**` | Pending execution | Pending execution | Pending execution | Pending execution | Scaffolded | Capture agent descriptors, prompts, and test consumers. |

## Importer And Consumer Hotspots

| Surface | Importer or consumer class | Expected cutover proof | Status | Notes |
| --- | --- | --- | --- | --- |
| Package-to-package imports | Pending execution | Pending execution | Scaffolded | Record direct import rewrites needed for moved families. |
| App entrypoints | Pending execution | Pending execution | Scaffolded | List app shells, CLIs, and boot files that anchor migration order. |
| Root scripts and configs | Pending execution | Pending execution | Scaffolded | Include workspace globs, build config, docgen, and repo checks. |
| Legacy filesystem paths | Pending execution | Pending execution | Scaffolded | Record direct path-coupling audits and follow-up phases. |

## Follow-Ups

- Pending execution. Convert unresolved census items into owned follow-ups with
  target phase and validation scope.
