# Handoff: Phase 2 - Domain Model Refactor

## Tier 1: Critical Context

### Phase Goal
Define `@beep/machine` State and Event schemas for the batch workflow in `knowledge-domain`. Build the machine definition with guards. Update domain exports.

### Immediate Next Steps
1. Create `BatchMachine.schema.ts` with State and Event schemas in knowledge-domain
2. Define `Slot.Guards` for transition preconditions
3. Update `value-objects/index.ts` to export new schemas
4. Verify `bun run check --filter @beep/knowledge-domain` passes

### Blocking Issues
- P1 design document must be complete (contains schema definitions)

### Open Questions
- Confirm final field types for each state variant (use branded EntityIds where applicable)

## Tier 2: Execution Checklist

### Task 1: Define State Schema
- [ ] Create `packages/knowledge/domain/src/value-objects/BatchMachine.schema.ts`
- [ ] Define `BatchMachineState` using `State()` from `@beep/machine`
- [ ] Include all 6 variants: Pending, Extracting, Resolving, Completed, Failed, Cancelled
- [ ] Use branded EntityIds for `batchId`, `documentId` fields

### Task 2: Define Event Schema
- [ ] Define `BatchMachineEvent` using `Event()` from `@beep/machine`
- [ ] Include command events: StartExtraction, DocumentCompleted, DocumentFailed, AllDocumentsProcessed, StartResolution, ResolutionCompleted, Cancel, Retry, Fail

### Task 3: Define Guards Schema
- [ ] Define `BatchMachineGuards` using `Slot.Guards()` from `@beep/machine`
- [ ] Guards: `canRetry`, `hasDocuments`, `isResolutionEnabled`

### Task 4: Update Domain Exports
- [ ] Export new schemas from `value-objects/index.ts`
- [ ] Ensure backward compatibility with existing `BatchState` and `BatchEvent` types

### Task 5: Type Check
- [ ] Run `bun run check --filter @beep/knowledge-domain`

### Verification
- Domain package compiles
- State schema has 6 variants matching current `BatchState`
- Event schema covers all transition commands
- Guard schemas defined with parameter types

## Tier 3: Technical Details

### File Locations
- New: `packages/knowledge/domain/src/value-objects/BatchMachine.schema.ts`
- Modified: `packages/knowledge/domain/src/value-objects/index.ts`

### Key Pattern
```typescript
import { State, Event, Slot } from "@beep/machine"
import * as S from "effect/Schema"

export const BatchMachineState = State({
  Pending:    { batchId: S.String },
  Extracting: { batchId: S.String, completedDocuments: S.Number, totalDocuments: S.Number, progress: S.Number },
  // ...
})

export const BatchMachineEvent = Event({
  StartExtraction: { documentIds: S.Array(S.String) },
  DocumentCompleted: { documentId: S.String, entityCount: S.Number, relationCount: S.Number },
  // ...
})
```

### Dependencies
- `@beep/machine` (new dependency for knowledge-domain)
- Existing `BatchState`, `BatchEvent` types remain for backward compatibility

## Tier 4: Historical Context

### From P1
- Design document at `outputs/design-batch-machine.md` contains final schema definitions
- Machine events are commands (not domain events)
- Domain events emitted via effects in P3

## Context Budget

| Tier | Estimated Tokens | Budget |
|------|-----------------|--------|
| Working (Tier 1) | ~300 | 2,000 |
| Episodic (Tier 2) | ~500 | 1,000 |
| Semantic (Tier 3) | ~300 | 500 |
| Procedural (Tier 4) | ~100 | Links only |
| **Total** | **~1,200** | **4,000** |
