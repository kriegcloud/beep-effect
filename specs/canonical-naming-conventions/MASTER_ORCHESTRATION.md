# Master Orchestration: Canonical Naming Conventions

> Complete phase workflows, checkpoints, and handoff protocols for establishing AI-native naming standards.

---

## Phase 0: Codebase Inventory

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `codebase-researcher`

### Objectives

1. Document all existing file naming patterns
2. Inventory all file categories by layer
3. Analyze folder casing conventions
4. Map barrel export patterns (`mod.ts` vs `index.ts`)
5. Identify inconsistencies and violations

### Tasks

#### Task 0.1: Postfix Pattern Analysis (codebase-researcher)

```
Analyze the beep-effect codebase for file postfix patterns:

1. Find all unique postfix patterns:
   - packages/iam/*/src/**/*.ts
   - packages/documents/*/src/**/*.ts
   - packages/shared/*/src/**/*.ts
   - packages/common/*/src/**/*.ts
   - packages/ui/*/src/**/*.tsx

2. Document pattern frequency:
   - .model.ts (domain models)
   - .types.ts (type definitions)
   - .service.ts (service interfaces)
   - .table.ts (database tables)
   - .contract.ts (API contracts)
   - .handler.ts (request handlers)
   - .provider.tsx (React providers)
   - .hook.ts (React hooks)
   - .test.ts (test files)
   - .config.ts (configuration)

3. Identify patterns without postfixes:
   - Plain filename.ts that should have category postfix
   - Inconsistent naming within same module

Output: outputs/existing-patterns-audit.md
```

#### Task 0.2: Folder Casing Analysis (codebase-researcher)

```
Analyze folder naming conventions:

1. Entity/feature folders:
   - PascalCase: packages/iam/domain/src/entities/ApiKey/
   - kebab-case: packages/iam/client/src/sign-in/
   - lowercase: packages/common/types/src/

2. Layer folders:
   - Consistent across slices? (domain, tables, infra, client, ui)

3. Special folders:
   - test/ vs __tests__/ vs tests/
   - src/ structure patterns

Output: Update outputs/existing-patterns-audit.md
```

#### Task 0.3: Barrel Export Analysis (codebase-researcher)

```
Analyze module export patterns:

1. mod.ts + index.ts namespace pattern:
   - index.ts: export * as SignIn from "./mod.ts"
   - mod.ts: export * as Contract, Handler, etc.

2. Direct export pattern:
   - index.ts: export { foo, bar } from "./foo.ts"

3. Mixed patterns:
   - Some modules using namespace, others direct

4. Calculate adoption rate:
   - % using namespace pattern
   - % using direct export
   - % with no barrel exports

Output: Update outputs/existing-patterns-audit.md
```

#### Task 0.4: File Category Inventory (codebase-researcher)

```
Create exhaustive inventory of file types:

1. By architectural layer:
   - domain: models, errors, types
   - tables: table definitions, migrations
   - infra: services, repos, layers
   - client: contracts, handlers, hooks
   - ui: components, providers, atoms

2. By semantic purpose:
   - Data definitions (schemas, types)
   - Business logic (services, handlers)
   - Infrastructure (db, cache, queue)
   - Presentation (components, styles)
   - Configuration (env, constants)
   - Testing (fixtures, mocks, tests)

Output: outputs/file-category-inventory.md
```

#### Task 0.5: Inconsistency Report (codebase-researcher)

```
Identify and document inconsistencies:

1. Casing inconsistencies:
   - Same pattern with different casing
   - Mixed casing in same directory

2. Postfix inconsistencies:
   - Same purpose with different postfixes
   - Missing postfixes where expected

3. Structural inconsistencies:
   - Different barrel patterns in same slice
   - Varying directory depths for same concept

Output: outputs/inconsistency-report.md
```

### Checkpoint

Before proceeding to P1:
- [ ] `outputs/existing-patterns-audit.md` documents all patterns
- [ ] `outputs/file-category-inventory.md` lists all file types
- [ ] `outputs/inconsistency-report.md` identifies violations
- [ ] Pattern counts are verifiable via grep
- [ ] No subjective recommendations (research only)
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings
- [ ] `handoffs/HANDOFF_P1.md` created
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created

### Handoff

Create `handoffs/HANDOFF_P1.md` with:
- Inventory summary statistics
- Key findings from codebase analysis
- Questions for external research
- P1 task refinements

---

