# Agent Prompts: semantic-web-idna-schema-refactor

> Use these to delegate Phase 1 research outputs. Each agent writes a single output file under `outputs/`.

## codebase-researcher → outputs/codebase-context.md

You are the `codebase-researcher` for `specs/completed/semantic-web-idna-schema-refactor`.

Task: map the current IDNA module surface and its in-repo consumers so a breaking rewrite can be performed safely.

Write `specs/completed/semantic-web-idna-schema-refactor/outputs/codebase-context.md` containing:

- Current exports and their shapes:
  - `packages/common/semantic-web/src/idna/index.ts`
  - `packages/common/semantic-web/src/idna/idna.ts`
  - `packages/common/semantic-web/src/idna/errors.ts`
- Current tests and what behaviors they assert:
  - `packages/common/semantic-web/test/idna/idna.test.ts`
- All import sites of:
  - `@beep/semantic-web/idna`
  - `@beep/semantic-web/idna/idna`
  - any local imports from `packages/common/semantic-web/src/idna/*`
- For each import site, list which symbol(s) are used and how (sync/async, default export vs named).
- Enumerate current thrown error cases and how they are triggered (invalid input, overflow, not-basic, etc.).

Constraints:

- Do not propose redesigns in this output; this is discovery only.
- Prefer exact file paths and `rg` evidence when possible.

## schema-expert → outputs/schema-utilities.md

You are the `schema-expert` for `specs/completed/semantic-web-idna-schema-refactor`.

Task: find and summarize in-repo Schema-first patterns and utilities that are relevant to implementing `IDNA` as `S.Class` and building `IDNAFromString` with `S.transformOrFail`.

Write `specs/completed/semantic-web-idna-schema-refactor/outputs/schema-utilities.md` containing:

- Useful patterns/utilities in `packages/common/schema` that might help:
  - branded string patterns
  - string annotation conventions (title/description/examples)
  - any URL/domain/email related schemas
- Concrete examples of `S.transformOrFail` in this repo (explain the pattern, not just the file name):
  - `packages/common/schema/src/primitives/network/url.ts` (`URLFromString`)
  - `packages/shared/domain/src/value-objects/LocalDate.ts` (`LocalDateFromString`)
  - `packages/shared/domain/src/services/EncryptionService/schemas.ts` (`EncryptedStringFromPlaintext`)
- Specifically note:
  - how they set `strict: true`
  - how they construct `ParseResult.ParseIssue` (use of `ParseResult.Type(ast, ...)`, `ParseResult.try`, etc.)
  - where the `ast` comes from and how it is threaded

Constraints:

- Keep it actionable (patterns to copy and why).
- Avoid proposing final API; just collect proven patterns.

## effect-researcher → outputs/effect-schema-patterns.md + outputs/effect-module-design.md

You are the `effect-researcher` for `specs/completed/semantic-web-idna-schema-refactor`.

Task A: summarize the canonical `transformOrFail` / `ParseResult` patterns from Effect itself.

Write `specs/completed/semantic-web-idna-schema-refactor/outputs/effect-schema-patterns.md` containing:

- Key points from `.repos/effect/packages/effect/src/Schema.ts` relevant to:
  - `S.transformOrFail`
  - `ParseResult.ParseIssue` expectations
  - effectful decode/encode patterns
- At least one upstream example of effectful transform usage:
  - `.repos/effect/packages/effect/test/Schema/ParseResultEffectful.test.ts`
- Guidance on mapping:
  - schema failures (`ParseIssue`), and
  - library API failures (`ParseError`)

Task B: capture module design conventions worth mirroring.

Write `specs/completed/semantic-web-idna-schema-refactor/outputs/effect-module-design.md` containing:

- Patterns to mirror from `.repos/effect/packages/effect/src/*`:
  - public surface vs `internal/*` helpers
  - naming conventions and export shape
  - documentation conventions (JSDoc, categories, stable error messages)
- Suggest 2-3 modules to copy structural patterns from:
  - `.repos/effect/packages/effect/src/Encoding.ts`
  - `.repos/effect/packages/effect/src/ParseResult.ts`
  - `.repos/effect/packages/effect/src/Brand.ts`

Constraints:

- Keep it tight and implementable.
- Focus on conventions that reduce long-term maintenance risk.

