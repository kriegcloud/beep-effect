# Agent Prompts: Canonical Naming Conventions

> Ready-to-use prompts for specialized agents working on this spec.

---

## Phase 0: Codebase Inventory

### Codebase Researcher - Postfix Pattern Analysis

```
You are researching the beep-effect codebase for file naming patterns.

## Mission
Identify ALL file postfix patterns used across the monorepo.

## Search Targets
1. packages/iam/*/src/**/*.ts
2. packages/documents/*/src/**/*.ts
3. packages/shared/*/src/**/*.ts
4. packages/common/*/src/**/*.ts
5. packages/ui/*/src/**/*.tsx
6. tooling/*/src/**/*.ts

## For Each Pattern Found
Document:
- Pattern (e.g., `.model.ts`, `.handler.ts`)
- File count using this pattern
- Packages where it appears
- Example file paths (2-3 examples)

## Patterns to Specifically Look For
- .model.ts (domain models)
- .types.ts (type definitions)
- .service.ts (service interfaces)
- .impl.ts (service implementations)
- .layer.ts (Effect layers)
- .table.ts (database tables)
- .repo.ts (repositories)
- .contract.ts (API contracts)
- .handler.ts (request handlers)
- .provider.tsx (React providers)
- .hook.ts (React hooks)
- .component.tsx (React components)
- .test.ts (test files)
- .config.ts (configuration)
- .const.ts (constants)
- .util.ts (utilities)
- .error.ts (error definitions)
- mod.ts (barrel exports)
- index.ts (module indices)

## Also Document
- Files WITHOUT postfixes (plain name.ts)
- Unusual or rare patterns
- Inconsistent patterns (same purpose, different postfix)

## Output Format
Create outputs/existing-patterns-audit.md with:

| Pattern | Count | Packages | Example |
|---------|-------|----------|---------|
| .model.ts | 15 | iam-domain, documents-domain | packages/iam/domain/src/entities/Member/Member.model.ts |
```

### Codebase Researcher - Folder Casing Analysis

```
You are analyzing folder naming conventions in beep-effect.

## Mission
Document all folder casing patterns used across the monorepo.

## Casing Types to Identify
1. PascalCase: ApiKey/, Member/, Organization/
2. kebab-case: sign-in/, api-key/, two-factor/
3. lowercase: src/, test/, utils/
4. UPPERCASE: (rarely used, document if found)

## Search Areas
1. Entity folders: packages/*/domain/src/entities/
2. Feature folders: packages/*/client/src/*/
3. Component folders: packages/*/ui/src/components/
4. Special folders: test/, __tests__/, fixtures/

## For Each Pattern Found
Document:
- Casing type
- Context where used (entities, features, etc.)
- Package examples
- Frequency/count

## Key Questions to Answer
1. Are entity folders consistently PascalCase?
2. Are feature modules consistently kebab-case?
3. Are there mixed casing patterns in same directory?
4. Do different slices use different conventions?

## Output
Update outputs/existing-patterns-audit.md with folder casing section.
```

### Codebase Researcher - Barrel Export Analysis

```
You are analyzing module export patterns in beep-effect.

## Mission
Document barrel export patterns (mod.ts + index.ts vs direct exports).

## Patterns to Identify

### Pattern A: Namespace Barrel (mod.ts + index.ts)
```typescript
// index.ts
export * as SignIn from "./mod.ts"

// mod.ts
export * as Contract from "./contract.ts"
export * as Handler from "./handler.ts"
```

### Pattern B: Direct Export
```typescript
// index.ts
export { signIn } from "./sign-in.ts"
export { handler } from "./handler.ts"
```

### Pattern C: Mixed
Some combination of A and B

### Pattern D: No Barrel
No index.ts, import directly from files

## Search Areas
1. packages/*/client/src/*/index.ts
2. packages/*/domain/src/*/index.ts
3. packages/*/server/src/*/index.ts
4. packages/*/ui/src/*/index.ts

## For Each Module Found
Document:
- Export pattern (A, B, C, D)
- Package location
- Namespace names used (if Pattern A)

## Key Statistics
- % of modules using Pattern A (namespace)
- % of modules using Pattern B (direct)
- % of modules with no barrel

## Output
Update outputs/existing-patterns-audit.md with barrel export section.
```

### Codebase Researcher - File Category Inventory

