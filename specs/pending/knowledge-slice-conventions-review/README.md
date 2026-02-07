# Knowledge Slice Conventions Review Spec

> Review the full `packages/knowledge/*` vertical slice for alignment with repo conventions and Effect best practices, and systematically refactor eligible interfaces into `effect/Schema` classes (`S.Class`) for runtime-safe construction + defaults.

---

## Status

- **State**: Pending
- **Created**: 2026-02-07

## Scope

- `packages/knowledge/domain/**`
- `packages/knowledge/tables/**`
- `packages/knowledge/server/**`
- `packages/knowledge/client/**`
- `packages/knowledge/ui/**`

## Current State (Bootstrapped)

This spec targets an existing vertical slice that already contains substantial behavior and tests (especially in `packages/knowledge/server`). The goal is to align and harden the current implementation, not re-architect it.

The review should assume:
- multiple public surfaces exist (RPC, extraction pipelines, workflow orchestration, GraphRAG)
- changes must be contract-preserving unless explicitly documented
- fixes should be applied incrementally per module with verification evidence (see Phase 1)

### Out Of Scope (Unless Found As Blocking Issues)

- Cross-slice architecture changes outside `packages/knowledge/*`
- Large API redesigns (prefer small, contract-preserving refactors)
- Feature additions unrelated to correctness/robustness/conventions

## Goals

1. **Conventions + Best Practices Audit**
   - Validate the knowledge slice against repo rules:
     - boundaries (`domain -> tables -> server -> client -> ui`)
     - import constraints (`@beep/*` aliases, no cross-slice relative imports)
     - no `any`, no `@ts-ignore`, no unchecked casts
     - schema-safe construction (`@beep/schema`, `effect/Schema`)
     - stable Effect service/layer design
     - test patterns and determinism

2. **Schema Class Refactor Policy**
   - Where a type is a **data model** (not a service contract) and benefits from:
     - defaults via `S.optionalWith(...)`
     - runtime validation via `Schema.decode*`
     - opaque constructors
     - stable codecs (JSON or persistence boundaries)
   - then it should be an `S.Class`.

3. **Evidence-Based Output**
   - Every change category must include:
     - file references
     - test evidence (new or existing)
     - verification commands run and results

## Evidence Format (Required)

When recording evidence in outputs, use this format so reviewers can jump directly to the change:

- Code: `workspace/relative/path/to/file.ts:line` (or absolute path if required by the viewer)
- Test: `workspace/relative/path/to/file.test.ts:line` (or test command + file name)
- Command: the exact `bun ...` command executed
- Result: `PASS/FAIL` with date

Artifacts may capture evidence as a single combined cell (Code/Test/Command/Result) or as split fields:
- Evidence links (Code/Test)
- Verification (Command/Result/Date)

Example evidence cell:
- `packages/knowledge/server/src/Service/DocumentClassifier.ts:136`
- `packages/knowledge/server/test/Service/DocumentClassifier.test.ts:9`
- `bun test packages/knowledge/server/test/Service/`
- `PASS (2026-02-07)`

## Severity Rubric (P0-P3)

- `P0`: correctness/safety issues that can corrupt data, break core workflows, or violate repo boundary rules; must be fixed before proceeding.
- `P1`: robustness and contract risks (runtime decode gaps, unsafe casts, non-deterministic tests, Layer/service wiring hazards); should be fixed in the module pass unless it requires cross-module coordination.
- `P2`: best-practice drift and maintainability issues (inconsistent schema defaults, minor layering/style issues); fix opportunistically or track for Phase 2.
- `P3`: improvements that are nice-to-have and not required for correctness/robustness; defer unless trivial.

## Non-Goals

- Converting every interface blindly to `S.Class`.
  - Some interfaces should remain interfaces (see “Conversion Rules”).

## Key References

- `/home/elpresidank/YeeBois/projects/beep-effect3/AGENTS.md` (repo guardrails)
- `/home/elpresidank/YeeBois/projects/beep-effect3/documentation/PACKAGE_STRUCTURE.md`
- `/home/elpresidank/YeeBois/projects/beep-effect3/documentation/EFFECT_PATTERNS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect3/documentation/patterns/iam-client-patterns.md` (payload and schema class patterns)
- `/home/elpresidank/YeeBois/projects/beep-effect3/packages/common/schema/` (`@beep/schema` surface)

## Conversion Rules (Interface -> S.Class)

### Convert To `S.Class` When

- The type represents **data** that crosses a boundary:
  - RPC request/response payloads
  - LLM structured output
  - persistence (DB, Storage blobs, cache)
  - parsing/decoding from unknown input