## Phase 1: External Research

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `ai-trends-researcher`, `web-researcher`, `mcp-researcher`

### Objectives

1. Research naming conventions in leading Effect/FP repositories
2. Investigate AI-friendly codebase standards (llms.txt, CLAUDE.md)
3. Gather academic/industry naming best practices
4. Identify grep/glob optimization patterns
5. Research category theory naming approaches

### Tasks

#### Task 1.1: Effect Repository Conventions (codebase-researcher)

```
Research Effect-TS and related FP repositories:

1. Effect-TS organization patterns:
   - https://github.com/Effect-TS/effect
   - File naming conventions
   - Module structure
   - Export patterns

2. Related FP repos:
   - fp-ts patterns
   - io-ts patterns
   - Scala ZIO naming

3. Document patterns:
   - File postfix conventions
   - Folder casing
   - Barrel export style

Output: outputs/fp-repo-conventions.md
```

#### Task 1.2: AI Documentation Standards (ai-trends-researcher)

```
Research AI-friendly codebase documentation:

1. llms.txt specification:
   - What it standardizes
   - Naming conventions mentioned
   - File organization patterns

2. CLAUDE.md patterns:
   - Anthropic documentation best practices
   - How naming affects AI comprehension
   - Context efficiency patterns

3. AI-native codebases:
   - Cursor/Copilot optimized repos
   - Codebase conventions for AI agents
   - Semantic naming for pattern matching

Output: outputs/ai-codebase-standards.md
```

#### Task 1.3: Industry Best Practices (web-researcher)

```
Research industry naming standards:

1. Clean Architecture naming:
   - Domain layer conventions
   - Infrastructure layer conventions
   - Presentation layer conventions

2. Domain-Driven Design patterns:
   - Bounded context naming
   - Entity vs Value Object naming
   - Aggregate naming conventions

3. Monorepo conventions:
   - Nx patterns
   - Turborepo patterns
   - Lerna patterns

4. TypeScript community standards:
   - Definitelytyped conventions
   - Major library patterns

Output: outputs/industry-best-practices.md
```

#### Task 1.4: Category Theory Naming (mcp-researcher)

```
Research category theory informed naming:

1. Functor/Monad naming:
   - How to name transformation modules
   - Effect vs Schema naming

2. Type class naming:
   - Service vs Instance naming
   - Layer vs Implementation naming

3. ADT naming conventions:
   - Tagged unions
   - Product types
   - Sum types

Output: outputs/category-theory-naming.md
```

#### Task 1.5: Grep/Glob Optimization (codebase-researcher)

```
Research naming patterns for efficient searching:

1. Unique postfix patterns:
   - Avoiding collisions
   - Enabling precise glob patterns

2. Semantic prefixes/postfixes:
   - What enables instant identification?
   - What patterns are ambiguous?

3. Case sensitivity considerations:
   - Cross-platform file systems
   - Search tool behavior

Output: Update outputs/industry-best-practices.md
```

### Checkpoint

Before proceeding to P2:
- [ ] `outputs/fp-repo-conventions.md` documents Effect/FP patterns
- [ ] `outputs/ai-codebase-standards.md` covers AI documentation
- [ ] `outputs/industry-best-practices.md` compiles standards
- [ ] `outputs/category-theory-naming.md` provides theoretical grounding
- [ ] All research includes citations/sources
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

### Handoff

Create `handoffs/HANDOFF_P2.md` with:
- Research synthesis
- Key patterns from external sources
- Conflicts between sources
- P2 task refinements

---

## Phase 2: Synthesis & Standards Definition

**Duration**: 2-3 sessions
**Status**: Pending
**Agents**: `reflector`, `doc-writer`, `architecture-pattern-enforcer`

### Objectives

1. Synthesize internal inventory with external research
2. Define exhaustive category taxonomy
3. Establish casing decision matrix
4. Document module structure patterns
5. Draft `.claude/rules/naming-conventions.md`

### Tasks

#### Task 2.1: Category Taxonomy Synthesis (reflector)

```
Synthesize file category taxonomy:

1. Merge internal categories with external best practices
2. Resolve conflicts between patterns
3. Ensure category-theoretic consistency
4. Map categories to architectural layers

Categories to define:
- Domain layer categories
- Tables layer categories
- Infrastructure layer categories
- Client layer categories
- UI layer categories
- Common/Shared categories
- Test categories

Output: outputs/category-taxonomy.md
```

#### Task 2.2: Casing Decision Matrix (reflector)

