# FlexLayout Schema Migration: Reflection Log

> Cumulative learnings from schema migration work.

---

## Reflection Protocol

After each file migration, record:
1. What worked well
2. What didn't work
3. Pattern refinements discovered
4. Edge cases encountered

---

## Reflection Entries

### 2025-01-11 - Pre-Migration Analysis

#### Pattern Discovery from Completed Migrations

Analyzed existing schema migrations (`Attribute.ts`, `AttributeDefinitions.ts`, `DockLocation.ts`, `Orientation.ts`, `Rect.ts`) to extract patterns.

**Key Learnings**:

1. **Mutable Data Pattern**: Wrap all mutable state in a `data` property using `S.Struct({...}).pipe(S.mutable)`

2. **Option vs Undefined**: Use `S.OptionFromUndefinedOr(S.Type)` for fields that may be undefined - this serializes to `undefined` but provides `Option<T>` in code

3. **Lazy Singleton Pattern**: For enum-like constants (TOP, BOTTOM, LEFT, RIGHT), use:
   ```typescript
   private static _VALUE: O.Option<IClass> = O.none();

   static get VALUE(): IClass {
     return IClass._VALUE.pipe(O.getOrElse(() => {
       const instance = IClass.new(...);
       IClass._VALUE = O.some(instance);
       return instance;
     }));
   }
   ```

4. **Self-Referential Fields**: Cannot be in schema struct. Store as private instance field:
   ```typescript
   private _pairedAttr: O.Option<IAttribute> = O.none();
   ```

5. **Effect Sorting**: Don't use native `.sort()`. Use:
   ```typescript
   const byName = Order.mapInput(Order.string, (a) => a.getName());
   const sorted = A.sort(items, byName);
   ```

6. **Fluent Setters**: Return `this` for chainable API:
   ```typescript
   readonly setType = (value: string): this => {
     this.data.type = value;
     return this;
   }
   ```

#### Anticipated Challenges

1. **Abstract Classes**: `Node.ts` is abstract with abstract methods. Effect Schema classes can't be abstract. Options:
   - Use branded types + type guards
   - Create concrete base with runtime checks
   - Use union type approach

2. **Circular Dependencies**: `Model` references `Node` subclasses, which reference `Model`. May need:
   - Lazy imports
   - Interface segregation
   - Dependency injection via constructor

3. **Callback Functions**: `Model` has callbacks like `onAllowDrop`. Store as private instance fields, not in schema.

4. **DOM References**: `LayoutWindow` has `Window` reference. Exclude from schema, store as private field.

---

## Accumulated Improvements

*To be updated as migration progresses*

### Schema Pattern Refinements
- None yet

### Anti-Patterns Discovered
- None yet

### Tooling Notes
- None yet

---

---

## 2026-01-11 - Phase 0 Completion: Spec Creation & Review

### What Worked Well

1. **Two-stage creation workflow** - Creating initial files, running spec-reviewer, then remediating gaps BEFORE execution
   - Initial creation: README, REFLECTION_LOG, QUICK_START, AGENT_PROMPTS (4 files)
   - Review: spec-reviewer identified 3 HIGH severity gaps
   - Remediation: Created MASTER_ORCHESTRATION, RUBRICS, handoffs/ (4 additions)
   - Result: Fully compliant spec ready for Phase 1

2. **Progressive disclosure hierarchy** - README → QUICK_START → AGENT_PROMPTS → MASTER_ORCHESTRATION
   - README: 216 lines, patterns and scope
   - QUICK_START: 142 lines, 5-minute guide
   - AGENT_PROMPTS: 328 lines, task-by-task prompts
   - MASTER_ORCHESTRATION: 364 lines, full workflow with dependency graph

3. **Reference pattern extraction** - Documenting patterns from completed migrations with code snippets
   - Pattern 1: Simple Data Class (Attribute.ts)
   - Pattern 2: Collection with HashMap (AttributeDefinitions.ts)
   - Pattern 3: Tagged Variant (DockLocation.ts)
   - All patterns include actual code snippets from reference files

4. **Dependency graph visualization** - ASCII graph in MASTER_ORCHESTRATION showing Actions → Node → support → subclasses → Model
   - Prevents wrong-order execution
   - Makes dependencies explicit
   - Guides phase planning

### What Didn't Work

1. **Pattern documentation drift** - README Pattern 3 showed lazy singleton approach, but actual DockLocation.ts uses tagged union variants
   - Root cause: Documented from memory/older version rather than reading current file
   - Impact: Would confuse agents about which pattern to follow
   - Fix: Updated README to reflect actual implementation, documented BOTH patterns (tagged variants + lazy singletons)
   - Lesson: ALWAYS read reference files with Read tool before documenting patterns

