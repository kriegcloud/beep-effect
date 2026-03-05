# @beep/repo-configs Agent Guide

## Purpose & Fit
- An library for shared build & tooling configurations

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION, ESLintConfig | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { ESLintConfig, VERSION } from "@beep/repo-configs"
```

## Verifications
- `bunx turbo run test --filter=@beep/repo-configs`
- `bunx turbo run lint --filter=@beep/repo-configs`
- `bunx turbo run check --filter=@beep/repo-configs`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
