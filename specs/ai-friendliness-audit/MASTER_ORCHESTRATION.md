# AI-Friendliness Audit: Master Orchestration Plan

> A systematic approach to auditing and improving the `beep-effect` monorepo for optimal AI-assisted development.

**Created**: 2026-01-06
**Scope**: Full repository audit across ~80 packages
**Methodology**: Three-phase workflow with structured feedback loops

---

## Executive Summary

This document orchestrates a comprehensive AI-friendliness audit of the beep-effect TypeScript monorepo. The goal is to improve the codebase's comprehensibility for AI coding assistants through systematic evaluation of documentation, structure, tooling, and pattern consistency.

### Key Principles

1. **English Feedback Loops**: Generate diagnostic explanations, not pass/fail scores
2. **Progressive Disclosure**: Use hierarchical AGENTS.md files and Claude Skills
3. **Phase Separation**: Discovery (read-only) → Evaluation → Synthesis
4. **Self-Reflection Checkpoints**: Validate findings before proceeding
5. **Continuous Methodology Improvement**: Log reflections to improve the audit process itself

---

## PHASE 1: Discovery (Read-Only)

**Objective**: Map the codebase architecture without modifications. Output: `audit-context.md`

### 1.1 Architectural Mapping

Execute these read-only exploration tasks:

```bash
# Repository structure overview
ls -la apps/ packages/ tooling/

# Package count and organization
find packages -name "package.json" -type f | wc -l

# Monorepo tooling identification
cat turbo.json | head -50
cat package.json | grep -A5 "workspaces"

# Configuration cascade
cat tsconfig.base.jsonc | head -100
ls tsconfig.slices/
```

### 1.2 Documentation Inventory

Catalog existing documentation artifacts:

| Location                  | Type              | Purpose                |
|---------------------------|-------------------|------------------------|
| `CLAUDE.md`               | Root instructions | AI agent guardrails    |
| `AGENTS.md`               | Package-level     | Per-package guidance   |
| `README.md`               | Package docs      | Developer onboarding   |
| `documentation/patterns/` | Pattern library   | Implementation recipes |

**Discovery Task**: For each package, record:
- Has AGENTS.md? (boolean)
- Has README.md? (boolean)
- JSDoc coverage estimate (none/sparse/moderate/comprehensive)

### 1.3 Dependency Graph Analysis

```bash
# Visualize package relationships
bun run graph 2>/dev/null || echo "No graph command available"

# Cross-slice imports check
grep -r "from \"@beep/" packages/iam/domain/src/ | head -20
grep -r "from \"@beep/" packages/documents/domain/src/ | head -20
```

### 1.4 Discovery Checkpoint

Before proceeding to Phase 2, validate:

- [ ] All apps/ directories documented
- [ ] All packages/ directories cataloged
- [ ] Monorepo tool identified (Turborepo)
- [ ] Configuration cascade understood
- [ ] Cross-slice import patterns documented

**Output**: Create `specs/ai-friendliness-audit/audit-context.md` with findings.

---

## PHASE 2: Criteria Evaluation

**Objective**: Score each AI-friendliness dimension with specific evidence.

### 2.1 Evaluation Dimensions

Score each dimension 1-5 using the rubrics below. For each finding, provide:

```markdown
**Issue identified**: [specific problem found]
**File:line**: [exact location with line number]
**Why this matters for AI comprehension**: [explanation]
**Suggested improvement**: [actionable recommendation]
**Confidence level**: [high/medium/low with reasoning]
```

### 2.2 Documentation Quality (Weight: High)

#### Rubric

| Score | Criteria                                                          |
|-------|-------------------------------------------------------------------|
| 5     | All public APIs have JSDoc with types, descriptions, and @example |
| 4     | Most public APIs documented, examples for complex functions       |
| 3     | Basic JSDoc coverage, missing examples                            |
| 2     | Sporadic documentation, inconsistent format                       |
| 1     | No meaningful documentation                                       |

#### Evaluation Tasks

**A. README Completeness**
```bash
# Check each package for README
for pkg in packages/*/*/; do
  if [ -f "${pkg}README.md" ]; then
    echo "EXISTS: ${pkg}README.md"
  else
    echo "MISSING: ${pkg}README.md"
  fi
done
```

**B. JSDoc Coverage Analysis**
Sample 5 representative packages and evaluate:
- `packages/common/contract/src/` - Core contract system
- `packages/shared/domain/src/` - Cross-slice entities
- `packages/iam/domain/src/` - Feature slice domain
- `packages/documents/server/src/` - Infrastructure layer
- `packages/ui/ui/src/` - React components

For each, count:
- Total exported functions/classes
- Functions with JSDoc
- Functions with @example blocks

