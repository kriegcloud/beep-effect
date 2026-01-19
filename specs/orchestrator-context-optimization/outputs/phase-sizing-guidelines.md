# Phase Sizing Guidelines

## Purpose

Define constraints to prevent context exhaustion from unbounded phases. These guidelines ensure phases are scoped appropriately for single-session completion.

## Hard Limits

| Metric | Maximum | Recommended | Rationale |
|--------|---------|-------------|-----------|
| Work items per phase | 7 | 5-6 | Beyond 7 items, orchestrator loses track of state |
| Sub-agent delegations per phase | 10 | 6-8 | Each delegation requires synthesis overhead |
| Direct orchestrator tool calls | 20 | 10-15 | Reserve headroom for handoff creation |
| Large file reads (>200 lines) | 5 | 2-3 | Large files consume significant context |
| Expected sessions per phase | 2 | 1 | Multi-session phases increase handoff overhead |

## Work Item Classification

### Small Work Items (1-2 tool calls, 0-1 delegations)

Examples:
- Read a single configuration file
- Check if a file/directory exists
- Verify build output
- Simple file existence check

**Guideline**: A phase can have 6-7 Small items

### Medium Work Items (3-5 tool calls, 2-3 delegations)

Examples:
- Analyze a single module's patterns
- Create a simple schema file
- Update an existing service
- Write a single test file

**Guideline**: A phase can have 3-4 Medium items

### Large Work Items (6+ tool calls, 4+ delegations)

Examples:
- Implement a complete service layer
- Create a full test suite
- Refactor a major component
- Implement a complex feature

**Guideline**: A phase should have at most 2 Large items

## Phase Complexity Calculation

Calculate phase complexity score:
- Small item: 1 point
- Medium item: 2 points
- Large item: 4 points

**Phase complexity limits**:
- Green: 1-10 points (healthy phase size)
- Yellow: 11-14 points (at risk, consider splitting)
- Red: 15+ points (MUST split)

**Example calculation**:
```
Phase 2: Extraction Pipeline
- Implement EntityService (Large: 4 points)
- Implement RelationService (Large: 4 points)
- Write unit tests (Medium: 2 points)
- Create barrel exports (Small: 1 point)
- Update package index (Small: 1 point)

Total: 12 points → Yellow Zone → Consider splitting
```

## Phase Split Triggers

A phase MUST be split into sub-phases when ANY of these conditions are met:

### Trigger 1: Item Count
- Phase has 8+ work items → MUST split

### Trigger 2: Large Item Concentration
- Phase has 3+ Large work items → MUST split

### Trigger 3: Duration Estimate
- Estimated duration exceeds 2 sessions → MUST split

### Trigger 4: Complexity Score
- Complexity score reaches 15+ points → MUST split

### Trigger 5: Domain Crossing
- Phase scope crosses multiple unrelated domains → SHOULD split

## Split Naming Convention

When splitting phases, use alphabetic suffixes:

**Original**:
```
Phase 2: Extraction Pipeline
```

**Split into**:
```
Phase 2a: Extraction Core
Phase 2b: Extraction Advanced
```

**Multiple splits**:
```
Phase 3a: Service Layer - Core
Phase 3b: Service Layer - Extended
Phase 3c: Service Layer - Integration
```

## Examples

### TOO LARGE (Split Required)

```markdown
## Phase 2: Full Implementation

### Work Items
1. Implement EntityService
2. Implement RelationService
3. Implement ExtractionService
4. Implement GrounderService
5. Write unit tests for Entity
6. Write unit tests for Relation
7. Write unit tests for Extraction
8. Write unit tests for Grounder
9. Create barrel exports
10. Add observability logging

**Analysis**: 10 items (exceeds 7 max), 4 Large items (exceeds 2 max)
**Verdict**: MUST SPLIT
```

### CORRECTLY SIZED

```markdown
## Phase 2a: Core Services

### Work Items
1. Implement EntityService (delegate: effect-code-writer)
2. Implement RelationService (delegate: effect-code-writer)
3. Write unit tests (delegate: test-writer)
4. Verify: bun run check --filter @beep/knowledge-server
5. Create checkpoint handoff

**Analysis**: 5 items, 2 Large items, 4 delegations
**Complexity**: 4 + 4 + 2 + 1 + 1 = 12 points (Yellow but acceptable)
**Verdict**: ACCEPTABLE
```

```markdown
## Phase 2b: Extended Services

### Work Items
1. Implement ExtractionService (delegate: effect-code-writer)
2. Implement GrounderService (delegate: effect-code-writer)
3. Write integration tests (delegate: test-writer)
4. Add observability (delegate: effect-code-writer)
5. Final verification and handoff

**Analysis**: 5 items, 3 Large items (borderline)
**Complexity**: 4 + 4 + 4 + 2 + 1 = 15 points (Red - consider further split)
**Verdict**: Consider splitting into 2b and 2c
```

## Edge Cases

### What if a phase naturally needs 8 items?

Split it. Even if items seem tightly coupled, splitting prevents context exhaustion. Use clear handoff documentation to maintain continuity.

### What if a single item is extremely large?

Break the item into sub-items. A "Large" item that would take 20+ tool calls should become its own phase or be broken into multiple Medium items.

### What about research-heavy phases?

Research should be delegated to codebase-researcher or mcp-researcher. If a phase seems to need extensive research, that research is likely missing delegation and consuming orchestrator context directly.

## Pre-Phase Checklist

Before starting any phase, verify:

- [ ] Phase has ≤7 work items
- [ ] Phase has ≤2 Large work items
- [ ] Phase complexity score is ≤14 points
- [ ] All research tasks are marked for delegation
- [ ] All implementation tasks have agent assignments
- [ ] Expected duration is ≤2 sessions