```
You are creating an exhaustive file category inventory.

## Mission
Categorize ALL file types by architectural layer and semantic purpose.

## By Architectural Layer

### Domain Layer (packages/*/domain/src/)
- Entity models
- Domain errors
- Domain types
- Value objects
- Aggregates

### Tables Layer (packages/*/tables/src/)
- Table definitions
- Table types
- Migration helpers

### Infrastructure Layer (packages/*/server/src/ or server/src/)
- Services
- Repositories
- Layers
- External adapters

### Client Layer (packages/*/client/src/)
- Contracts (API schemas)
- Handlers (request/response)
- Hooks (React query)

### UI Layer (packages/*/ui/src/)
- Components
- Providers
- Atoms (state)
- Hooks (UI-specific)

## By Semantic Purpose

### Data Definitions
- Schemas
- Types
- Interfaces
- Constants

### Business Logic
- Services
- Handlers
- Validators
- Transformers

### Infrastructure
- Database
- Cache
- Queue
- External APIs

### Presentation
- Components
- Providers
- Styles
- Layouts

### Configuration
- Environment
- Constants
- Feature flags

### Testing
- Test files
- Fixtures
- Mocks
- Factories

## Output
Create outputs/file-category-inventory.md with categorized inventory.
```

### Codebase Researcher - Inconsistency Report

```
You are identifying naming inconsistencies in beep-effect.

## Mission
Document all naming pattern violations and inconsistencies.

## Inconsistency Types

### 1. Casing Inconsistencies
- Same concept with different casing
  - Example: ApiKey/ vs api-key/
- Mixed casing in same directory
- Inconsistent casing across slices

### 2. Postfix Inconsistencies
- Same purpose with different postfixes
  - Example: UserService.ts vs user.service.ts
- Missing postfixes where expected
- Incorrect postfix for file purpose

### 3. Structural Inconsistencies
- Different barrel patterns in same slice
- Varying directory depths for same concept
- Inconsistent test file locations

### 4. Naming Conflicts
- Ambiguous file names
- Colliding pattern matches
- Non-unique patterns

## For Each Inconsistency
Document:
- Type of inconsistency
- Specific examples (file paths)
- Potential impact on AI comprehension
- Suggested resolution (without implementing)

## Severity Levels
- HIGH: Causes grep/glob ambiguity
- MEDIUM: Requires reading file to understand purpose
- LOW: Cosmetic inconsistency

## Output
Create outputs/inconsistency-report.md with categorized findings.
```

---

## Phase 1: External Research

### AI Trends Researcher - AI Documentation Standards

```
You are researching AI-friendly codebase documentation standards.

## Mission
Research how codebases can be optimized for AI agent comprehension.

## Research Topics

### 1. llms.txt Specification
- What is llms.txt?
- What naming conventions does it recommend?
- How does it structure documentation for LLMs?
- Relevant patterns for file naming

### 2. CLAUDE.md Patterns
- Anthropic's documentation best practices
- How Claude Code expects codebases to be structured
- Naming patterns that improve AI comprehension
- Context efficiency techniques

### 3. AI-Native Codebase Patterns
- Cursor optimized repositories
- GitHub Copilot best practices
- Codebase conventions for AI pair programming
- Semantic naming for pattern matching

### 4. Research Questions
- What naming patterns enable AI to understand file purpose without reading contents?
- How do postfixes improve or harm AI comprehension?
- What folder structures maximize AI navigation efficiency?
- How does casing affect AI pattern recognition?

## Sources to Check
- llmstxt.org or llms.txt spec documentation
- Anthropic documentation and guides
- AI coding assistant best practices
- Developer experience blogs on AI-assisted coding

## Output
Create outputs/ai-codebase-standards.md with:
- Findings per topic
- Specific naming recommendations
- Citations/sources for each finding
```

### Web Researcher - Effect/FP Repository Conventions

```
You are researching naming conventions in Effect and FP repositories.

## Mission
Document file naming patterns used in leading Effect/FP ecosystems.

## Repositories to Research

### 1. Effect-TS (Primary)
- https://github.com/Effect-TS/effect
- File naming patterns
- Module structure
- Export conventions

### 2. Related Effect Ecosystem
- @effect/platform
- @effect/sql
- @effect/schema

### 3. Functional Programming Repos
- fp-ts patterns
- io-ts patterns
- Scala ZIO naming conventions
- Haskell module conventions

## For Each Repository
Document:
- File postfix conventions (if any)
- Folder casing patterns
- Barrel export style
- Module organization

## Key Questions
1. Does Effect use postfixes like .service.ts or .model.ts?
2. How does Effect organize modules?
3. What barrel export pattern does Effect use?
4. How are type files separated from implementation?

## Output
Create outputs/fp-repo-conventions.md with:
- Repository-by-repository analysis
- Common patterns across repos
- Patterns unique to Effect
- Recommendations for beep-effect
```