**C. Type Annotation Quality**
Check for any `any` escape hatches:
```bash
grep -rn "any\b" packages/*/src/*.ts --include="*.ts" | head -30
grep -rn "@ts-ignore" packages/ --include="*.ts" | head -20
```

### 2.3 Structural Clarity (Weight: High)

#### Rubric

| Score | Criteria                                                        |
|-------|-----------------------------------------------------------------|
| 5     | Predictable naming, clear boundaries, barrel exports, no cycles |
| 4     | Good organization with minor inconsistencies                    |
| 3     | Reasonable structure but some confusion points                  |
| 2     | Unclear boundaries, inconsistent patterns                       |
| 1     | Chaotic organization, circular dependencies                     |

#### Evaluation Tasks

**A. Barrel Export Consistency**
```bash
# Check for index.ts barrel files
find packages -name "index.ts" -path "*/src/*" | head -30

# Verify packages export through barrels
for pkg in packages/*/*/package.json; do
  dir=$(dirname "$pkg")
  if [ ! -f "${dir}/src/index.ts" ]; then
    echo "NO BARREL: ${dir}"
  fi
done
```

**B. Naming Convention Audit**
Check for consistent naming:
- Files: kebab-case for modules, PascalCase for components/classes
- Exports: PascalCase for types/classes, camelCase for functions
- Directories: lowercase with hyphens

**C. Module Boundary Verification**
```bash
# Apps should only import from packages/
grep -rn "from \"\.\." apps/web/src/ | grep -v "node_modules" | head -20
grep -rn "from \"@beep/.*-domain" apps/server/src/ | head -20
```

### 2.4 Tooling Integration (Weight: Medium)

#### Rubric

| Score | Criteria                                                       |
|-------|----------------------------------------------------------------|
| 5     | Comprehensive linting, strict types, full test coverage, CI/CD |
| 4     | Good tooling with minor gaps                                   |
| 3     | Basic tooling, some manual steps                               |
| 2     | Minimal tooling, many manual processes                         |
| 1     | No tooling                                                     |

#### Evaluation Tasks

**A. TypeScript Strictness**
```bash
cat tsconfig.base.jsonc | grep -A10 "compilerOptions"
```

**B. Linting Configuration**
```bash
cat biome.jsonc | head -50
```

**C. Test Infrastructure**
```bash
find packages -name "*.test.ts" | wc -l
cat tooling/testkit/package.json
```

### 2.5 Pattern Consistency (Weight: Medium)

#### Rubric

| Score | Criteria                                                          |
|-------|-------------------------------------------------------------------|
| 5     | 100% Effect idioms, consistent error handling, uniform API design |
| 4     | Strong patterns with minor deviations                             |
| 3     | Mixed patterns, some legacy code                                  |
| 2     | Inconsistent patterns causing confusion                           |
| 1     | No discernible patterns                                           |

#### Evaluation Tasks

**A. Effect Pattern Compliance**
Check CLAUDE.md critical rules are followed:
```bash
# Native array method violations
grep -rn "\.map\(" packages/*/src/*.ts --include="*.ts" | grep -v "A.map" | head -20
grep -rn "\.filter\(" packages/*/src/*.ts --include="*.ts" | grep -v "A.filter" | head -20

# Native Date violations
grep -rn "new Date\(\)" packages/*/src/*.ts --include="*.ts" | head -20

# Switch statement violations
grep -rn "switch\s*\(" packages/*/src/*.ts --include="*.ts" | head -20
```

**B. Error Handling Consistency**
```bash
# Check for TaggedError usage
grep -rn "TaggedError" packages/*/src/*.ts | wc -l

# Check for Effect.fail with tags
grep -rn "Effect.fail" packages/*/src/*.ts | head -20
```

**C. Import Convention Compliance**
```bash
# Verify namespace imports for Effect modules
grep -rn "import \* as Effect" packages/*/src/*.ts | head -10
grep -rn "import { Effect }" packages/*/src/*.ts | head -10  # Should be zero
```

### 2.6 Evaluation Checkpoint

Before proceeding to Phase 3, reflect:

- [ ] Did I verify each issue against actual code?
- [ ] Are my file:line references accurate?
- [ ] Have I checked all vertical slices, not just one?
- [ ] Could I have misinterpreted any patterns?
- [ ] Are there false positives in my grep searches?

**Output**: Create `specs/ai-friendliness-audit/evaluation-report.md` with findings.

---

## PHASE 3: Synthesis and Recommendations

**Objective**: Prioritize findings and generate actionable remediation plan.

### 3.1 Findings Consolidation

Aggregate scores across all dimensions:

