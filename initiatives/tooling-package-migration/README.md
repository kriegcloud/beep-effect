# Tooling Package Migration

This initiative migrates repo tooling packages from the legacy flat `tooling/*`
layout into the target non-slice family topology:

```text
packages/tooling/<kind>/<name>
```

The migration follows the completed foundation package migration pattern: make
automation topology-aware first, move packages in dependency order, retire
non-canonical script-only packages, then run the repo-defined quality gates.

## Decisions

- `@beep/repo-checks` is retired. Its root quality behavior belongs in
  `@beep/repo-cli`, not in a script-only pseudo-package.
- `@beep/docgen` is renamed to `@beep/repo-docgen`.
- No compatibility shims remain under top-level `tooling/*`.
- Active configs, tests, package docs, inventories, and reusable scripts are
  updated. Historical generated initiative outputs remain historical snapshots.