### Web Researcher - Industry Best Practices

```
You are researching industry-standard naming conventions.

## Mission
Compile naming best practices from Clean Architecture, DDD, and monorepo tooling.

## Research Topics

### 1. Clean Architecture
- Domain layer naming conventions
- Application layer naming
- Infrastructure layer naming
- Presentation layer naming

### 2. Domain-Driven Design
- Bounded context naming
- Entity vs Value Object naming
- Aggregate naming
- Service naming conventions

### 3. Monorepo Conventions
- Nx workspace patterns
- Turborepo naming conventions
- Lerna package naming

### 4. TypeScript Community
- DefinitelyTyped conventions
- Major library patterns (React, Angular, Vue)
- TypeScript style guides

## Key Questions
1. Is there industry consensus on file postfixes?
2. What casing is most common for TypeScript projects?
3. How do large codebases organize modules?
4. What patterns aid code navigation and search?

## Output
Create outputs/industry-best-practices.md with:
- Findings per topic
- Comparison table of conventions
- Recommendations with rationale
- Citations/sources
```

### MCP Researcher - Category Theory Naming

```
You are researching category-theory-informed naming patterns.

## Mission
Research how category theory concepts map to file/module naming.

## Research Topics

### 1. Functor/Monad Naming
- How to name transformation modules
- Effect vs operation naming
- Composition patterns in names

### 2. Type Class Naming
- Service vs Instance naming patterns
- Implementation vs interface naming
- Layer naming conventions

### 3. Algebraic Data Types
- Tagged union naming
- Product type naming
- Sum type naming
- Newtype/branded type naming

### 4. Effect-Specific Patterns
- How Effect library names things
- Schema vs Codec naming
- Service vs Layer naming
- Error type naming

## Sources
- Effect documentation
- Category theory resources
- FP naming conventions literature

## Output
Create outputs/category-theory-naming.md with:
- Concept-to-naming mappings
- Effect-specific patterns
- Recommendations for beep-effect
```

---

## Phase 2: Synthesis & Standards Definition

### Reflector - Category Taxonomy Synthesis

```
You are synthesizing file category taxonomy from research.

## Mission
Create a definitive file category taxonomy for beep-effect.

## Inputs to Synthesize
1. outputs/existing-patterns-audit.md (Phase 0)
2. outputs/file-category-inventory.md (Phase 0)
3. outputs/fp-repo-conventions.md (Phase 1)
4. outputs/ai-codebase-standards.md (Phase 1)
5. outputs/industry-best-practices.md (Phase 1)
6. outputs/category-theory-naming.md (Phase 1)

## Synthesis Process

### 1. Map Internal to External
- Which internal patterns align with external best practices?
- Which internal patterns deviate?
- What new categories should be added?

### 2. Resolve Conflicts
- When sources disagree, which takes precedence?
- Document rationale for each decision

### 3. Layer Alignment
- Ensure each category maps to exactly one layer
- Categories that span layers need splitting

### 4. Postfix Assignment
- Assign canonical postfix to each category
- Ensure postfixes are unique and greppable
- Document any exceptions

## Output Format
Create outputs/category-taxonomy.md with:

| Category | Postfix | Layer | Description | Example |
|----------|---------|-------|-------------|---------|
| Domain Model | .model.ts | domain | Entity schemas | Member.model.ts |

Include rationale section explaining key decisions.
```

### Reflector - Casing Decision Matrix

```
You are defining casing rules for beep-effect.

## Mission
Create definitive casing rules for files, folders, and exports.

## Decision Areas

### 1. File Casing
Define when to use:
- kebab-case: sign-in.handler.ts
- PascalCase: Member.model.ts
- lowercase: index.ts, mod.ts

### 2. Folder Casing
Define when to use:
- PascalCase: Entity folders (Member/, ApiKey/)
- kebab-case: Feature folders (sign-in/, two-factor/)
- lowercase: Structural folders (src/, test/)

### 3. Export Casing
Define when to use:
- PascalCase: Type exports, namespace exports
- camelCase: Value exports, function exports
- SCREAMING_CASE: Constants

## Decision Criteria
For each rule, document:
- The rule
- Rationale (why this choice?)
- Evidence (which sources support this?)
- Exceptions (when does rule not apply?)
- Examples (correct and incorrect)

## Output
Create outputs/casing-decision-matrix.md with:
- Rules table
- Rationale for each rule
- Quick reference guide
- Common mistake examples
```

