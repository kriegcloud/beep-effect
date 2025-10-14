# AGENTS.md — `@beep/invariant`

## Purpose & Fit
- Provides the canonical assertion API (`invariant`, `invariant.nonNull`, `invariant.unreachable`) and the shared `InvariantViolation` tagged error.
- Designed for effectful layers: invariants throw schema-backed errors that callers can pattern match and convert into HTTP/Domain failures without leaking platform concerns.
- No I/O, logging, or platform assumptions. Keep metadata small and PII-free so logs/telemetry layers can safely consume violations.

## Surface Overview (`src/`)
- `invariant.ts` — core assertion implementation, dev-mode `BUG:` debugger trigger, helper attachments.
- `error.ts` — `InvariantViolation` tagged error (`effect/Schema` + `Schema.TaggedError`) with message/file/line meta.
- `meta.ts` — schema definition for call metadata (`CallMetadata`, ensures non-empty `file`, non-negative `line`, array `args`).
- `index.ts` — barrels the API for consumers.

## Key Behaviors to Remember
- `BUG:` prefixed messages trigger `debugger` when `NODE_ENV !== "production"`.
- Metadata is trimmed to show `packages/...` suffixes; keep `meta.file` as a repo-relative hint.
- `meta.args` are JSON-stringified defensively; prefer primitives or small serializable objects.
- Helpers call back into `invariant`, so stack traces omit the helper frames when `Error.captureStackTrace` is available.

## Usage Snapshots
- `packages/common/schema/src/custom/String.schema.ts` validates refined strings and throws `InvariantViolation` when Effect schema checks fail.
- `packages/common/schema/src/custom/Json.schema.ts` asserts valid JSONPath inputs before building Effect schemas.
- `packages/common/constants/src/AuthProviders.ts` guards dynamic provider lists before exposing them to the rest of the app.
- `packages/common/utils/src/transformations/enumFromStringArray.ts` keeps enum helpers honest by checking resultant shapes.

## Tooling & Docs Shortcuts
- Tagged error patterns & Schema layering: run `context7__get-library-docs` with `{ "context7CompatibleLibraryID": "/llmstxt/effect_website_llms-small_txt", "topic": "schema" }`.
- Pipeline composition & Option helpers referenced in meta formatters: `effect_docs__get_effect_doc` `{ "documentId": 6585 }` (`effect/Function.pipe`) and `{ "documentId": 4793 }` (`effect/Array.get`).

## Authoring Guardrails
- Namespace all Effect imports (`import * as Str from "effect/String"`, `import * as O from "effect/Option"`, etc.); do not reintroduce native string/array helpers.
- Keep `CallMetadata` schema-aligned: always pass `{ file, line, args }` with values you could expose to logs.
- Messages should be actionable. Use lazy `() => "BUG: ..."` when the message needs formatting, and avoid heavy computations on the fast path.
- Any new helpers must be attached via augmentation on the exported `invariant` function (follow existing typings).
- Never add logging, metrics, or transport logic here—those belong in runtime layers.
- Tests should assert against `InvariantViolation` instances, not raw message strings (stable fields: `file`, `line`, `args`).

## Quick Recipes
```ts
import { invariant, InvariantViolation } from "@beep/invariant";
import * as Effect from "effect/Effect";

// Programmers' BUG guard with metadata
invariant(false, () => "BUG: impossible branch", {
  file: "packages/files/domain/src/SomeModule.ts",
  line: 42,
  args: [],
});

// Combine with Effect error handling
const program = Effect.try({
  try: () => {
    invariant.nonNull(env.token, "missing token", { file: "env.ts", line: 17, args: [env] });
    return env.token;
  },
  catch: (error) =>
    error instanceof InvariantViolation ? error : new Error("unexpected failure"),
});
```

## Verifications
- `bun run test --filter=@beep/invariant` to execute the Vitest suite.
- `bun run check --filter=@beep/invariant` for TypeScript alignment.
- `bun run lint --filter=@beep/invariant` / `bun run lint:fix --filter=@beep/invariant` to maintain Biome rules.

## Contributor Checklist
- [ ] Messages are concise, prefixed with `BUG:` only when appropriate, and avoid PII.
- [ ] Metadata stays serializable and passes `CallMetadata` schema.
- [ ] Helper implementations use Effect collection/string modules—no native iteration.
- [ ] Added or updated tests for new branches or helpers.
- [ ] README or higher-level docs updated if API surface changes.
