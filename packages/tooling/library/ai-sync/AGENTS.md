# @beep/ai-sync Agent Guide

## Purpose & Fit
- Schema-first AI agent configuration schemas, source metadata, drift checks,
  and validated transforms for repo-facing AI coding agent configuration.
- This is a tooling library, not a CLI package, file fanout tool, or agent
  runtime controller.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| schemas | `CodexConfig`, `ClaudeMcpJson`, `ClaudeSettings`, `AgentSkillFrontmatter`, `AgentInstructionDocument` | Native and shared V1 config schemas. |
| metadata | `TIER_ONE_SOURCES`, `V1_SCHEMA_COVERAGE`, `GENERATED_TIER_ONE_SOURCE_METADATA` | Source pins, support matrix, and committed Tier-1 hashes. |
| drift | `checkGeneratedArtifacts`, `checkStrictDrift`, `checkSourceDriftWithFetcher` | Local offline and strict network drift checks. |
| transforms | `codexMcpServersToClaudeMcpJson`, `claudeMcpJsonToCodexConfig`, `claudeMcpJsonToJunieMcpJson`, `junieMcpJsonToClaudeMcpJson`, `normalizeInstructionDocument`, `normalizeAgentSkillFrontmatter` | Only supported where V1 evidence says semantics are real. |
| validation | `validateRepoConfig`, `validateDogfoodConfig`, `validateCurrentCheckoutDogfood` | Repo-local config validation with typed `AiSyncError` failures. |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Keep unsupported and undocumented cells explicit as `na` or
  `unknown_schema`; do not model closed-source native shapes by guesswork.
- Keep package-local `check` offline. Use `drift --strict` for network checks.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/ai-sync` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { validateRepoConfig } from "@beep/ai-sync"

console.log(validateRepoConfig)
```

## Verifications
- `bun run --cwd packages/tooling/library/ai-sync generate`
- `bun run --cwd packages/tooling/library/ai-sync drift --strict`
- `bunx turbo run test --filter=@beep/ai-sync`
- `bunx turbo run test:integration --filter=@beep/ai-sync`
- `bunx turbo run lint --filter=@beep/ai-sync`
- `bunx turbo run check --filter=@beep/ai-sync`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
