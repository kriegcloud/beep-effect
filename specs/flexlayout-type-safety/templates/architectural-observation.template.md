# Architectural Observation Entry Template

> Use this format when logging observations to `outputs/ARCHITECTURAL_OBSERVATIONS.md`

---

## Entry Format

```markdown
### [FILE_NAME]

#### [A1|A2|A3|A4]: [Brief Title]
- **Line(s)**: [LINE_NUMBERS or range]
- **Current Pattern**: [Description of current approach]
- **Issue**: [Why this is suboptimal]
- **Opportunity**: [What could be done instead]
- **Complexity**: Low | Medium | High
- **Impact**: Low | Medium | High
- **Priority**: P1-P5 (see scoring below)
- **Dependencies**: [Other files/patterns affected]
- **Notes**: [Additional context for synthesis]
```

---

## Category Reference

| Category | Description | Key Signals |
|----------|-------------|-------------|
| **A1** | Composition over Inheritance | Deep hierarchies, protected methods, override-heavy classes |
| **A2** | Discriminated Unions | String type checks, instanceof, non-exhaustive switches |
| **A3** | Effect for Operations | try/catch, console.log, async/await, race conditions |
| **A4** | Performance | Repeated computations, missing memoization, N+1 patterns |

---

## Priority Scoring

| Complexity | Impact | Priority | Action |
|------------|--------|----------|--------|
| Low | High | P1 | Quick wins - do first |
| Medium | High | P2 | Strategic - plan carefully |
| High | High | P3 | Major refactor - new spec |
| Low | Low | P4 | Opportunistic - when convenient |
| High | Low | P5 | Defer - not worth the effort |

---

## Example Entries

### TabNode.ts

#### A1: Deep Inheritance Chain
- **Line(s)**: 15-20
- **Current Pattern**: `TabNode extends Node extends BaseNode`
- **Issue**: 3-level inheritance primarily for code reuse, not polymorphism
- **Opportunity**: Extract shared behavior into composable services/utilities
- **Complexity**: High
- **Impact**: High
- **Priority**: P3
- **Dependencies**: Node.ts, BaseNode.ts, all node subclasses
- **Notes**: Core architectural change - affects entire model layer. Would enable better testing and reduce coupling.

---

### Model.ts

#### A2: Non-Exhaustive Type Dispatch
- **Line(s)**: 142-156
- **Current Pattern**: `switch(node.getType())` with string comparison and default case
- **Issue**: No compile-time exhaustiveness guarantee; new node types silently fall through
- **Opportunity**: Define `NodeType` as discriminated union, use `Match.exhaustive`
- **Complexity**: Medium
- **Impact**: High
- **Priority**: P2
- **Dependencies**: All node type definitions, actions that create nodes
- **Notes**: Would catch missing case handling at compile time. Enables better type narrowing.

---

### Layout.tsx

#### A3: Error Swallowing
- **Line(s)**: 89-95
- **Current Pattern**: `try { await doLayout() } catch (e) { console.error(e) }`
- **Issue**: Error swallowed, no structured logging, no context, no recovery
- **Opportunity**: `Effect.tryPromise` with typed error, `Effect.logError` with span context
- **Complexity**: Medium
- **Impact**: Medium
- **Priority**: P2
- **Dependencies**: Error handling strategy across view layer
- **Notes**: Part of larger effort to add observability. Would enable error tracking and debugging.

---

### Model.ts

#### A4: Double Iteration
- **Line(s)**: 256
- **Current Pattern**: `children.map(c => c.toJson()).filter(c => c !== null)`
- **Issue**: Two iterations over children array
- **Opportunity**: Use `A.filterMap` for single pass
- **Complexity**: Low
- **Impact**: Low
- **Priority**: P4
- **Dependencies**: None
- **Notes**: Micro-optimization. Fix when touching file for other reasons.
