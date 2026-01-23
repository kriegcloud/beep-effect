# Reflection Log — Canonical Naming Conventions

> Cumulative learnings from research phases.

---

## Spec Bootstrap Reflection

**Date**: Spec scaffolding completed

### Structural Decisions

1. **Research-Only Scope**: Deliberately separated research from implementation to avoid premature decisions. The implementation spec will be created after standards are validated.

2. **Three-Phase Design**: Structured as Discovery → Research → Synthesis to maintain research integrity:
   - Phase 0: Internal observation only
   - Phase 1: External research only
   - Phase 2: Synthesis with evidence-based decisions

3. **Agent Selection**: Chose agents based on capability:
   - `codebase-researcher` for internal pattern discovery
   - `ai-trends-researcher` for AI documentation standards
   - `web-researcher` for industry best practices
   - `mcp-researcher` for Effect documentation
   - `reflector` for synthesis
   - `doc-writer` for rules drafting
   - `architecture-pattern-enforcer` for validation

### Key Constraints Identified

1. **Research Integrity**: Phases 0-1 must avoid normative judgments. All "should" statements belong in Phase 2 with supporting evidence.

2. **Grep Efficiency**: A core goal is enabling AI agents to understand file purpose from name alone. Postfixes must be unique and greppable.

3. **Layer Alignment**: Categories must map cleanly to architectural layers (domain → tables → server → client → ui).

### Preliminary Observations

From initial codebase observation:
- Mixed casing: PascalCase entity folders (`ApiKey/`), kebab-case features (`sign-in/`)
- Postfix usage: `.model.ts`, `.handler.ts` common; `.service.ts` less consistent
- Barrel pattern: Newer modules use `mod.ts` + `index.ts` namespace pattern

### Open Questions for Research

1. What does Effect-TS itself use for naming conventions?
2. Do AI documentation standards (llms.txt) specify naming patterns?
3. Is there academic work on AI-friendly code organization?
4. What casing maximizes cross-platform compatibility?

---

## Phase 0: Codebase Inventory

**Date**: Phase 0 completed

### Execution Summary

Research conducted via 4 parallel `codebase-researcher` agents:
1. Postfix Pattern Analysis
2. Folder Casing Analysis
3. Barrel Export Pattern Analysis
4. Layer-Specific File Types

### Key Findings

#### Quantitative Results

| Metric | Count |
|--------|-------|
| Total source files | 1717+ |
| Unique postfix patterns | 21 |
| index.ts files | 432 |
| mod.ts files | 49 |
| File categories identified | 66 |

#### High-Volume Postfixes

| Pattern | Count | Layer |
|---------|-------|-------|
| `.model.ts` | 46 | domain |
| `.table.ts` | 45 | tables |
| `.repo.ts` | 38 | server |
| `contract.ts` | 34 | client |
| `handler.ts` | 34 | client |

#### Major Inconsistencies Identified

1. **Schema file casing**: kebab-case (iam-domain) vs PascalCase (shared-domain)
2. **Table file casing**: camelCase (iam/documents) vs kebab-case (shared/comms)
3. **Layer file naming**: `layer.ts` (client) vs `.layer.ts` (runtime)
4. **Service file naming**: 3 distinct patterns across packages
5. **Handler naming**: singular (client) vs plural (server)
6. **Missing postfixes**: value objects, some schemas, adapters

### Research Questions Answered

**Q: What naming patterns are most prevalent?**
- A: `.model.ts`, `.table.ts`, `.repo.ts` dominate with 40+ files each
- The IAM client 4-file pattern (contract/handler/mod/index) is highly consistent

**Q: What inconsistencies cause the most confusion?**
- A: Schema file casing within domain entities (blocks consistent grep patterns)
- A: Table file casing across slices (iam uses camelCase, shared uses kebab-case)
- A: Value objects have no postfix, making discovery difficult

