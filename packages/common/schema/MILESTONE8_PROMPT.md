# schema Milestone 8 – Copy/Paste Agent Prompt

Use this prompt verbatim for agents handling Milestone 8 (Level 4: Aggregated Surfaces & Namespace).

```text
You are migrating Milestone 8 – Level 4: Aggregated Surfaces & Namespace for @beep/schema → schema.

Scope:
- `@beep/schema/EntityId/EntityId` → `packages/common/schema/src/identity/entity-id/entity-id.ts`
- `@beep/schema/http/HttpRequestDetails` → `packages/common/schema/src/integrations/http/http-request-details.ts`
- `@beep/schema/index` → `packages/common/schema/src/index.ts`

Tips from the previous milestone:
1. **Effect-only collections.** Stick to Effect utilities everywhere (`A.*`, `Str.*`, `Struct.*`, etc.). No native
   loops, `Object.*`, `new Map`, or `Array.*`.
3. **Docs workflow pending.** The prior agent couldn’t run `bun` commands. Once your environment has `bun`, you must run
   `bun run docs:lint:file`, `bun run docgen`, and `bun run docs:site` for every migrated file so
   `jsdoc-analysis-results.json` and generated docs stay accurate.
4. **Identity plumbing.** Every folder has an `_id.ts`. Import the local `Id` helper (e.g. `import { Id } from "./_id";`)
   for annotations. `SystemSchema`, `EntityId`, and `index` should all use their scoped `Id`.
5. **Read prompts/checklist before editing.** Align with the dependencies and doc requirements recorded in
   `packages/common/schema/MIGRATION_CHECKLIST.md` and prior milestone prompts to avoid re-work.
6. **Respect existing worktree edits.** The repo already has unrelated pending changes. Keep your diff focused on
   Milestone 8 and avoid reformatting unrelated files.

Guardrails:
1. **Effect utilities only.** All array/string/object manipulation must use Effect modules. Native helpers are forbidden.
2. **Annotation identities.** Always import `Id` from the local `_id.ts` and use `Id.annotations(...)` /
   `Id.compose(...)` for identifiers—no raw `Symbol.for` calls.
3. **Dependency-first rule.** If any schema or helper that Milestone 8 depends on is still in `@beep/schema`, migrate
   that dependency first before finalizing the dependent module.
4. **Documentation requirements.** Follow `packages/common/schema/DOCUMENTATION_STRATEGY.md`. Every export (including
   `export type` / `export namespace`) needs a summary, detailed description, compiling `@example`, `@category`,
   `@since 0.1.0`, and `@internal` when applicable.
5. **Checklist discipline.** After migrating each symbol, tick its checkbox in
   `packages/common/schema/MIGRATION_CHECKLIST.md` (Milestone 8 section).

Commands (run from the repo root once `bun` is available—even if `docs:lint:file` reports “No matching TypeScript files
found” for internal paths):
1. `bun run docs:lint:file -- <list of migrated files>` (multiple invocations if needed)
2. `bun run docgen`
3. `bun run docs:site`

Deliverables:
- Migrated schema modules (SystemSchema, EntityId runtime, HttpRequestDetails, index) with
  Effect-compliant helpers and identity-based annotations.
- Updated checkboxes for every Milestone 8 symbol (and any dependencies migrated en route).
- Regenerated documentation artifacts (`packages/common/schema/docs/**` and `docs/schema/**`).
- Handoff summary mentioning any “No matching TypeScript files found” output from `docs:lint:file`.
```