| Package         | Documentation | Structure | Tooling | Patterns | Overall |
|-----------------|---------------|-----------|---------|----------|---------|
| common/contract | ?             | ?         | ?       | ?        | ?       |
| shared/domain   | ?             | ?         | ?       | ?        | ?       |
| iam/domain      | ?             | ?         | ?       | ?        | ?       |
| ...             | ...           | ...       | ...     | ...      | ...     |

### 3.2 Impact Prioritization Matrix

Categorize findings by:

| Impact | Effort | Priority                |
|--------|--------|-------------------------|
| High   | Low    | P1 - Immediate          |
| High   | High   | P2 - This Sprint        |
| Low    | Low    | P3 - When Convenient    |
| Low    | High   | P4 - Consider Deferring |

### 3.3 Remediation Categories

#### A. CLAUDE.md Optimization

Current CLAUDE.md is ~400 lines. Research suggests staying under 60 lines for maximum adherence.

**Recommendation**:
1. Extract detailed rules into AGENTS.md files
2. Convert complex patterns into Claude Skills
3. Keep root CLAUDE.md focused on critical-path instructions

#### B. AGENTS.md Hierarchy

Create/update package-level AGENTS.md files with:
- Package-specific commands
- Critical file locations
- Local patterns and quirks
- Integration points with other packages

#### C. JSDoc Enhancement Strategy

For public APIs lacking documentation:
1. Identify top 20 most-used exports
2. Add JSDoc with @example blocks
3. Include @since and @category tags

#### D. Structural Improvements

1. Missing barrel exports
2. Inconsistent naming
3. Boundary violations

#### E. Pattern Alignment

1. Effect idiom violations
2. Forbidden native API usage
3. Error handling gaps

### 3.4 Before/After Examples

For each high-priority finding, generate:

```markdown
**Issue**: [description]
**Location**: [file:line]

**Before**:
```typescript
// Current problematic code
```

**After**:
```typescript
// Recommended fix
```

**Impact**: [Why this improves AI comprehension]
```

### 3.5 Synthesis Checkpoint

Before finalizing:

- [ ] Are all recommendations actionable within 1 sprint?
- [ ] Did I provide before/after examples for top findings?
- [ ] Have I avoided scope creep beyond AI-friendliness?
- [ ] Is the remediation plan ordered by impact?

**Output**: Create `specs/ai-friendliness-audit/remediation-plan.md`

---

## Self-Reflection Protocol

After completing each phase, run this self-check:

### Correctness Check
- Does this finding apply to THIS specific codebase?
- Did I verify this pattern actually exists in the code?
- Could I have misinterpreted the architecture?
- Am I conflating different packages or patterns?

### Completeness Check
- Are there edge cases I haven't considered?
- Have I checked all relevant files, not just obvious ones?
- Would a developer find this actionable?
- Did I check all vertical slices (IAM, Documents, etc.)?

### Quality Check
- Is my recommendation specific enough to implement?
- Have I provided concrete file paths and line numbers?
- Did I include before/after examples where helpful?
- Is the priority level justified?

---

## Execution Protocol

### Parallel Agent Deployment

For efficiency, deploy multiple specialized agents simultaneously:

| Agent | Focus Area | Output |
|-------|------------|--------|
| doc-auditor | Documentation quality | doc-audit.md |
| structure-auditor | Naming, boundaries, exports | structure-audit.md |
| pattern-auditor | Effect idioms, error handling | pattern-audit.md |
| config-auditor | tsconfig, biome, turbo | config-audit.md |

### Agent Prompt Template

```markdown
# [Focus Area] Audit Agent

## Scope
Evaluate the beep-effect monorepo for [specific dimension].

## Methodology
1. Read relevant configuration files
2. Sample representative packages
3. Search for violations of documented patterns
4. Generate structured findings

## Output Format
For each finding:
- **Issue**: [specific problem]
- **Location**: [file:line]
- **Severity**: [critical/high/medium/low]
- **Evidence**: [grep output or code snippet]
- **Recommendation**: [fix with example]

## Constraints
- DO NOT modify any files
- Reference CLAUDE.md rules for pattern expectations
- Focus only on [dimension], not adjacent concerns
```

### Consolidation Workflow

1. Wait for all parallel agents to complete
2. Merge findings into unified report
3. De-duplicate overlapping issues
4. Assign final priorities
5. Generate master remediation plan

---

## Critical Rules

| MUST                                | NEVER                                                 |
|-------------------------------------|-------------------------------------------------------|
| Verify findings against actual code | Suggest changes without current vs. improved examples |
| Provide file paths and line numbers | Report issues in generated/vendored/node_modules      |
| Focus on AI comprehension impact    | Over-engineer solutions beyond what's needed          |
| Use structured feedback format      | Generate scalar scores without explanation            |
| Respect package boundaries          | Conflate different vertical slices                    |

