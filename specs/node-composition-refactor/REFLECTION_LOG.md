# Node Composition Refactor: Reflection Log

> Accumulated learnings from refactoring Node hierarchy to composition.

---

## Reflection Protocol

After each phase, add an entry with:
1. What worked well
2. What didn't work
3. Methodology improvements
4. Prompt refinements
5. Codebase-specific insights

---

## Reflection Entries

### 2026-01-10 - P0 Research Phase

#### What Worked

1. **Parallel agent research** - Running 4 specialized agents simultaneously provided comprehensive coverage:
   - Codebase explorer: Full hierarchy mapping
   - Effect researcher: Core patterns (Data.TaggedClass, Match)
   - Schema expert: Composition via S.extend, recursive schemas
   - Pattern finder: Existing composition examples in codebase

2. **Existing pattern discovery** - Found production examples of composition patterns:
   - `Upload.service.ts`: `Data.TaggedEnum` for state machines
   - `policy-types.ts`: `S.TaggedClass` for domain models
   - `VariantSchema.ts`: Schema composition factory

3. **Proposal-first approach** - Writing `node-composition.proposal.ts` with concrete code examples before implementation helped clarify the target architecture.

#### What Didn't Work

1. **Underestimated hierarchy complexity** - Initial assumption was 4 simple subclasses. Reality:
   - RowNode: 560 lines, complex splitter calculations
   - TabSetNode: ~400 lines, tab management + drop logic
   - TabNode: ~300 lines, DOM references + visibility
   - BorderNode: ~350 lines, edge docking

2. **Protected field access** - Many behaviors depend on `this.model`, `this.attributes`, `this.parent`. These can't just be extracted to pure functions without rethinking the data flow.

#### Methodology Improvements

1. **Add "complexity audit" sub-phase** - Before proposing changes, measure LOC and method count per class
2. **Identify Model coordinator patterns** - Understand how Model.ts uses nodes before refactoring
3. **Map protected field usage** - Create matrix of which methods access which protected fields

#### Prompt Refinements

**Original**: "Explore the flexlayout model hierarchy"
**Refined**: "Explore the flexlayout model hierarchy. For each class: (1) count lines of code, (2) list all method overrides from Node, (3) list unique methods, (4) identify protected field access patterns"

#### Codebase-Specific Insights

1. **Model is the coordinator** - `Model.ts` holds the `idMap`, manages node registration, and coordinates cross-node operations. Nodes need Model reference.

2. **AttributeDefinitions pattern** - The codebase uses `AttributeDefinitions` for runtime attribute validation. This could become Effect Schema.

3. **Event listener system** - Nodes have `setEventListener`/`fireEvent` pattern. Could become Effect Stream or PubSub.

4. **Rect calculations are complex** - `RowNode.calculateSplit`, `getSplitterBounds` have intricate math. These should remain as-is initially.

---

## Accumulated Improvements

### MASTER_ORCHESTRATION.md Updates

_(To be populated as phases complete)_

### Pattern Discoveries

1. **Data.TaggedClass vs S.TaggedClass**:
   - Use `Data.TaggedClass` for runtime-only types (no serialization)
   - Use `S.TaggedClass` when schema validation needed at boundaries

2. **Match.exhaustive placement**:
   - Extract to named functions, not inline in React components
   - Group by behavior module (NodeOps, DraggableOps, etc.)

3. **Recursive schema pattern**:
   ```typescript
   const RowNode = S.TaggedStruct("RowNode", {
     children: S.Array(S.suspend(() => Node)),
   });
   ```

---

## Lessons Learned Summary

### Top 3 Most Valuable Techniques

1. Parallel agent research for comprehensive coverage
2. Proposal file with concrete code examples
3. Finding existing patterns in codebase to follow

### Top 3 Potential Pitfalls

1. Protected field dependencies across class hierarchy
2. Model coordinator coupling
3. Complex math methods that shouldn't be refactored early

### Recommended Approach for P1

1. Start with `TabNode` (leaf node, simplest)
2. Create behavior modules alongside existing classes (no deletion yet)
3. Add adapter functions that work with both old and new patterns
4. Migrate one method at a time with tests

---

## Next Session Preparation

Before starting P1:
- [ ] Write tests for current Node behavior
- [ ] Create benchmark for critical paths (findDropTargetNode, calcMinMaxSize)
- [ ] Map all protected field access across hierarchy
