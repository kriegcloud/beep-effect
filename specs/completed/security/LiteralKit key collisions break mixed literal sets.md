# Status
fixed on current branch

## Outcome
`LiteralKit` now validates helper-key uniqueness during construction and throws a typed `LiteralKitKeyCollisionError` instead of silently overwriting colliding literals.

## Evidence
- Code: `packages/common/schema/src/LiteralKit.ts`
- Tests: `packages/common/schema/test/LiteralKit.test.ts`
- Verification: `bunx tsc -p packages/common/schema/tsconfig.json --noEmit`
- Verification: `bunx --bun vitest run packages/common/schema/test/LiteralKit.test.ts`
