# Tooling And Agent Cutover

## Operational Workspaces

The architecture convergence program is not limited to product slices. The
repo's operational workspaces actively shape future code, so they must migrate
too.

The important sequencing rule is:

- repo wiring and path rewrites happen in `P2` before slice cutovers
- shared-kernel and non-slice extraction closes in `P3` before `repo-memory`
  or `editor` migration begins
- the inherited `P2` legacy-root audit is not complete until `.agents`,
  `.aiassistant`, `.claude`, and `.codex` all stop being treated as canonical
  roots in repo wiring, allowlists, and runtime descriptors
- tooling package relocation and executable agent-runtime relocation happen in
  `P6` after the slice cutovers prove the new roots

## Tooling Route Table

| Current workspace | Target route |
|---|---|
| `tooling/cli` | `packages/tooling/tool/cli` |
| `tooling/docgen` | `packages/tooling/tool/docgen` |
| `tooling/repo-checks` | `packages/tooling/tool/repo-checks` |
| `tooling/repo-utils` | `packages/tooling/library/repo-utils` |
| `tooling/configs` | `packages/tooling/policy-pack/repo-configs` |
| `tooling/test-utils` | `packages/tooling/test-kit/test-utils` |
| `packages/_internal/db-admin` | `packages/tooling/tool/db-admin` |
| `infra` | `packages/tooling/tool/infra` unless the architecture is amended explicitly |

This cutover includes package metadata, root scripts, repo checks, `docgen`,
workspace globs, and any package-local tests or fixtures that still encode the
old roots.

## Agent Cutover Rule

Do not move `.agents`, `.aiassistant`, `.claude`, or `.codex` as monoliths.

The committed split is file- and subtree-aware and is captured in
`design/agent-runtime-decomposition-matrix.md`.

The destination classes are:

| Source artifact kind | Committed destination |
|---|---|
| portable skills and skill assets | `agents/skill-pack/*` |
| declarative rules, patterns, and policy overlays | `agents/policy-pack/*` |
| runtime-specific declarative config/templates/mappings/descriptors | `agents/runtime-adapter/<runtime>` |
| executable hooks, scripts, runtime helpers, package shells, tests, and local runtime state | `packages/tooling/tool/*` |
| eval fixtures or scorecards | `packages/tooling/tool/*/test/fixtures` or delete/archive |

`agents/runtime-adapter` remains declarative. If a file executes code, shells
out, reads runtime state, or hosts tests, it belongs in tooling instead.

Runtime-adapter relocation also requires content normalization. A descriptor or
runtime config does not count as migrated if it still hard-codes `.agents`,
`.aiassistant`, `.claude`, or `.codex` filesystem roots. Before the cutover can
close, those references must rewrite to canonical skill ids, policy selectors,
or tooling-owned wrapper entrypoints.

Mixed skill trees must also split nested `agents/*.yml`, `rules/**`, `evals/**`,
and vendored `.git/**` by the decomposition matrix rather than carrying the
mixed subtree forward intact.

## Cutover Mechanics

The operational cutover order is:

1. inherit the completed enablement gate so root configs no longer encode old
   workspace roots, and inherit the completed shared-kernel/non-slice
   extraction so later cutovers do not reintroduce illegal package families
2. create canonical tooling packages for executable Claude and Codex runtime
   code
3. move root scripts and hook entrypoints to those tooling packages
4. move declarative agent assets into `agents/*` packages with `beep.json`
   metadata, splitting mixed skill trees and top-level legacy roots by file
   class and normalizing runtime descriptors away from raw legacy-root paths
5. update `../ops/compatibility-ledger.md` for any temporary wrapper scripts or
   package aliases needed during the move
6. delete executable logic from runtime-adapter packages, move or delete eval
   fixtures without harness ownership, prove runtime-adapter packets no longer
   encode raw legacy roots, and remove the old root workspaces once consumers
   have moved

## Identity And Packaging Implications

The cutover also updates:

- package identity composers for `claude`, `codex`, tooling packages, and any
  renamed public package surfaces
- root `package.json` scripts that currently point directly into `.claude`
  paths
- root lint and quality allowlists such as `cspell.json` and
  `.markdownlint-cli2.jsonc` that still encode `.aiassistant` as a live root
- `turbo` and quality-task inputs that still watch `.agents`, `.aiassistant`,
  `.claude`, or `.codex` as if they were final canonical roots

## Expected Outcome

- operational code lives under `packages/tooling/*`
- portable agent content lives under `agents/*`
- runtime adapters are declarative only
- the old `.agents`, `.aiassistant`, `.claude`, and `.codex` roots disappear
  instead of surviving as a second architecture
