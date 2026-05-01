# Tooling Package Migration Spec

## Target Topology

Tooling packages live under `packages/tooling/<kind>/<name>` and carry top-level
`beep` metadata:

```json
{
  "beep": {
    "family": "tooling",
    "kind": "library"
  }
}
```

Supported tooling kinds are `library`, `tool`, `policy-pack`, and `test-kit`.

## Package Mapping

| Source | Target | Package |
| --- | --- | --- |
| `tooling/repo-utils` | `packages/tooling/library/repo-utils` | `@beep/repo-utils` |
| `tooling/configs` | `packages/tooling/policy-pack/repo-configs` | `@beep/repo-configs` |
| `tooling/test-utils` | `packages/tooling/test-kit/test-utils` | `@beep/test-utils` |
| `tooling/docgen` | `packages/tooling/tool/docgen` | `@beep/repo-docgen` |
| `tooling/cli` | `packages/tooling/tool/cli` | `@beep/repo-cli` |

`@beep/repo-checks` is retired and removed from the workspace graph.

## Acceptance

- Root workspaces discover tooling through `packages/tooling/*/*`.
- `beep create-package --family tooling --kind <kind>` scaffolds target-path
  tooling packages with metadata.
- Root `check`, `lint`, `lint:fix`, and `test --types` retain repo-level quality
  behavior after `@beep/repo-checks` is removed.
- `bun run config-sync:check` passes after the migration.