**Q: Which patterns should be preserved vs changed?**
- A: Preserve: `.model.ts`, `.table.ts`, `.repo.ts` (high adoption, clear purpose)
- A: Evaluate: Schema casing, table casing, layer naming (inconsistent)
- A: Add: Value object postfix (currently missing)

### Deliverables Produced

1. `outputs/existing-patterns-audit.md` - Complete postfix inventory with counts
2. `outputs/file-category-inventory.md` - 66 file categories by layer
3. `outputs/inconsistency-report.md` - 7 major inconsistency categories

### Verification Commands

```bash
# Verify postfix counts (run from project root)
find packages -name "*.model.ts" | wc -l      # ~46
find packages -name "*.table.ts" | wc -l      # ~45
find packages -name "*.repo.ts" | wc -l       # ~38
find packages -name "mod.ts" | wc -l          # ~49

# Verify folder casing
find packages -type d -path "*/entities/*" | head -20

# Verify schema casing inconsistency
find packages -path "*/schemas/*" -name "[A-Z]*" | wc -l  # PascalCase
find packages -path "*/schemas/*" -name "[a-z]*" | wc -l  # kebab-case
```

### Learnings for Phase 1

1. **Correlations to investigate**: Do Effect-TS patterns align with our high-volume patterns?
2. **Questions for external research**: Is kebab-case or camelCase more common for database files in industry?
3. **AI discoverability focus**: Value objects and adapters need greppable patterns

---

## Phase 1: External Research

**Date**: Phase 1 completed 2026-01-21

### Execution Summary

Research conducted via 4 parallel `ai-trends-researcher` agents:
1. AI-Friendly Codebase Standards (llms.txt, CLAUDE.md patterns)
2. Effect-TS Ecosystem Conventions (official repo analysis)
3. FP Language Naming Conventions (Haskell, Scala, PureScript, Elm)
4. Academic & DDD Foundations (Clean Architecture, category theory)

### Key Findings

#### Effect-TS Official Convention: kebab-case Files
**Source**: https://github.com/Effect-TS/effect
**Credibility**: HIGH

Effect official packages consistently use:
- **File names**: kebab-case (`http-client.ts`, `sql-client.ts`)
- **Namespace exports**: PascalCase (`export * as HttpClient from "./http-client.js"`)
- **Internal separation**: `internal/` directory for implementation details

This diverges from traditional FP (PascalCase files) and from beep-effect's current mixed patterns.

