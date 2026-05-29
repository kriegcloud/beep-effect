# @beep/repo-configs Agent Guide

## Purpose & Fit
- Shared docs-lane tooling configuration and governance data for this repo

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION, DocsESLintConfig | package entry point |
| governance data | allowlist snapshot, native-runtime hotspots | shared by repo-local governance commands |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { DocsESLintConfig, VERSION } from "@beep/repo-configs"
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
