# Agent Prompts: semantic-web-uri-schema-refactor

> Use these to delegate Phase 1 research outputs. Each agent writes a single output file under `outputs/`.

## codebase-researcher → outputs/codebase-context.md

You are the `codebase-researcher` for `specs/pending/semantic-web-uri-schema-refactor`.

Task: map the current URI module surface and its in-repo consumers so a breaking rewrite can be performed safely.

Write `specs/pending/semantic-web-uri-schema-refactor/outputs/codebase-context.md` containing:

- Current exports and their shapes:
  - `packages/common/semantic-web/src/uri/uri.ts`
  - `packages/common/semantic-web/src/uri/model.ts`
  - `packages/common/semantic-web/src/uri/schemes/index.ts`
  - `packages/common/semantic-web/src/uri/schemes/*`
- Current tests and what behaviors they assert:
  - `packages/common/semantic-web/test/uri/uri.test.ts`
- All import sites of:
  - `@beep/semantic-web/uri`
  - `@beep/semantic-web/uri/*`
  - any local imports from `packages/common/semantic-web/src/uri/*`
- For each import site, list which symbol(s) are used and how (sync/async, default export vs named).
- Enumerate current error flows:
  - where `components.error` is set
  - where exceptions can occur (`try/catch`, `invariant`, implicit throws)
- Enumerate all uses of the IDNA module from within URI code paths and how failures are handled today.

Constraints:

- Do not propose redesigns in this output; this is discovery only.
- Prefer exact file paths and `rg` evidence when possible.

## schema-expert → outputs/schema-utilities.md

You are the `schema-expert` for `specs/pending/semantic-web-uri-schema-refactor`.

Task: find and summarize in-repo Schema-first patterns and utilities relevant to implementing `URI`/`IRI` as `S.Class` and building `URIFromString`/`IRIFromString` with `S.transformOrFail`.

Write `specs/pending/semantic-web-uri-schema-refactor/outputs/schema-utilities.md` containing:

- Useful patterns/utilities in `packages/common/schema` that might help:
  - `DomainName` (`packages/common/schema/src/primitives/network/domain.ts`)
  - `IPv4` / `IPv6` / `IP` (`packages/common/schema/src/primitives/network/ip.ts`)
  - `URLFromString` (`packages/common/schema/src/primitives/network/url.ts`) as a boundary transform reference
- Any semantic-web-local schema utilities already present:
  - `packages/common/semantic-web/src/uri/model.ts` (`URIRegExps` is already an `S.Class`)
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

You are the `effect-researcher` for `specs/pending/semantic-web-uri-schema-refactor`.

Task A: summarize the canonical `transformOrFail` / `ParseResult` patterns from Effect itself.

Write `specs/pending/semantic-web-uri-schema-refactor/outputs/effect-schema-patterns.md` containing:

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

Write `specs/pending/semantic-web-uri-schema-refactor/outputs/effect-module-design.md` containing:

- Patterns to mirror from `.repos/effect/packages/effect/src/*`:
  - public surface vs `internal/*` helpers
  - naming conventions and export shape
  - error surface choices (when to expose `ParseIssue` vs `ParseError`)
  - layering/purity boundaries: `Either` internally, `Effect` at the edge
- Suggest 2-3 modules to copy structural patterns from:
  - `.repos/effect/packages/effect/src/ParseResult.ts`
  - `.repos/effect/packages/effect/src/Encoding.ts`
  - `.repos/effect/packages/effect/src/Brand.ts`

Constraints:

- Keep it tight and implementable.
- Focus on conventions that reduce long-term maintenance risk.

