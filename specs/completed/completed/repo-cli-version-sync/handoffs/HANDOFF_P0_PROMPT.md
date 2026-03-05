# Repo CLI Version Sync: Orchestrator Prompt

Copy-paste this prompt into a new agent session.

---

You are executing the spec at:
`specs/pending/repo-cli-version-sync/README.md`

Your mission is to complete the spec phases in order:
1. Research
2. Design
3. Implementation
4. Tests
5. Verification

## Hard Requirements
- Implement a new `version-sync` command in `@beep/repo-cli` (`tooling/cli`).
- The command detects version drift across `.bun-version`, `package.json` `packageManager`, `.nvmrc`, `.github/workflows/*.yml` `node-version:` fields, and `docker-compose.yml` image tags.
- Three modes: check (default, non-destructive), `--write` (apply fixes), `--write --dry-run` (preview).
- All file edits MUST preserve comments and formatting.
- Use `jsonc-parser` for JSON/JSONC, `yaml` (eemeli/yaml) Document API for YAML, direct string for plain text.
- Use Effect v4 patterns and current CLI command architecture.
- Use `Effect/HttpClient` for upstream version resolution (GitHub API, Docker Hub).
- Network failures must be graceful with `--skip-network` fallback.
- Add `post-merge` Lefthook hook for automatic drift checking.

## Required Deliverables
- `specs/pending/repo-cli-version-sync/outputs/research.md`
- `specs/pending/repo-cli-version-sync/outputs/design.md`
- Implementation and tests in `tooling/cli`
- Lefthook `post-merge` hook addition

## Key References
- `specs/pending/repo-cli-version-sync/README.md` (full spec)
- `tooling/cli/src/commands/root.ts` (command registration)
- `tooling/cli/src/commands/create-package/config-updater.ts` (jsonc-parser pattern to follow)
- `tooling/cli/src/bin.ts` (runtime layer assembly)
- `tooling/cli/test/codegen.test.ts` (test harness pattern)
- `tooling/repo-utils/src/Root.ts` (`findRepoRoot`)
- `lefthook.yml` (existing hook configuration)
- `.bun-version`, `package.json`, `.nvmrc`, `.github/workflows/release.yml`, `docker-compose.yml` (files to sync)
- `.repos/effect-v4/packages/effect/package.json` (confirms `yaml` is Effect peer dep)

## Pattern References
- Existing CLI commands follow `Effect.fn` + `Command`/`Flag` from `effect/unstable/cli`
- Config updates use `jsonc-parser` `modify()` + `applyEdits()` (see `config-updater.ts`)
- Console output via `Console.log`/`Console.error` (testable via `TestConsole`)
- Errors use `S.TaggedErrorClass` from `effect/Schema`
- All Effect v4 coding conventions in root `CLAUDE.md` / `MEMORY.md` apply

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
bun run beep version-sync --help
bun run beep version-sync
```