#### FP Ecosystem Consensus: PascalCase Modules
All surveyed FP languages (Haskell, Scala, PureScript, OCaml, F#, Elm) use PascalCase for module identifiers. Effect-TS is a notable outlier, prioritizing JavaScript ecosystem familiarity.

#### DDD: Conventions, Not Prescriptions
Evans' DDD and Vernon's implementation guides define tactical patterns (Entity, Repository, Service) as conceptual boundaries but do not prescribe file naming. Pattern suffixes (e.g., `UserRepository.ts`) are community convention, not DDD requirements.

#### Clean Architecture: Feature-First Over Layer-First
Uncle Bob emphasizes organizing by feature/use-case rather than technical layers. Dependency direction matters more than file naming conventions.

#### AI-Friendly Patterns: Greppability
llms.txt and CLAUDE.md patterns emphasize:
- Explicit discovery files complement naming conventions
- Descriptive names over abbreviations
- Consistent delimiter conventions (underscores for docs, hyphens for code)
- All-caps for meta files (README, CLAUDE, AGENTS)

#### No Empirical Consensus on Suffixes
No peer-reviewed research compares pattern suffixes (`UserRepository.ts`) vs semantic names (`Users.ts`). All arguments are theoretical or community practice.

### Deliverables Produced

1. `outputs/industry-best-practices.md` - AI-friendly codebase standards
2. `outputs/fp-repo-conventions.md` - Effect-TS and FP ecosystem patterns
3. `outputs/academic-research.md` - DDD and Clean Architecture foundations
4. `outputs/llms-txt-patterns.md` - Discovery file patterns

### Research Questions Answered

**Q: What conventions do leading repos use?**
- A: Effect-TS uses kebab-case files with PascalCase namespace exports
- A: FP languages (Haskell, Elm) enforce PascalCase file/module alignment
- A: DDD examples show pattern suffixes but no authoritative standard

**Q: What academic foundations exist for naming?**
- A: Code comprehension research shows semantic names improve understanding
- A: No empirical studies on pattern suffix effectiveness
- A: Clean Architecture prioritizes feature cohesion over naming rules

**Q: What AI-specific research exists?**
- A: llms.txt establishes machine-readable discovery standards
- A: Greppability (unique, searchable patterns) is core AI navigation principle
- A: Hierarchical directories preferred over flat structures with prefixes

### Key Tensions Identified

| Tension | Options | Implications |
|---------|---------|--------------|
| **File casing** | Effect (kebab-case) vs FP (PascalCase) | Ecosystem alignment vs tradition |
| **Pattern suffixes** | OOP (`UserRepository.ts`) vs FP (`Users.ts`) | Explicit vs semantic |
| **Organization** | Layer-first vs Feature-first | Technical vs domain cohesion |
| **Barrel exports** | Heavy (Effect) vs None (Elm) | Convenience vs tree-shaking |

### Learnings for Phase 2

1. **Effect alignment is strategic**: beep-effect depends on Effect. Aligning with Effect conventions may improve ecosystem consistency.

2. **Four viable naming patterns identified**:
   - OOP Suffix: `UserRepository.ts` (explicit)
   - FP Semantic: `Users.ts` (Effect-aligned)
   - Hybrid: `repositories/Users.ts` (directory context)
   - Feature-first: `users/repository.ts` (Clean Architecture)

3. **Evaluation criteria defined**:
   - Comprehension (developer navigation)
   - Consistency (Effect ecosystem alignment)
   - Maintainability (refactoring friction)
   - Ubiquitous language (domain vs jargon)
   - Tooling support (IDE, grep, imports)

---

## Phase 2: Synthesis

**Date**: Phase 2 completed 2026-01-21

### Execution Summary

Synthesis conducted via sequential document creation:
1. Category Taxonomy - 24 canonical postfixes defined
2. Casing Decision Matrix - kebab-case standardization with PascalCase exceptions
3. Module Structure Patterns - mod.ts + index.ts responsibilities clarified
4. Naming Rules Draft - Actionable rules file for `.claude/rules/`

### Key Decisions

#### Decision 1: kebab-case as Default File Casing

**Internal Evidence**: Entity folders (100% kebab-case), newer slices (shared, comms) use kebab-case, older slices (iam) use camelCase for tables.

**External Evidence**: Effect-TS official packages use kebab-case files (`http-client.ts`, `sql-client.ts`). This diverges from FP tradition (PascalCase) but aligns with JavaScript ecosystem.

**Decision**: Standardize on kebab-case for all files except:
- `.repo.ts` files (preserve PascalCase for entity name encoding)
- `.handlers.ts` files (same rationale)

**Migration Cost**: ~55 file renames (automated with `git mv`)

#### Decision 2: Add `.value.ts` Postfix for Value Objects

**Internal Evidence**: 10+ value objects lack postfix (`Attributes.ts`, `EvidenceSpan.ts`). One file uses `.values.ts` variant.

**External Evidence**: DDD explicitly distinguishes Value Objects from Entities. FP treats them as algebraic data types.

**Decision**: Add `.value.ts` postfix to enable grep discovery.

**Migration Cost**: ~10 file renames

#### Decision 3: Standardize Schema Postfix as `.schema.ts`

**Internal Evidence**: Three patterns exist:
- `.schema.ts` (8 files)
- `.schemas.ts` (6 files)
- No postfix in `schemas/` directory (~15 files)

**External Evidence**: Effect uses singular (`Schema.ts`). Singular aligns with "one definition per file" mental model.

**Decision**: Standardize on `.schema.ts` (singular) for all validation/enum schemas.

**Migration Cost**: ~21 file renames/postfix additions

#### Decision 4: Preserve mod.ts + index.ts Dual Pattern

**Internal Evidence**: IAM client 4-file pattern (contract/handler/mod/index) has 100% consistency across 49 mod.ts files.

**External Evidence**: Effect uses index.ts with namespace exports. Deno ecosystem uses mod.ts. Both patterns serve different purposes.

**Decision**:
- `index.ts` = Public API (what this module exports to consumers)
- `mod.ts` = Internal aggregation (what files compose this module)

Preserve both; expand mod.ts adoption to other client packages.

### Research Questions Answered

**Q: How do internal patterns align with external best practices?**
- A: Internal high-volume patterns (`.model.ts`, `.table.ts`, `.repo.ts`) align with DDD tactical patterns
- A: Internal casing (mixed) misaligns with Effect (kebab-case) — requires migration
- A: Internal barrel pattern (mod.ts + namespace) extends Effect pattern appropriately for larger features

**Q: What trade-offs exist between different conventions?**
- A: kebab-case vs PascalCase: Effect alignment vs FP tradition → Effect wins (ecosystem dependency)
- A: Pattern suffixes vs semantic names: Explicit vs Effect-style → Hybrid (suffixes for discovery, semantic within features)
- A: mod.ts everywhere vs index.ts only: Feature complexity vs simplicity → mod.ts for features, index.ts for packages

**Q: What is the minimal change set for maximum impact?**
- A: High impact, low cost:
  1. Table file casing standardization (~30 renames)
  2. Schema postfix standardization (~21 changes)
  3. Value object postfix addition (~10 renames)
- A: Low impact, avoid:
  - Changing repo/handler file casing (already consistent)
  - Restructuring mod.ts pattern (already working)

### Deliverables Produced

1. `outputs/category-taxonomy.md` - 24 canonical postfixes with layer mapping
2. `outputs/casing-decision-matrix.md` - Casing rules with migration cost
3. `outputs/module-structure-patterns.md` - mod.ts vs index.ts guidance
4. `outputs/naming-rules-draft.md` - Actionable rules file draft

### Learnings for Future Specs

1. **Evidence-Based Decisions Work**: Every decision in Phase 2 cited both internal adoption metrics and external research. This prevented bikeshedding and provided defensible rationale.

2. **Hybrid Approaches Beat Dogma**: Neither "all kebab-case" nor "all PascalCase" was correct. The hybrid (kebab-case default, PascalCase for entity-encoding files) minimizes migration while achieving consistency where it matters.

3. **Migration Cost as Decision Input**: Quantifying migration cost (~55 files vs ~200 files) influenced decisions. Small wins (consistent table casing) are worth more than large battles (rewriting all imports).

4. **Synthesis Requires Structure**: Creating four separate documents (taxonomy, casing, structure, rules) forced systematic coverage. A single "recommendations" doc would have been less rigorous.

### Next Steps

1. **Create Implementation Spec**: `specs/naming-conventions-refactor/` for actual file migrations
2. **Automate Detection**: Create lint rules or scripts to catch violations
3. **Coordinate Breaking Changes**: Namespace export changes require consumer migration
4. **MCP Refactor TypeScript**: Use `.claude/skills/mcp-refactor-typescript.md` for large-scale automated refactoring (file renames with import updates, symbol renames, dead code cleanup)

---

## Cross-Phase Insights

### Pattern Discoveries

**Phase 0 Discoveries:**

1. **Layer-Postfix Correlation**: Certain postfixes map exclusively to layers:
   - `.model.ts` → domain only
   - `.table.ts` → tables only
   - `.repo.ts` → server only
   - `.view.tsx` → ui only

2. **Evolutionary Inconsistency**: Older slices (iam, documents) use camelCase for tables; newer slices (shared, comms) use kebab-case. Suggests convention drift over time.

3. **mod.ts Pattern Isolation**: The Deno-style `mod.ts` pattern exists only in `@beep/iam-client`, suggesting it was adopted mid-project and not retrofitted.

4. **Feature vs Infrastructure Naming**: Client features use lowercase files (`handler.ts`, `layer.ts`), while server infrastructure uses PascalCase (`Authentication.layer.ts`). This appears intentional but undocumented.

5. **Schema Proliferation**: Three distinct schema patterns exist:
   - `.schema.ts` (singular)
   - `.schemas.ts` (plural)
   - No postfix in `schemas/` directory

6. **Value Object Gap**: 10+ value objects lack any semantic postfix, making them indistinguishable from utility classes.

**Phase 1 Discoveries:**

7. **Effect-TS Convention Divergence**: Effect official repos use kebab-case files with PascalCase exports—a unique pattern in FP ecosystem. This creates tension between "follow Effect" and "follow FP tradition."

8. **Discovery File Pattern**: llms.txt and CLAUDE.md establish explicit discovery layers that complement (not replace) naming conventions. Suggests beep-effect should leverage both explicit discovery and implicit naming.

9. **No Empirical Foundation**: All naming debates (suffixes vs semantic, plural vs singular) rest on theoretical arguments or community practice. No peer-reviewed studies compare approaches.

10. **Category Theory Scoping**: FP standard libraries (Haskell base) contain category-theoretic names (`Functor`, `Monad`) but domain code uses business terminology. Suggests pattern suffixes may be domain-inappropriate.

11. **Four Viable Patterns**: Research identified four distinct naming strategies:
    - OOP Suffix: `UserRepository.ts` (current beep-effect partial pattern)
    - FP Semantic: `Users.ts` (Effect-aligned)
    - Hybrid: `repositories/Users.ts` (directory-level context)
    - Feature-first: `users/repository.ts` (Clean Architecture)

12. **Greppability Principles**: AI agents rely on grep/search for navigation. Greppable patterns include:
    - Unique file names (avoid generic `index.ts` proliferation)
    - Consistent prefixes/suffixes (`HANDOFF_P0.md`, `_GUIDE.md`)
    - All-caps for meta files (README, CLAUDE, AGENTS)

### Conflicts Between Sources

**Phase 1 Conflicts:**

1. **Effect vs FP Tradition**:
   - Effect-TS: kebab-case files (`http-client.ts`)
   - Haskell/OCaml/Elm: PascalCase files (`HttpClient.hs`)
   - Conflict: Effect is an FP library that rejects FP file naming

2. **OOP vs FP Naming Philosophy**:
   - OOP: Pattern suffixes (`UserRepository.ts`, `OrderService.ts`)
   - FP: Semantic names (`Users.ts`, `Orders.ts`)
   - Conflict: beep-effect uses Effect (FP) but OOP-style suffixes

3. **DDD vs Clean Architecture Organization**:
   - DDD: Often shows layer-based directories (`repositories/`, `services/`)
   - Clean Architecture: Emphasizes feature-first (`users/`, `orders/`)
   - Conflict: Both are authoritative, recommend different structures

4. **Barrel Export Strategies**:
   - Effect: Heavy namespace exports (`export * as HttpClient`)
   - Elm: No barrel exports, explicit imports only
   - PureScript: Selective re-exports
   - Conflict: No consensus on best practice

5. **Plural vs Singular**:
   - Rails: Plural models (`users.rb`)
   - Java/.NET: Singular (`User.java`)
   - Conflict: Pure stylistic preference, no theoretical foundation

### Prompt Refinements

**Refinement 1: Postfix Pattern Search Scope**

*Before (initial AGENT_PROMPTS.md):*
```
Find all unique postfix patterns in packages/
```

*After (revised for precision):*
```
Find all unique postfix patterns:
- packages/iam/*/src/**/*.ts
- packages/documents/*/src/**/*.ts
- packages/shared/*/src/**/*.ts
Excluding: test files, node_modules, dist/
```

*Rationale*: Initial prompt was too broad, capturing build artifacts and dependencies. Explicit path targeting and exclusions improve signal-to-noise ratio.

---

**Refinement 2: Research Integrity Instructions**

*Before (implicit expectation):*
```
Document naming patterns found in Effect repositories
```

*After (explicit constraint):*
```
Document naming patterns found in Effect repositories.
CONSTRAINT: This is Phase 1 (Research). Report observations only.
Do NOT include normative statements ("should", "must", "better").
All judgments belong in Phase 2 with supporting evidence.
```

*Rationale*: Without explicit constraints, early phases mixed observation with recommendation, compromising research integrity for synthesis.

---

**Refinement 3: Success Metrics Quantification**

*Before (qualitative):*
```
Success Criteria:
- Complete inventory of existing patterns
- Exhaustive postfix taxonomy
```

*After (quantifiable):*
```
Success Criteria:
- 100% of unique postfixes documented (verified via grep)
- Pattern counts verifiable: `find packages -name "*.ts" | grep -oE '\.[a-z-]+\.tsx?$' | sort -u`
- ≥3 citations per research topic
```

*Rationale*: Qualitative criteria made phase completion subjective. Quantifiable metrics enable objective validation.

---

## Methodology Improvements

### Spec Structure Enhancements

After spec-reviewer feedback, added:
- `QUICK_START.md` for 5-minute orientation
- `MASTER_ORCHESTRATION.md` for complete workflow
- `AGENT_PROMPTS.md` for ready-to-use agent prompts
- `RUBRICS.md` for evaluation criteria
- `outputs/` directory for phase artifacts

### Research Integrity Framework

Established clear boundaries:
- Phase 0-1: Observation and research only (no "should" statements)
- Phase 2: Evidence-based synthesis (all decisions cite sources)

### Handoff Protocol

Each phase must produce:
1. `HANDOFF_P[N+1].md` - Complete context document
2. `P[N+1]_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt to start next session

---

## Lessons for Future Specs

### What Worked

1. **Parallel Agent Execution**: Running 4 `codebase-researcher` agents simultaneously reduced Phase 0 from ~20 minutes to ~5 minutes. Research tasks with independent scopes benefit from parallelization.

2. **Quantitative Focus**: Requiring file counts and percentages made findings verifiable and prevented subjective claims. "~46 .model.ts files" is more useful than "common pattern."

3. **Layer-Centric Organization**: Structuring research by architectural layer (domain → tables → server → client → ui) aligned with how the codebase is actually organized, making patterns easier to spot.

4. **Three-Deliverable Structure**: Separating audit, inventory, and inconsistency reports prevented documents from becoming unwieldy. Each serves a distinct purpose.

### What Didn't Work

1. **Initial Grep Patterns**: First grep attempts for postfixes missed many patterns because they searched for `\.[a-z]+\.ts$` which doesn't match `contract.ts` or `handler.ts` (no dot prefix). Revised to include both patterns.

2. **Underestimated Hybrid Patterns**: Assumed barrel exports would be one pattern per package. Reality: packages mix namespace, direct re-export, and named exports in the same file.

### Recommendations

1. **For Codebase Research Phases**: Always start with counting tools (wc, count mode) before detailed analysis. Raw counts guide where to dig deeper.

2. **For Multi-Agent Specs**: When tasks are independent, always run in parallel. Only serialize when one task's output informs another's input.

3. **For Pattern Audits**: Include both "formal patterns" (with postfixes) and "naming conventions" (without postfixes like `contract.ts`) in the same inventory to avoid blind spots.

4. **For Inconsistency Reports**: Categorize by impact level (high/medium/low) to help Phase 2 prioritize decisions.
