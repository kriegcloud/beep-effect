# db-repo-standardization: Evaluation Rubrics

> Criteria for evaluating spec completion and quality at each phase.

---

## Phase Completion Rubric

| Phase | Gate | Criteria |
|-------|------|----------|
| P1 | Inventory Complete | Every file importing DbRepo types is cataloged; research covers SqlSchema, Model, and S.Class |
| P2 | Design Approved | BaseRepo interface finalized; Method type analyzed; migration order defined |
| P3 | Plan Approved | Ordered file list with specific change descriptions; grouped by slice |
| P4 | Core Refactor Done | Both factory files updated; shared packages build; downstream type errors expected |
| P5 | Migration Done | All consumer files updated; `bun run check` passes or only pre-existing failures |
| P6 | Verified | All quality gates pass: build, check, test, lint |

---

## Quality Checklist

### Type Safety (40%)

- [ ] `BaseRepo` interface fully typed with object inputs and `{ data }` outputs
- [ ] `findById` returns `Option<{ readonly data: Model["Type"] }>`, NOT `{ data: Option<T> }`
- [ ] All method parameters named `payload` consistently
- [ ] `insertManyVoid` accepts `{ readonly items: NonEmptyArray<...> }`
- [ ] No `any` types introduced
- [ ] No `@ts-ignore` or `@ts-expect-error` added
- [ ] Context types propagate correctly through `{ data }` wrapper

### Implementation Correctness (30%)

- [ ] `makeBaseRepo` wraps insert/update results with `Effect.map(data => ({ data }))`
- [ ] `makeBaseRepo` wraps findById with `Effect.map(O.map(data => ({ data })))`
- [ ] `findById`/`delete` destructure `{ id }` from input and pass scalar to SQL schema
- [ ] `insertManyVoid` destructures `{ items }` and passes array to SQL schema
- [ ] Telemetry spans updated with correct attribute access
- [ ] Error mapping preserved (`DatabaseError.$match`)
- [ ] No behavior changes beyond signature reshaping

### Consumer Migration (20%)

- [ ] All server repo implementations updated
- [ ] All service/handler call sites updated
- [ ] All test files updated
- [ ] No files in inventory left unmodified (unless confirmed no change needed)

### Verification (10%)

- [ ] `bun run build` passes
- [ ] `bun run check` passes (or only documented pre-existing failures)
- [ ] `bun run test` passes (or only documented pre-existing failures)
- [ ] `bun run lint:fix && bun run lint` passes
- [ ] Pre-existing failures documented separately

---

## Grading Scale

| Score | Grade | Description |
|-------|-------|-------------|
| 90-100% | A | All gates pass, zero new failures, complete migration |
| 80-89% | B | All gates pass with minor issues, 1-2 files need manual fix |
| 70-79% | C | Core refactor done, some consumers pending |
| 60-69% | D | Core refactor done but significant consumer migration remaining |
| <60% | F | Core refactor incomplete or broken |
