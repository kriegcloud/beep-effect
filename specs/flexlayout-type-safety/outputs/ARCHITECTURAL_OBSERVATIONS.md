# FlexLayout Architectural Observations

> Accumulated observations for architectural improvements identified during the type safety audit.
>
> **Purpose**: These observations will be synthesized into a future refactoring spec.
>
> **Format**: See `templates/architectural-observation.template.md` for entry format.

---

## Observation Categories

| Category | Description | Count |
|----------|-------------|-------|
| **A1** | Composition over Inheritance | 0 |
| **A2** | Discriminated Unions for Exhaustiveness | 0 |
| **A3** | Effect for Operations | 0 |
| **A4** | Performance Enhancements | 0 |
| **Total** | | **0** |

---

## Priority Summary

| Priority | Description | Count |
|----------|-------------|-------|
| P1 | Quick wins (Low complexity, High impact) | 0 |
| P2 | Strategic (Medium complexity, High impact) | 0 |
| P3 | Major refactor (High complexity, High impact) | 0 |
| P4 | Opportunistic (Low complexity, Low impact) | 0 |
| P5 | Defer (High complexity, Low impact) | 0 |

---

## Observations by File

### Model.ts

#### A2: Large switch statement lacks exhaustiveness checking
- **Line(s)**: 77-291
- **Current Pattern**: Large switch statement on action.type with 15+ cases and a silent default break. Return type is UnsafeTypes.UnsafeAny with side effects throughout.
- **Issue**: No compile-time guarantee all action types are handled. Adding new action types won't trigger TypeScript errors.
- **Opportunity**: Refactor to discriminated union with Match.tag from effect/Match. Each action handler returns typed Effect. Exhaustiveness enforced by TypeScript.
- **Complexity**: High
- **Impact**: High
- **Priority**: P3
- **Dependencies**: Actions.ts, Action type definitions, All node types
- **Notes**: Core state mutation engine. Needs careful Effect integration.

#### A2: Attributes dictionary lacks type safety
- **Line(s)**: 38, 329, 333, 442, 446, 450, 454, 590
- **Current Pattern**: Record<string, UnsafeAny> with manual type assertions (as boolean, as number) on every access.
- **Issue**: No validation that attribute values match expected types. Easy to introduce runtime type errors.
- **Opportunity**: Define Schema for attribute dictionary with branded types. getAttribute becomes type-safe lookup with Schema.decodeUnknown.
- **Complexity**: Medium
- **Impact**: High
- **Priority**: P2
- **Dependencies**: AttributeDefinitions.ts, Attribute.ts
- **Notes**: AttributeDefinitions exists but is runtime-only.

#### A3: Node lookups without error handling
- **Line(s)**: 80, 88, 95, 104, 133, 156, 175, 206, 213, 241, 258, 267, 285, 372
- **Current Pattern**: this.idMap.get(id) followed by unsafe type assertion or non-null assertion.
- **Issue**: Silent failures or runtime errors when nodes don't exist.
- **Opportunity**: Wrap all node lookups in Effect with proper error types (NodeNotFoundError). Create helper getNodeById returning Effect<Node, NodeNotFoundError>.
- **Complexity**: Medium
- **Impact**: High
- **Priority**: P2
- **Dependencies**: All node types, idMap structure
- **Notes**: Pattern appears 15+ times. Good candidate for helper function.

#### A3: Window lookups with non-null assertions
- **Line(s)**: 92, 136, 165, 215, 237, 266, 317, 325, 364, 408, 563
- **Current Pattern**: this.windows.get(windowId)! pattern repeated throughout.
- **Issue**: Runtime crashes if window doesn't exist. No error context for debugging.
- **Opportunity**: Return Effect<LayoutWindow, WindowNotFoundError> for window lookups. Consider HashMap from effect.
- **Complexity**: Medium
- **Impact**: High
- **Priority**: P2
- **Dependencies**: LayoutWindow.ts
- **Notes**: Pattern appears 11+ times.

#### A1: Native Maps for state storage
- **Line(s)**: 40, 50, 60, 62, 541, 543, 558
- **Current Pattern**: Native Map<string, Node> for idMap and Map<string, LayoutWindow> for windows with mutable operations.
- **Issue**: Mutable state throughout. Difficult to implement undo/redo.
- **Opportunity**: Migrate to HashMap from effect. Immutable updates with structural sharing.
- **Complexity**: High
- **Impact**: Medium
- **Priority**: P3
- **Dependencies**: All code accessing idMap and windows
- **Notes**: Major refactor. Should be done after smaller wins.

#### A4: Repeated instanceof checks for node types
- **Line(s)**: 81, 90, 96, 105, 114, 134, 157, 160, 207, 216, 220, 226, 241, 259, 268, 383, 499
- **Current Pattern**: Repeated instanceof checks: TabNode, TabSetNode, BorderNode, RowNode.
- **Issue**: Runtime overhead. Pattern repeated 15+ times. Difficult to extend.
- **Opportunity**: Create Effect predicates (isTabNode, isTabSetNode). Use predicate combinators.
- **Complexity**: Low
- **Impact**: Medium
- **Priority**: P1
- **Dependencies**: All node class definitions
- **Notes**: Quick win with better type safety.

---

## Prior Context (from initial fixes)

The following observations were noted during the initial IJsonModel.ts, BorderNode.ts, and TabNode.ts refactoring:

### IJsonModel.ts

#### A1: Potential for Schema Composition
- **Line(s)**: 1-200 (entire file)
- **Current Pattern**: Schema classes defined with explicit extend() chains
- **Issue**: Some duplication in shared properties across node types
- **Opportunity**: Extract common property sets into reusable schema fragments
- **Complexity**: Low
- **Impact**: Medium
- **Priority**: P4
- **Dependencies**: All model files using these schemas
- **Notes**: Would reduce duplication and improve maintainability. Consider after all nodes are migrated.

---

## Synthesis Notes

<!--
After completing the audit, this section will contain:
1. Cross-cutting patterns observed across multiple files
2. Recommended refactoring order
3. Estimated effort for each architectural improvement
4. Dependencies between improvements
5. Suggested new spec structure for refactoring phase
-->

### Cross-Cutting Patterns
(To be populated during audit)

### Recommended Refactoring Order
(To be populated during synthesis)

### Effort Estimates
(To be populated during synthesis)

---

## Related Documents

- [RUBRICS.md](../RUBRICS.md) - Observation category definitions
- [templates/architectural-observation.template.md](../templates/architectural-observation.template.md) - Entry format
- [REFLECTION_LOG.md](../REFLECTION_LOG.md) - Type safety learnings