### Doc Writer - Naming Rules Draft

```
You are drafting the naming conventions rules file.

## Mission
Create a draft of .claude/rules/naming-conventions.md

## Target Location
outputs/naming-rules-draft.md (draft for review)
Final: .claude/rules/naming-conventions.md

## Required Sections

### 1. File Postfix Taxonomy
Complete postfix reference table:
| Postfix | Purpose | Layer | Example |
|---------|---------|-------|---------|

### 2. Casing Standards
File, folder, and export casing rules with examples.

### 3. Module Structure
When to use mod.ts + index.ts vs direct exports.

### 4. Verification Commands
```bash
# Check for non-compliant files
find packages -name "*.ts" | grep -v ...
```

### 5. Examples Section
Correct naming examples for each category.

### 6. Anti-Patterns
Common mistakes to avoid.

## Style Requirements
- Follow existing .claude/rules/*.md style
- Include complete code examples
- Use tables for quick reference
- Cross-reference to documentation/patterns/

## Output
Create outputs/naming-rules-draft.md
```

### Architecture Pattern Enforcer - Standards Validation

```
You are validating proposed naming standards.

## Mission
Ensure proposed naming standards are valid and implementable.

## Validation Checks

### 1. Layer Alignment
- [ ] Each category maps to exactly one layer
- [ ] No ambiguous categories
- [ ] Categories cover all existing file types

### 2. Effect Patterns
- [ ] Standards align with Effect conventions
- [ ] Service/Layer naming is consistent
- [ ] Schema naming follows Effect patterns

### 3. Grep/Glob Validity
- [ ] All postfixes are unique
- [ ] Postfixes enable precise glob patterns
- [ ] No collision between patterns

### 4. Migration Impact
- [ ] Estimate number of files needing rename
- [ ] Identify breaking changes
- [ ] Flag high-risk renames

### 5. Tooling Compatibility
- [ ] IDE support for proposed patterns
- [ ] ESLint/Biome integration possible
- [ ] TypeScript path alias compatibility

## Output
Create outputs/validation-report.md with:
- Validation results per check
- Issues found
- Recommended changes
- Final approval status
```

---

## Cross-Phase Prompts

### Reflector - Session Synthesis

```
You are synthesizing learnings from the current phase.

## Mission
Analyze phase execution and extract actionable improvements.

## Analysis Areas

1. **What worked well?**
   - Effective search patterns
   - Useful research sources
   - Clear findings

2. **What was challenging?**
   - Unexpected patterns
   - Conflicting information
   - Unclear boundaries

3. **What should change?**
   - Prompt improvements
   - Process refinements
   - Research gaps

4. **Learnings for implementation**
   - Key decisions to preserve
   - Gotchas discovered
   - Dependencies identified

## Output
Update REFLECTION_LOG.md with structured findings.
```

### Handoff Writer - Phase Transition

```
You are creating handoff documents for the next phase.

## Mission
Create BOTH handoff files for Phase [N+1].

## File 1: HANDOFF_P[N+1].md

### Required Sections
1. Phase [N] Summary
   - What was accomplished
   - Key findings
   - Artifacts created

2. Current State
   - Outputs completed
   - Open questions
   - Dependencies

3. Phase [N+1] Objectives
   - Specific tasks
   - Expected outcomes
   - Success criteria

4. Context to Preserve
   - Important decisions
   - Key patterns found
   - Gotchas discovered

5. Reference Files
   - Key outputs to review
   - Documentation to read

## File 2: P[N+1]_ORCHESTRATOR_PROMPT.md

Copy-paste ready prompt to start Phase [N+1]:

---

# Phase [N+1] Orchestrator Prompt

Copy-paste this prompt to start Phase [N+1].

## Context
[Brief summary of previous phase]

## Mission
[What this phase accomplishes]

## Tasks
[Numbered task list]

## Reference Files
[Files to read before starting]

## Success Criteria
- [ ] [Checklist items]

---

Read full context in: specs/canonical-naming-conventions/handoffs/HANDOFF_P[N+1].md
```