2. **Initial spec creation missed complexity markers** - Treated as simple spec (README + REFLECTION_LOG only) despite 5/6 complexity markers:
   - ✓ Multi-file (9 files)
   - ✓ Multi-phase (6 phases)
   - ✓ Architectural (abstract classes)
   - ✓ Dependency-ordered (critical)
   - ✓ Multi-session (6-8 hours estimated)
   - Result: Missing MASTER_ORCHESTRATION, RUBRICS, handoffs/
   - Impact: spec-reviewer scored 3.1/5 ("Needs Work")
   - Lesson: Run complexity assessment BEFORE creating files

### Methodology Improvements

- [x] **Add complexity checklist to SPEC_CREATION_GUIDE** - Formalize when to create orchestration files (see meta-reflection for proposed checklist)
- [x] **Add pattern verification step to Phase 0** - Require reading reference files to verify pattern documentation matches actual code
- [x] **Make spec-review mandatory for complex specs** - Two-stage creation (Create → Review → Remediate → Execute) prevents gaps
- [x] **Design handoff protocol in Phase 0** - Create handoffs/ directory and HANDOFF_P1.md template upfront, not in Phase 4+

### Prompt Refinements

**Original**: "Create a spec for migrating FlexLayout model classes to Effect Schema"

**Problem**: No guidance on complexity assessment or when to create orchestration files

**Refined**: "First assess complexity using 6 markers (multi-file, multi-phase, architectural, dependency-ordered, multi-session, evaluative). If 4+ markers → Create full suite: README, REFLECTION_LOG, QUICK_START, AGENT_PROMPTS, MASTER_ORCHESTRATION, RUBRICS, handoffs/. Run spec-reviewer after creation, remediate gaps, then proceed to Phase 1."

---

**Original**: "Document patterns from existing migrations"

**Problem**: No verification requirement, leading to documentation drift

**Refined**: "For each pattern: (1) Use Read tool to read CURRENT reference file, (2) Extract pattern with exact code snippets, (3) Verify pattern name matches code structure, (4) Add date stamp and verification note. If pattern evolved, document current version with historical note."

---

**Original** (implicit): "After creating spec, proceed to Phase 1"

**Problem**: No review step between creation and execution

**Refined**: "After creating spec, STOP and run spec-reviewer. If score < 4.0 or HIGH severity gaps present, remediate before Phase 1. Target: ≥4.0 score with all critical files present."

### Codebase-Specific Insights

1. **FlexLayout has 5 completed schema migrations** - Attribute, AttributeDefinitions, DockLocation, Orientation, Rect serve as reference implementations
2. **DockLocation demonstrates TWO patterns** - Tagged unions for variants + lazy singletons for static instances (not just one pattern)
3. **Abstract class challenge is KNOWN** - Node.ts is abstract with abstract methods, Effect Schema classes can't be abstract → requires architectural decision in Phase 1
4. **Circular dependencies are KNOWN** - Model ↔ Node have circular refs → requires careful handling with lazy init or interface segregation

### Recommendations for Spec Bootstrapper

If a spec-bootstrapper agent exists or will be created:

1. **Start with complexity assessment** - Before ANY file creation, run checklist (multi-file, multi-phase, architectural, dependency-ordered, multi-session, evaluative). If 4+ → require full suite.

2. **Reference pattern verification** - If spec documents code patterns, require Read tool usage and verification report BEFORE proceeding.

3. **Invoke spec-reviewer after scaffolding** - Make this a mandatory gate between Phase 0 and Phase 1 for complex specs.

4. **Handoff-first design** - For complex specs, create handoffs/ directory in Phase 0 with HANDOFF_P1.md template capturing Phase 0 completion state.

5. **Dependency graph requirement** - For migration specs affecting 3+ files, require ASCII dependency graph in MASTER_ORCHESTRATION.

---

## Lessons Learned Summary

*Populated after Phase 0 completion - To be updated as migration progresses*

### Top Techniques from P0

1. **Two-stage spec creation** (Create → Review → Remediate → Execute) - Catches structural gaps before execution
2. **Complexity assessment with 6 markers** - Determines correct structure (simple vs medium vs complex)
3. **Reference pattern extraction with verification** - Document patterns from actual files with Read tool
4. **Progressive disclosure hierarchy** - README (overview) → QUICK_START (5-min) → AGENT_PROMPTS (tasks) → MASTER_ORCHESTRATION (full workflow)
5. **Dependency graph visualization** - ASCII graph makes execution order explicit and prevents wrong-order errors

### Wasted Efforts from P0

1. **Documenting patterns from memory** - Pattern 3 drift caught by review, required remediation
2. **Creating spec without complexity check** - Missing orchestration files caught by review, required remediation
3. **No upfront reference file reading** - Would have caught DockLocation.ts discrepancy earlier

### Recommended for Next Spec Creation

1. **Run complexity checklist first** - Before creating ANY files, assess using 6 markers
2. **Read reference files with Read tool** - Don't trust memory, verify patterns against current code
3. **Invoke spec-reviewer after scaffolding** - Mandatory gate for complex specs
4. **Create handoffs/ in Phase 0** - Design handoff protocol upfront, not after first phase completes
