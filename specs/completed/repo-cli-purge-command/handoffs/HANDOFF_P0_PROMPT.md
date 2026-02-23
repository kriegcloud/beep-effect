# Repo CLI Purge Command: Orchestrator Prompt

Copy-paste this prompt into a new Codex session.

---

You are executing the spec at:
`specs/pending/repo-cli-purge-command/README.md`

Your mission is to complete the spec phases in order:
1. Parity audit
2. Design
3. Implementation
4. Tests
5. Verification

## Hard Requirements
- Implement a new `purge` command in `@beep/repo-cli` (`tooling/cli`).
- Match the intent of legacy purge behavior in:
  - `.repos/beep-effect/tooling/repo-scripts/src/purge.ts`
- Use Effect v4 patterns and current CLI command architecture.
- Add support for `--lock` (alias `-l`) to optionally remove root `bun.lock`.
- Avoid hardcoded legacy workspace glob patterns; derive workspace directories from current repo configuration.

## Required Deliverables
- `specs/pending/repo-cli-purge-command/outputs/research.md`
- `specs/pending/repo-cli-purge-command/outputs/design.md`
- Implementation and tests in `tooling/cli`

## Key References
- `.repos/beep-effect/tooling/repo-scripts/src/purge.ts`
- `tooling/cli/src/commands/root.ts`
- `tooling/cli/src/index.ts`
- `tooling/cli/test/codegen.test.ts`
- `tooling/cli/test/topo-sort.test.ts`
- `tooling/repo-utils/src/Root.ts`
- `tooling/repo-utils/src/Workspaces.ts`

## Verification Gate
Before handoff completion, run:

```bash
bun run build
bun run check
bun run test
bun run lint:jsdoc
bun run lint
```

Also confirm command registration/help:

```bash
bun run beep purge --help
```