- The type wants stable defaults:
  - Prefer `@beep/schema` helpers where available (ex: `BS.MutableHashMap(...)`, `BS.DateTimeUtcFromAllAcceptable`, etc.)
  - `S.optionalWith(S.OptionFromUndefinedOr(X), { default: O.none<X> })`
  - `S.optionalWith(S.String, { default: () => "" })` (use lazy defaults)
- The type benefits from a constructor for tests/fixtures.

### Procedural Checklist (Do This Every Time)

1. Introduce `S.Class` with stable identifier and annotations (if applicable).
2. Update the boundary decode site:
   - Use `Schema.decode*` (Effectful) at the boundary (`unknown` input, Storage JSON, LLM output, RPC payloads).
3. Replace callers to use `new ClassName(...)` constructor where defaults help tests/fixtures.
4. Keep exports stable (avoid breaking public names; prefer replacing an interface with a class of the same name where possible).
5. Add or update at least one test that would fail without:
   - decoding/validation, and/or
   - default handling.
6. Update `specs/pending/knowledge-slice-conventions-review/outputs/SCHEMA_CLASS_REFACTOR_PLAN.md`.
7. Run module-scoped verification and record it in `specs/pending/knowledge-slice-conventions-review/outputs/VERIFICATION_REPORT.md`.

### Known Gotcha: `S.Class.make()` and `Option` Encoding

Some code paths pass decoded `Option` instances (`O.some(...)` / `O.none()`). `S.Class.make()` validates inputs by encoding, which can fail when a field schema is `S.Option(...)` (expects encoded `{ _tag: "Some" | "None" }`) but the caller provides decoded `Option`.

Mitigation:
- Use `S.OptionFromSelf(...)` when the input is already decoded, or
- avoid `.make()` in those paths and instead decode at the boundary and use `new ClassName(...)`.

Reference example:
- `packages/common/schema/src/integrations/files/File.ts`

### Keep As Interface When

- The type is a **service shape** used with `Context.Tag(...)` (service contracts are not data payloads).
- The type is a purely type-level helper / generic constraint / function type.
- The type is a structural type intended for inference only (no runtime validation required).

### Allowed Hybrid

- A class that has methods is allowed when:
  - the schema describes only the state fields
  - methods are pure/computed and do not affect decoding semantics

## Phase Plan

### Phase 0: Scaffolding

- Deliverables:
  - outputs checklist + templates
  - review rubric

### Phase Completion Requirement (Handoffs)

This spec is expected to span multiple sessions, so **handoff documents are mandatory**.

At the end of each phase `P<N>`, the orchestrator must:
- update `handoffs/HANDOFF_P<N>.md` with concrete progress, verification commands/results, and remaining work
- create `handoffs/P<N+1>_ORCHESTRATOR_PROMPT.md` for the next phase (or update it if it already exists)
- create `handoffs/HANDOFF_P<N+1>.md` as the next phase starting point (even if it is only a structured checklist)

If these are not created/updated, the phase is **not** considered complete.

### Phase 1: Module-By-Module Execution (Audit + Fix As You Go)

This spec is executed **module-by-module**, and the orchestrator should apply fixes while stepping through modules (not as a separate “big bang” refactor at the end).

Order:
1. `packages/knowledge/domain`
2. `packages/knowledge/tables`
3. `packages/knowledge/server`
4. `packages/knowledge/client`
5. `packages/knowledge/ui`

For each module:
1. Inventory:
   - exported surfaces
   - cross-package edges (within knowledge slice)
   - interface candidates for `S.Class`
2. Audit:
   - conventions, Effect patterns, schema usage, error/logging patterns
   - test gaps and determinism risks
3. Fix immediately:
   - make the smallest contract-preserving change that closes the finding
   - add or update tests as evidence
4. Verify:
   - run the narrowest passing check/lint/tests relevant to the change
   - record results in `outputs/VERIFICATION_REPORT.md`

Definition of Done (per module):
- [ ] Module write-up exists at `outputs/modules/<module>.md` (see template)
- [ ] `outputs/MODULE_AUDIT_MATRIX.md` row updated to `DONE` with evidence links
- [ ] No new `tsc` errors introduced in the module’s package(s)
- [ ] Lint passes for touched packages (or deltas are documented)
- [ ] Relevant tests pass (new/updated tests included as evidence)
- [ ] `outputs/SCHEMA_CLASS_REFACTOR_PLAN.md` updated when interfaces were converted

Stop Rules / Cross-Module Touch Policy:
- Fix inside the module immediately when:
  - the issue is local and contract-preserving
  - the diff stays within the module boundary, or only touches:
    - `packages/common/schema/**`
    - `packages/common/types/**`
    and the touched knowledge package already depends on that common package (existing `package.json` dependency)
