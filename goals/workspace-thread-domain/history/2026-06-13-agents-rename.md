# Agents Rename Evidence

Date: 2026-06-13
Agent: Codex

## Scope

P1 implementation slice for the legacy `agent-capability` to `agents` rename.

## Implemented

- Moved `packages/agent-capability/{domain,use-cases}` to
  `packages/agents/{domain,use-cases}`.
- Renamed public packages to `@beep/agents-domain` and
  `@beep/agents-use-cases`.
- Renamed identity composers to `$AgentsDomainId` and `$AgentsUseCasesId`.
- Renamed shared identity subpath from
  `@beep/shared-domain/identity/AgentCapability` to
  `@beep/shared-domain/identity/Agents`.
- Updated dependent package imports, tsconfig aliases, workspace metadata,
  the professional runtime proof app, and the professional desktop slice label.
- Amended `goals/agentic-professional-runtime/SPEC.md` to use the `agents`
  slice name and package paths.

## Verification

```sh
bun install

bun run --cwd packages/agents/domain check
bun run --cwd packages/agents/domain test
bun run --cwd packages/agents/domain lint
cd packages/agents/domain && bunx tstyche dtslint/AgentsDomain.tst.ts

bun run --cwd packages/agents/use-cases check
bun run --cwd packages/agents/use-cases test
bun run --cwd packages/agents/use-cases lint
cd packages/agents/use-cases && bunx tstyche dtslint/ProfessionalRuntime.tst.ts

bun run --cwd packages/shared/domain check
bun run --cwd packages/shared/domain test
bun run --cwd packages/shared/domain lint
cd packages/shared/domain && bunx tstyche dtslint/IdentityNamespaces.tst.ts

bun run --cwd packages/foundation/modeling/identity check
bun run --cwd packages/foundation/modeling/identity test
bun run --cwd packages/foundation/modeling/identity lint
cd packages/foundation/modeling/identity && bunx tstyche dtslint/Identity.tst.ts

bun run --cwd apps/professional-runtime-proof check
bun run --cwd apps/professional-runtime-proof test
bun run --cwd apps/professional-runtime-proof lint
cd apps/professional-runtime-proof && bunx tstyche dtslint/ProfessionalRuntimeProof.tst.ts

bun run --cwd apps/professional-desktop check
bun run --cwd apps/professional-desktop test
bun run --cwd apps/professional-desktop lint
```

All commands passed.
