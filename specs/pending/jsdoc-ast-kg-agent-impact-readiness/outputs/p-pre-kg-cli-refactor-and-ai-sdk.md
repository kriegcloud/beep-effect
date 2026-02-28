# PRE KG CLI Refactor and AI SDK Integration

## Status

PENDING

## Required Content

1. `tooling/cli/src/commands/kg.ts` modularization map with target files and responsibilities.
2. Effect-first coding rules for refactor implementation.
3. Typed tooling error model contract (schema-based, no untyped throws).
4. Claude benchmark executor migration plan to `@beep/ai-sdk`.
5. Pre/post behavior parity verification matrix.

## Suggested Module Split

- `tooling/cli/src/commands/kg/constants.ts`
- `tooling/cli/src/commands/kg/types.ts`
- `tooling/cli/src/commands/kg/indexing.ts`
- `tooling/cli/src/commands/kg/publish.ts`
- `tooling/cli/src/commands/kg/verify.ts`
- `tooling/cli/src/commands/kg/parity.ts`
- `tooling/cli/src/commands/kg/replay.ts`
- `tooling/cli/src/commands/kg/io-boundary.ts`
- `tooling/cli/src/commands/kg/index.ts`

## Output Checklist

- [ ] Module split is complete and sequenced.
- [ ] Effect-first rules are explicit.
- [ ] AI SDK integration path is explicit.
- [ ] Verification matrix is explicit.