```
Define casing rules:

1. File casing:
   - When to use kebab-case
   - When to use PascalCase
   - When to use lowercase

2. Folder casing:
   - Entity/feature folders
   - Layer folders
   - Special purpose folders

3. Export/variable casing:
   - Namespace exports
   - Type exports
   - Value exports

Include rationale for each decision.

Output: outputs/casing-decision-matrix.md
```

#### Task 2.3: Module Structure Patterns (reflector)

```
Define barrel export conventions:

1. When to use mod.ts + index.ts:
   - Namespace consumption pattern
   - Public API surface definition

2. When to use direct exports:
   - Simple modules
   - Leaf modules

3. Standard structure templates:
   - Feature module structure
   - Service module structure
   - Component module structure

Output: outputs/module-structure-patterns.md
```

#### Task 2.4: Naming Rules Draft (doc-writer)

```
Create draft rules file:

Target: .claude/rules/naming-conventions.md

Sections:
1. File Postfix Taxonomy
   - Complete postfix list with examples
   - Layer-specific postfixes

2. Casing Standards
   - File casing rules
   - Folder casing rules
   - Export casing rules

3. Module Structure
   - Barrel export patterns
   - Directory structure templates

4. Verification Commands
   - Grep patterns to check compliance
   - Glob patterns for file types

5. Examples
   - Correct naming examples
   - Common mistakes to avoid

Output: outputs/naming-rules-draft.md
```

#### Task 2.5: Architecture Validation (architecture-pattern-enforcer)

```
Validate proposed standards:

1. Layer alignment:
   - Categories map cleanly to layers
   - No ambiguous categories

2. Effect patterns:
   - Standards align with Effect conventions
   - Service/Layer naming consistent

3. Existing code impact:
   - Migration complexity assessment
   - Breaking change identification

4. Tooling compatibility:
   - IDE support for patterns
   - Linter integration potential

Output: outputs/validation-report.md
```

### Checkpoint

Spec complete when:
- [ ] `outputs/category-taxonomy.md` defines all categories
- [ ] `outputs/casing-decision-matrix.md` documents casing rules
- [ ] `outputs/module-structure-patterns.md` describes barrel patterns
- [ ] `outputs/naming-rules-draft.md` ready for review
- [ ] `outputs/validation-report.md` approves standards
- [ ] All decisions have documented rationale
- [ ] `REFLECTION_LOG.md` finalized with synthesis learnings
- [ ] Standards ready for implementation spec

---

## Cross-Phase Considerations

### Research Integrity

All phases must maintain research integrity:
- Phase 0 & 1: NO normative judgments, only observations
- Phase 2: Judgments must cite supporting evidence

### Effect Patterns

All code examples must follow `.claude/rules/effect-patterns.md`:
- Namespace imports
- PascalCase constructors
- No native method usage

### Documentation Requirements

Each phase updates:
- `REFLECTION_LOG.md` with phase learnings
- `handoffs/HANDOFF_P[N+1].md` for next phase
- `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` for session start

---

## Iteration Protocol

After each phase:

1. **Verify** - Confirm all deliverables exist
2. **Reflect** - Update REFLECTION_LOG.md
3. **Handoff** - Create HANDOFF_P[N+1].md
4. **Prompt** - Create P[N+1]_ORCHESTRATOR_PROMPT.md
5. **Review** - Run validation if applicable

---

## Success Criteria

This spec is complete when:

- [ ] Complete inventory of existing patterns (Phase 0)
- [ ] External research synthesized with citations (Phase 1)
- [ ] Exhaustive category taxonomy defined (Phase 2)
- [ ] Casing decision matrix documented (Phase 2)
- [ ] Module structure patterns established (Phase 2)
- [ ] Draft `.claude/rules/naming-conventions.md` ready (Phase 2)
- [ ] REFLECTION_LOG.md captures all learnings
- [ ] Standards ready to inform implementation spec

---

## Related Specifications

- **Implementation Spec** (future): Will handle actual file renaming/refactoring
- `specs/ai-friendliness-audit/`: Related AI-friendliness patterns
- `.claude/skills/mcp-refactor-typescript.md`: TypeScript-aware refactoring (file renames, import updates)

---

## Non-Goals (Preserved from README)

This spec does NOT:
- Implement file renames (separate implementation spec)
- Create automated linters (future tooling work)
- Plan migration paths (separate migration spec)
- Make codebase changes (research only)