---

## Expected Outputs

1. **audit-context.md** - Architectural mapping and documentation inventory
2. **evaluation-report.md** - Scored dimensions with evidence
3. **remediation-plan.md** - Prioritized action items with examples
4. **optimized-claude-md.md** - Suggested CLAUDE.md improvements
5. **agents-md-templates/** - Package-level AGENTS.md recommendations

---

## Success Criteria

The audit is successful when:

1. All packages have been evaluated against all dimensions
2. Every finding includes file:line references
3. Top 10 issues have before/after code examples
4. Remediation plan is ordered by impact/effort ratio
5. CLAUDE.md optimization reduces to <100 lines
6. Package AGENTS.md coverage reaches >80%

---

## Appendix A: Package Inventory

| Category  | Packages                                                               |
|-----------|------------------------------------------------------------------------|
| Apps      | web, server, interfere, notes                                          |
| Common    | constants, contract, errors, identity, invariant, schema, types, utils |
| Shared    | domain, infra, client, tables, ui                                      |
| IAM       | domain, infra, client, tables, ui                                      |
| Documents | domain, infra, client, tables, ui                                      |
| Runtime   | client, server                                                         |
| UI        | core, ui                                                               |
| Tooling   | cli, repo-scripts, testkit, utils                                      |
| Internal  | db-admin                                                               |

---

## Appendix B: Grep Pattern Reference

```bash
# Effect pattern violations
grep -rn "\.map\(" --include="*.ts" | grep -v "A\.map"
grep -rn "\.filter\(" --include="*.ts" | grep -v "A\.filter"
grep -rn "new Date()" --include="*.ts"
grep -rn "switch\s*\(" --include="*.ts"
grep -rn ": any\b" --include="*.ts"
grep -rn "@ts-ignore" --include="*.ts"
grep -rn "async\s+function" --include="*.ts"
grep -rn "await\s+" --include="*.ts" | grep -v "Effect"

# Documentation coverage
grep -rn "/\*\*" --include="*.ts" -c
grep -rn "@example" --include="*.ts" -c

# Import violations
grep -rn "import { Effect }" --include="*.ts"
grep -rn "from \"\.\." --include="*.ts"
```

---

## Appendix C: Reflection Integration

### Continuous Improvement Loop

This audit methodology is itself subject to improvement. Use `REFLECTION_LOG.md` to capture learnings.

### When to Reflect

| Trigger                                      | Action                        |
|----------------------------------------------|-------------------------------|
| After each phase completion                  | Add reflection entry          |
| When a grep pattern produces false positives | Log pattern refinement        |
| When rubric feels miscalibrated              | Log threshold adjustment      |
| When finding something unexpected            | Log codebase-specific insight |
| When an approach wastes time                 | Log what to avoid             |

### Reflection Entry Format

```markdown
## [DATE] - [PHASE].[TASK] Reflection

### What Worked
- [Effective technique]

### What Didn't Work
- [Ineffective approach]

### Methodology Improvements
- [ ] [Change to spec files]

### Prompt Refinements
**Original**: [quote]
**Problem**: [issue]
**Refined**: [improvement]

### Codebase-Specific Insights
- [Discovery about beep-effect]
```

### Applying Improvements

After each reflection entry:

1. **Immediate**: If the improvement is clearly beneficial, update the relevant spec file
2. **Deferred**: If uncertain, mark as PENDING in the Accumulated Improvements table
3. **Validated**: After testing the improvement, mark as APPLIED

### Meta-Reflection Checkpoints

| Checkpoint               | Questions                                       |
|--------------------------|-------------------------------------------------|
| After Phase 1            | Was discovery thorough enough? What was missed? |
| After Each Dimension     | Was the rubric calibrated correctly?            |
| After Phase 2            | Did evaluation cover all important areas?       |
| After Phase 3            | Were recommendations actionable?                |
| After Remediation Starts | Are fixes actually improving AI comprehension?  |

### Improvement Categories to Track

1. **Grep Patterns**: Refinements to reduce false positives/negatives
2. **Sampling Strategy**: Better ways to select representative packages
3. **Scoring Calibration**: Adjustments to rubric thresholds
4. **Agent Prompts**: Improvements to parallel agent instructions
5. **Output Templates**: Better formats for findings and recommendations

### End-of-Audit Retrospective

Before closing the audit, complete this summary in REFLECTION_LOG.md:

```markdown
## Lessons Learned Summary

### Top 3 Most Valuable Techniques
1. [What contributed most to audit quality]

### Top 3 Wasted Efforts
1. [What should be skipped next time]

### Recommended Changes for Next Audit
1. [Specific methodology change]
```

This creates a flywheel: each audit improves the methodology for the next audit.
