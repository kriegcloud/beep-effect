# @beep/_test-agents-1771987653183 Agent Guide

## Purpose & Fit
- 

## Surface Map
| Module | Key exports | Notes |
| --- | --- | --- |
| `src/index.ts` | `VERSION` | Package entry point |

## Laws
- Follow [standards/effect-laws-v1.md](/home/elpresidank/YeeBois/projects/beep-effect3/standards/effect-laws-v1.md).
- Keep package guidance concise; do not duplicate long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/_test-agents-1771987653183"
```

## Verifications
- `bunx turbo run test --filter=@beep/_test-agents-1771987653183`
- `bunx turbo run lint --filter=@beep/_test-agents-1771987653183`
- `bunx turbo run check --filter=@beep/_test-agents-1771987653183`

## Contributor Checklist
- [ ] New exports include JSDoc (`@since`, `@category` as applicable)
- [ ] Tests added/updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
