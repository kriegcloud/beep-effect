# RFC 3987 IRI Implementation Prompt

Use the block below as a task prompt for another agent run.

```text
Work from the repository root of the current workspace.

Your task is to implement a spec-first, Effect v4, effect/Schema-based RFC 3987 IRI module centered on:

- `packages/common/semantic-web/src/iri.ts`

This file is the canonical public IRI implementation. Treat the work as semantic-web package implementation, not a schema-internal experiment.

You must follow the repo’s local instructions and patterns. In particular:

- Use the repo’s Effect-first schema style and existing monorepo conventions.
- Use local `effect-v4` source as API ground truth before assuming any `effect/Schema` API.
- Reuse existing schema idioms already established in this repo.
- Keep scope internal unless a small integration change is strictly required for correctness or tests.
- Do not do unrelated refactors.

Before coding, do this exploration first and use it as evidence:

1. Read these local references in this order:
   - `specs/pending/expert-memory-big-picture/research/IRI_rfc3987.txt`
   - `.repos/effect-v4/packages/effect/SCHEMA.md`
   - `.repos/effect-v4/packages/effect/src/Schema.ts`
2. Inspect repo-local schema examples and mirror their style where appropriate:
   - `packages/common/schema/src/internal/ProvO/ProvO.ts`
   - `packages/common/schema/src/internal/email.ts`
   - `packages/common/schema/src/internal/ip.ts`
   - `packages/common/schema/test/Prov0.test.ts`
   - `packages/common/schema/test/FilePath.test.ts`
3. Verify every Effect v4 API you intend to use against local source or tests in `.repos/effect-v4`. If an API is not confirmed there, do not assume it exists.
4. Query Graphiti memory at the start of the run if available, using the repo’s required `group_ids` form for `beep-dev`.

Primary objective:

- Implement RFC 3987 syntax support in `iri.ts` in an idiomatic Effect v4 style.
- Produce an internal module surface that is explicit and justified by the RFC, not one opaque regex check.
- At minimum, expose a primary branded `IRI` schema, and add supporting schemas such as `IRIReference` and `AbsoluteIRI` if needed for correctness and RFC alignment.
- Export matching runtime type aliases for non-class schemas using the repo’s naming convention.

What “up to spec” means for this task:

- Treat RFC 3987 section 2.2 ABNF as the normative syntax source.
- Correctly handle internationalized code point classes such as `ucschar` and `iprivate`.
- Respect RFC distinctions such as:
  - `IRI` vs `IRI-reference`
  - absolute vs relative forms
  - `ipath-noscheme` colon restrictions
  - `iprivate` being query-only
  - greedy / first-match-wins implications where relevant
- Do not collapse the RFC into a simplistic URL parser check.

Also perform a broader RFC spike:

- Analyze RFC 3987 sections 3, 4, 5, 6, and 8 and explicitly distinguish:
  - what should be encoded in the schema/module,
  - what should instead be documented as normative behavior, limitations, or follow-up work.
- If IRI-to-URI mapping helpers or schema transformations are warranted and can be implemented cleanly, do so only when justified by the RFC and repo patterns.
- If some RFC requirements are not naturally expressible as pure `Schema` validation, document them clearly in comments or final notes rather than faking compliance.

Hard constraints:

- Do not use `URL.canParse`, `new URL(...)`, or URI-native browser/runtime parsing as proof of RFC 3987 validity.
- Do not claim compliance based on a single unexamined mega-regex.
- Do not invent Effect v4 APIs from memory.
- Do not expand `@beep/schema` public exports unless there is a clear, necessary reason and you can justify it.
- Do not introduce non-Effect-first patterns where an established repo pattern already exists.

Implementation style requirements:

- Prefer established repo conventions such as `S.makeFilterGroup`, `S.brand`, `S.annotate`, `$SchemaId` annotations, and repo-style runtime type aliases.
- Keep error messages and schema annotations meaningful.
- Prefer named, composable building blocks over monolithic unreadable validation.
- If you need helper predicates or tables for RFC character classes, make them explicit and testable.
- Match the repo’s import style and Effect module aliases.
- Follow the repo’s schema-first development rules.

Testing requirements:

- Add focused tests in the `packages/common/schema/test` area.
- Cover at least:
  - valid internationalized IRIs
  - valid relative IRI references
  - `iprivate` accepted in query but rejected elsewhere as appropriate
  - representative `ucschar` edge cases
  - malformed percent-encoding
  - illegal delimiters / whitespace
  - `ipath-noscheme` colon behavior
  - at least one negative control showing a URI-native parser heuristic is insufficient for RFC 3987 compliance
- Prefer tight, readable examples over giant fixture blobs unless fixtures materially help.

Expected deliverables:

1. The implemented `IRI.ts` module.
2. Any narrowly necessary adjacent internal helpers.
3. New or updated tests.
4. A concise final report containing:
   - the exact local Effect v4 source files you used as API evidence,
   - the repo-local schema examples you mirrored,
   - the exact commands you ran,
   - command outcomes,
   - an RFC coverage report:
     - what is implemented directly,
     - what is intentionally documented but not encoded,
     - any remaining gaps or risks.

Verification:

- Run the relevant `@beep/schema` validation commands after editing.
- At minimum, run the package check and the most relevant tests for this work. Use the exact supported command forms from this repo.
- Report exact commands and whether they passed or failed.

Quality bar:

- The result should look like it belongs in this monorepo.
- The implementation must be source-grounded in the local RFC text and local `effect-v4` codebase, not generic training-memory Schema code.
- If you discover a conflict between the RFC and an existing local approximation elsewhere in the repo, note it explicitly rather than silently copying the approximation.
```
