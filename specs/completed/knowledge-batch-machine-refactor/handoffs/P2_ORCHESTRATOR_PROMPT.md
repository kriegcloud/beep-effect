# P2 Orchestrator Prompt: Domain Model Refactor

## Session Type: Implementation
## Role: Orchestrator coordinating domain model changes
## Goal: Define @beep/machine State/Event schemas for the batch workflow

---

## Context from P1

Phase 1 produced a design document at `specs/knowledge-batch-machine-refactor/outputs/design-batch-machine.md`. Read this document first - it contains the finalized schema definitions, transition table, guard definitions, and migration plan.

**Key P1 Decisions**:
- Machine events = commands (StartExtraction, DocumentCompleted, Cancel, etc.)
- Domain events (BatchCreated, DocumentStarted, etc.) = side effects via `Slot.Effects` (P3)
- State schemas carry per-variant context (batchId always present, plus state-specific fields)
- Guards: `canRetry`, `hasDocuments`, `isResolutionEnabled`

---

## Phase 2 Objectives

1. Create `BatchMachine.schema.ts` in `packages/knowledge/domain/src/value-objects/`
2. Define `BatchMachineState` with 6 variants using `State()` from `@beep/machine`
3. Define `BatchMachineEvent` with command events using `Event()` from `@beep/machine`
4. Define `BatchMachineGuards` using `Slot.Guards()` from `@beep/machine`
5. Export from `value-objects/index.ts`
6. Verify type checks pass

---

## Implementation Details

### File: `packages/knowledge/domain/src/value-objects/BatchMachine.schema.ts`

```typescript
import { State, Event, Slot } from "@beep/machine"
import * as S from "effect/Schema"

// ─── State Schema ───

export const BatchMachineState = State({
  Pending: {
    batchId: S.String,
  },
  Extracting: {
    batchId: S.String,
    completedDocuments: S.Number,
    totalDocuments: S.Number,
    progress: S.Number,
  },
  Resolving: {
    batchId: S.String,
    progress: S.Number,
  },
  Completed: {
    batchId: S.String,
    totalDocuments: S.Number,
    entityCount: S.Number,
    relationCount: S.Number,
  },
  Failed: {
    batchId: S.String,
    failedDocuments: S.Array(S.String),
    error: S.String,
  },
  Cancelled: {
    batchId: S.String,
    completedDocuments: S.Number,
    totalDocuments: S.Number,
  },
})

export type BatchMachineState = typeof BatchMachineState.Type

// ─── Event Schema ───

export const BatchMachineEvent = Event({
  StartExtraction: {
    documentIds: S.Array(S.String),
    totalDocuments: S.Number,
  },
  DocumentCompleted: {
    documentId: S.String,
    entityCount: S.Number,
    relationCount: S.Number,
  },
  DocumentFailed: {
    documentId: S.String,
    error: S.String,
  },
  AllDocumentsProcessed: {},
  StartResolution: {},
  ResolutionCompleted: {
    mergeCount: S.Number,
  },
  Cancel: {},
  Retry: {},
  Fail: {
    error: S.String,
  },
})

export type BatchMachineEvent = typeof BatchMachineEvent.Type

// ─── Guards ───

export const BatchMachineGuards = Slot.Guards({
  canRetry: { maxRetries: S.Number },
  isResolutionEnabled: {},
})

export type BatchMachineGuards = typeof BatchMachineGuards
```

### Updating Exports

In `packages/knowledge/domain/src/value-objects/index.ts`, add:
```typescript
export * from "./BatchMachine.schema.js"
```

### Adding Dependency

In `packages/knowledge/domain/package.json`, add `@beep/machine` to dependencies.
Update `tsconfig.json` references if needed.

---

## Critical Patterns

1. **Import `State`, `Event`, `Slot` from `@beep/machine`** - NOT from subpaths
2. **Use `S.*` PascalCase constructors** - `S.String`, `S.Number`, `S.Array()`
3. **Export both value and type** - `export const` + `export type` for each schema
4. **Keep existing `BatchState`/`BatchEvent` value objects** - they're used elsewhere; remove them in P3 if appropriate
5. **State variants use `S.String` for IDs** initially - can be refined to branded EntityIds if `@beep/machine` State() supports them

---

## Delegation Strategy

| Agent | Task | Type |
|-------|------|------|
| `effect-code-writer` | Create BatchMachine.schema.ts | Implementation |
| `package-error-fixer` | Fix any type errors | Verification |
| Orchestrator | Update exports, coordinate | Coordination |

---

## Verification

```bash
bun run check --filter @beep/knowledge-domain
```

---

## Success Criteria

- [ ] `BatchMachine.schema.ts` created with State, Event, and Guards schemas
- [ ] All 6 state variants defined with correct fields
- [ ] All 9 event commands defined with correct payloads
- [ ] Guards defined with parameter schemas
- [ ] Exported from `value-objects/index.ts`
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] Existing `BatchState` and `BatchEvent` types still compile

---

## Next Phase
P3 builds the machine in knowledge-server using these schemas.