- Promote to Phase 2 (cross-cut) when:
  - the fix requires touching 2+ knowledge modules (ex: domain + server + client) in a coordinated way
  - the refactor risks public surface behavior changes (even if type-compatible)
- Defer (document as follow-up) when:
  - the issue is non-blocking (P2/P3) and lacks immediate testability
  - the change would expand scope beyond “conventions + robustness”

Operational stop rule:
- If a `P0` finding is discovered, pause module traversal until it is fixed and module verification passes.

Escape hatch (common deps):
- Adding a new dependency from a knowledge package to `packages/common/schema` or `packages/common/types` is allowed only when:
  - it is required to fix a `P0`/`P1` issue, and
  - it does not introduce new cross-slice coupling, and
  - the dependency addition is explicitly recorded in the module write-up + verification report.
Otherwise, treat dependency additions as Phase 2 work.

### Phase 2: Cross-Cut Review (After All Modules)

After stepping through all modules, perform a cross-cut review:
- confirm slice boundaries are respected end-to-end
- remove duplicated patterns introduced by incremental fixing
- ensure interface-to-`S.Class` conversions are consistent (defaults, Option handling, `@beep/schema` usage)

### Phase 3: Synthesis (Report + Follow-Ups)

Produce a concrete report and follow-ups:
- prioritized findings (P0-P3) with links to fixes (or TODOs if deferred)
- interface-to-`S.Class` conversions completed vs deferred (with reasons)
- risk assessment + rollback notes

### Phase 4: Implementation + Verification

This phase is expected to be mostly empty if “fix as you go” is followed, but can be used to close any deferred items and re-run full verification.

## Required Outputs

- `outputs/MODULE_AUDIT_MATRIX.md`
- `outputs/CONVENTIONS_AUDIT_REPORT.md`
- `outputs/SCHEMA_CLASS_REFACTOR_PLAN.md`
- `outputs/VERIFICATION_REPORT.md`
- `outputs/AUDIT_ALLOWLIST.md` (exceptions for grep-based audits)
- `outputs/modules/` (one file per module):
  - `outputs/modules/domain.md`
  - `outputs/modules/tables.md`
  - `outputs/modules/server.md`
  - `outputs/modules/client.md`
  - `outputs/modules/ui.md`
- `handoffs/` (required; this spec is expected to span multiple sessions)
  - `handoffs/P<N>_ORCHESTRATOR_PROMPT.md` (one per phase)
  - `handoffs/HANDOFF_P<N>.md` (one per phase)

## Verification (Standard)

Per-module “fast path” (run after each module fix set):

```bash
# Example: domain module
bun run check --filter @beep/knowledge-domain
```

```bash
# Example: tables module
bun run check --filter @beep/knowledge-tables
```

```bash
# Example: server module
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server

bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
bun test packages/knowledge/server/test/Service/
bun test packages/knowledge/server/test/Extraction/
bun test packages/knowledge/server/test/EntityResolution/
bun test packages/knowledge/server/test/GraphRAG/
```

Lint note:
- Lint should be run for any touched knowledge package that defines a `lint` task.
- If lint is intentionally skipped for a touched package, record the rationale in `outputs/VERIFICATION_REPORT.md`.

```bash
# Example: client module
bun run check --filter @beep/knowledge-client
```

```bash
# Example: ui module
bun run check --filter @beep/knowledge-ui
```

Final “full slice” verification (run at spec completion):
		
```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server
bun run check --filter @beep/knowledge-client
bun run check --filter @beep/knowledge-ui

bun run lint --filter @beep/knowledge-domain
bun run lint --filter @beep/knowledge-tables
bun run lint --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-client
bun run lint --filter @beep/knowledge-ui

bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
bun test packages/knowledge/server/test/Service/
bun test packages/knowledge/server/test/Extraction/
bun test packages/knowledge/server/test/EntityResolution/
bun test packages/knowledge/server/test/GraphRAG/
```

## Success Criteria

- `outputs/MODULE_AUDIT_MATRIX.md` has all modules marked `DONE` with evidence links and dates.
- No unresolved `P0`/`P1` findings remain:
  - each is either fixed, or
  - explicitly moved to follow-ups with rationale + risk + owner.
- No new `any`, `@ts-ignore`, or unchecked casts are introduced in `packages/knowledge/**`.
- Every new/updated cross-boundary data model is an `S.Class` (or explicitly documented as “kept interface” with rationale).
- Every interface-to-`S.Class` conversion includes:
  - an explicit decode site (`Schema.decode*` at the boundary), and
  - at least one test that would fail without decoding/defaults.
- All required outputs are fully populated (no remaining `___` placeholders).
- Final “full slice” verification passes and results are recorded in:
  - `outputs/VERIFICATION_REPORT.md`.
