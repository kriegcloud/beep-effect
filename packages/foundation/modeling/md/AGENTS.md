# @beep/md Agent Guide

## Purpose & Fit
- An Effect native markdown library

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION, `Md`, models, render adapters, utilities | package entry point |
| `Md.model` | schema-first AST nodes | schema is the source of truth |
| `Md` | builder DSL | text, block, list, table, and embed constructors |
| `Md.render` | Markdown, HTML fragment, and plain-text adapters | prefer Result-returning helpers at boundaries |
| `Md.utils` | escaping, URL sanitation, block formatting | keep low-level helpers schema-backed where practical |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { Md, renderPlainTextUnsafe } from "@beep/md"

const doc = Md.make([Md.h1("Hello")])
console.log(renderPlainTextUnsafe(doc))
```

## Verifications
- `bunx turbo run test --filter=@beep/md`
- `bunx turbo run lint --filter=@beep/md`
- `bunx turbo run check --filter=@beep/md`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
