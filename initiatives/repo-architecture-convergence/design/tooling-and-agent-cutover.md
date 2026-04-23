# Tooling And Agent Cutover

## Operational Workspaces

The architecture convergence program is not limited to product slices. The
repo's operational workspaces actively shape future code, so they must migrate
too.

The important sequencing rule is:

- repo wiring and path rewrites happen before slice cutovers
- tooling package relocation and executable agent-runtime relocation happen
  after slice cutovers prove the new roots

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

Do not move `.claude` or `.codex` as monoliths.

The committed split is file- and subtree-aware and is captured in
`design/agent-runtime-decomposition-matrix.md`.

The destination classes are:

| Source artifact kind | Committed destination |
|---|---|
| portable skills and skill assets | `agents/skill-pack/*` |
| declarative rules and steering packets | `agents/policy-pack/*` |
| runtime-specific declarative config/templates/mappings | `agents/runtime-adapter/claude` or `agents/runtime-adapter/codex` |
| executable hooks, scripts, runtime helpers, package shells, tests, and stateful support code | `packages/tooling/tool/claude-runtime` or `packages/tooling/tool/codex-runtime` |

`agents/runtime-adapter` remains declarative. If a file executes code, shells
out, reads runtime state, or hosts tests, it belongs in tooling instead.

## Cutover Mechanics

The operational cutover order is:

1. inherit the completed enablement gate so root configs no longer encode old
   workspace roots
2. create canonical tooling packages for executable Claude and Codex runtime
   code
3. move root scripts and hook entrypoints to those tooling packages
4. move declarative agent assets into `agents/*` packages with `beep.json`
   metadata
5. update the compatibility ledger for any temporary wrapper scripts or package
   aliases needed during the move
6. delete executable logic from runtime-adapter packages and remove the old
   root workspaces once consumers have moved

## Identity And Packaging Implications

The cutover also updates:

- package identity composers for `claude`, `codex`, tooling packages, and any
  renamed public package surfaces
- root `package.json` scripts that currently point directly into `.claude`
  paths
- `turbo` and quality-task inputs that still watch `.claude` or `.codex` as if
  they were final canonical roots

## Expected Outcome

- operational code lives under `packages/tooling/*`
- portable agent content lives under `agents/*`
- runtime adapters are declarative only
- the old `.claude` and `.codex` workspace roots disappear instead of
  surviving as a second architecture
