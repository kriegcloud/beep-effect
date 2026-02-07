# CLAUDE.md — `@beep/machine`

Claude-specific working notes for contributors editing `packages/common/machine`.

## Scope
- Package: `@beep/machine`
- Responsibility: schema-first state machine runtime, actor execution, testing harnesses, and persistence adapters.
- Non-goals: domain behavior, platform adapters, or direct slice coupling.

## Required Reading Order
1. `README.md` for package API and examples.
2. `AGENTS.md` for package constraints and contributor checklist.
3. `primer/index.md` for deep concept docs.
4. `src/index.ts` for the canonical public surface.

## Editing Rules
- Keep APIs schema-first: states/events should continue to flow from `State(...)` / `Event(...)`.
- Maintain strict boundaries: no imports from vertical slices or app packages.
- Prefer additive changes to preserve existing machine semantics (`on`, `reenter`, `onAny`, final states, slot build contract).
- Keep persistence abstractions adapter-based; core transition logic must remain deterministic and storage-agnostic.
- Preserve typed ergonomics in public exports and avoid widening to `any`.

## Validation Commands
- `bunx turbo run check --filter=@beep/machine`
- `bunx turbo run test --filter=@beep/machine`
- `bunx turbo run lint --filter=@beep/machine`

## High-Risk Areas
- `src/internal/transition.ts` and `src/actor.ts`: changes can alter runtime transition/execution semantics.
- `src/machine.ts`: generic contracts and `BuiltMachine` constraints can silently break downstream type inference.
- `src/persistence/*`: restore/snapshot semantics and versioning behavior can regress durable actors.

## Output Expectations
- If API shape changes, update `README.md` and relevant files in `primer/`.
- If behavior changes, add or update tests under `test/` (unit + integration as needed).
- Keep examples aligned with Effect import conventions used in this monorepo.
