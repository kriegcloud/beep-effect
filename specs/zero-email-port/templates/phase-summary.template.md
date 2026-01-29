# Phase [N]: [Phase Name] - Summary

## Status: [COMPLETED | IN_PROGRESS | BLOCKED]

## Objectives

- [x] Objective 1 achieved
- [x] Objective 2 achieved
- [ ] Objective 3 (deferred to Phase N+1)

## Packages Created

| Package | Path | Purpose |
|---------|------|---------|
| `@beep/example-domain` | `packages/example/domain/` | Domain models and errors |
| `@beep/example-server` | `packages/example/server/` | RPC handlers and adapters |

## Packages Modified

| Package | Changes |
|---------|---------|
| `@beep/shared-domain` | Added EntityIds for new slice |

## Tests Added

| Test File | Coverage |
|-----------|----------|
| `test/services/ExampleService.test.ts` | Service layer unit tests |
| `test/handlers/ExampleHandler.test.ts` | RPC handler integration tests |

## Key Decisions

### Decision 1: [Title]

**Context**: [Why this decision was needed]

**Options Considered**:
1. Option A - [description]
2. Option B - [description]

**Decision**: Option A

**Rationale**: [Why this option was chosen]

### Decision 2: [Title]

[Same structure as above]

## Open Issues for Next Phase

1. **Issue Title** - [Brief description and what blocks resolution]
2. **Issue Title** - [Brief description]

## Verification Results

```bash
# Type checking
bun run check --filter @beep/example-domain
# Result: PASS

# Tests
bun run test --filter @beep/example-domain
# Result: PASS (X tests, Y assertions)

# Lint
bun run lint
# Result: PASS
```

## Files Changed

```
packages/example/domain/
├── src/
│   ├── models/
│   │   └── Example.ts
│   ├── errors/
│   │   └── ExampleErrors.ts
│   └── index.ts
└── test/
    └── models/
        └── Example.test.ts
```

## Next Steps

1. [Action item for Phase N+1]
2. [Action item for Phase N+1]
3. [Action item for Phase N+1]
