---
name: improve-readme-updater-agent-performance
version: 1
created: 2026-01-07T00:00:00Z
iterations: 0
---

# Improve README-Updater Agent Performance - Refined Prompt

## Context

The `readme-updater` agent at `.claude/agents/readme-updater.md` is a 350-line documentation maintainer for the beep-effect monorepo. Analysis of 9 other agent files in this repo reveals performance gaps:

**Current Agent Strengths:**
- Clear 5-phase workflow (Discovery → Validation → Known Packages → Create → Update)
- Comprehensive package list (40+ packages mapped)
- Layer-specific templates (domain, infra, client, ui, tables)
- Structured output format specification

**Identified Performance Gaps:**
1. **No Decision Tree** - Unlike `effect-predicate-master.md` which has 15-step decision logic
2. **No Verification Phase** - Unlike `jsdoc-fixer.md` Phase 4 which mandates pass/fail checks
3. **No Anti-Pattern Gallery** - No FORBIDDEN vs REQUIRED examples for README content
4. **No Error Recovery** - No guidance when package.json is malformed or source missing
5. **No Before/After Examples** - Only shows template, not comparison of bad vs good
6. **Static Package List** - Hardcoded list may become stale; no dynamic discovery fallback
7. **No MCP Tool Integration** - Doesn't leverage available MCP tools for validation
8. **Weak Output Metrics** - Lists files created but not quality indicators

**High-Performing Agent Patterns (from codebase analysis):**
- `jsdoc-fixer.md`: Mandatory verification with "NEVER claim success if docgen fails"
- `effect-predicate-master.md`: Decision trees + replacement pattern tables
- `tsconfig-auditor.md`: Topological ordering + comprehensive mapping tables
- `prompt-refiner.md`: Immutable originals + iteration tracking + metadata

## Objective

Produce a concrete improvement plan for `.claude/agents/readme-updater.md` that:
1. Adds a decision tree for README creation/update logic
2. Introduces a mandatory verification phase (Phase 6)
3. Includes anti-pattern gallery with FORBIDDEN/REQUIRED examples
4. Adds error recovery section for common failure modes
5. Provides before/after README examples
6. Enhances output metrics with quality indicators
7. Optionally integrates dynamic package discovery

**Success Criteria:**
- Plan contains specific code/text additions (not vague suggestions)
- Each improvement maps to a pattern from high-performing agents
- Plan is implementable in a single editing session

## Role

You are a **prompt engineering specialist** with expertise in:
- Claude agent prompt optimization
- Monorepo documentation systems
- Effect-TS patterns and conventions
- Structured output specifications

## Constraints

### Repository Standards (from AGENTS.md files)
- All code examples must use Effect namespace imports (`import * as A from "effect/Array"`)
- FORBIDDEN: native `.map()`, `.filter()`, async/await, bare `process.env`
- REQUIRED: `F.pipe()`, `Effect.gen`, `Effect.Config`, `S.TaggedError`
- Cross-slice imports only through `@beep/shared/*` or `@beep/common/*`

### Agent Prompt Standards (from codebase analysis)
- Use ALL CAPS for CRITICAL sections
- Use NEVER/MUST language for non-negotiable rules
- Include explicit DO/DO NOT lists
- Provide decision trees for complex logic
- Define verification checkpoints with pass/fail criteria

### Format Constraints
- Plan must be actionable (specific edits, not abstract advice)
- Each section must reference the source pattern it's modeled after
- Keep total additions under 200 lines to maintain agent readability

## Resources

### Files to Read
| File | Purpose |
|------|---------|
| `.claude/agents/readme-updater.md` | Target file to improve |
| `.claude/agents/jsdoc-fixer.md` | Model for verification phase |
| `.claude/agents/effect-predicate-master.md` | Model for decision trees |
| `.claude/agents/tsconfig-auditor.md` | Model for mapping tables |

### Reference Patterns
| Pattern | Source | Applicable Section |
|---------|--------|-------------------|
| Decision Tree | effect-predicate-master.md | Phase logic |
| Verification Phase | jsdoc-fixer.md Phase 4 | New Phase 6 |
| DO/DO NOT Lists | jsdoc-fixer.md, effect-predicate-master.md | Important Notes |
| Error Recovery | jsdoc-fixer.md "If Generation Fails" | New Error Handling section |
| Output Metrics | prompt-refiner.md Refinement History | Output Format |

## Output Specification

### Required Deliverable
A structured improvement plan with these sections:

```markdown
# README-Updater Agent Improvement Plan

## 1. Decision Tree Addition
[Specific markdown to add after Phase 1, modeling effect-predicate-master.md]

## 2. Verification Phase (Phase 6)
[Complete new phase text, modeling jsdoc-fixer.md Phase 4]

## 3. Anti-Pattern Gallery
[FORBIDDEN vs REQUIRED examples for README content]

## 4. Error Recovery Section
[Specific failure modes and recovery actions]

## 5. Before/After Examples
[Bad README excerpt → Good README excerpt]

## 6. Enhanced Output Metrics
[Updated Output Format section with quality indicators]

## 7. Dynamic Discovery Enhancement (Optional)
[Fallback when hardcoded package list is stale]

## Implementation Checklist
- [ ] Add decision tree after Phase 1
- [ ] Insert Phase 6: Verification before Output Format
- [ ] Add Anti-Pattern Gallery after Layer-Specific Templates
- [ ] Add Error Recovery after Important Notes
- [ ] Update Output Format with quality metrics
```

### Format Requirements
- Each section must include the exact text to add/modify
- Use diff-style markers (```diff) for modifications to existing sections
- Include line number references where applicable

## Examples

### Example: Decision Tree Pattern (from effect-predicate-master.md)
```markdown
### README Decision Tree

1. Does package have README.md?
   ├── No → Go to Phase 4 (Create)
   └── Yes → Continue to step 2

2. Does README match package.json name?
   ├── No → Flag for update, add to issues list
   └── Yes → Continue to step 3

3. Are import paths using @beep/* aliases?
   ├── No → Flag for update
   └── Yes → Continue to step 4

[...continue for all validation checks]
```

### Example: Verification Phase (from jsdoc-fixer.md)
```markdown
### Phase 6: Verification (CRITICAL)

After all README files are created/updated:

1. **Syntax Check**: Verify all README files are valid markdown
   - Run: `bun run lint:md` (if available) or manual review
   - MUST pass before proceeding

2. **Import Path Check**: Grep all README files for import statements
   - Verify each `@beep/*` import resolves to existing package
   - Flag any imports to non-existent packages

3. **Code Example Check**: For each code block in README files
   - Verify Effect namespace imports are used
   - Flag any native array/string methods

**CRITICAL**: NEVER report success if verification finds errors.
If errors found → list them in "Remaining Issues" section.
```

### Example: Anti-Pattern Gallery
```markdown
### Anti-Patterns (FORBIDDEN)

#### FORBIDDEN: Native Methods in Examples
```typescript
// BAD - native array method
const names = items.map(item => item.name);
```

#### REQUIRED: Effect Patterns in Examples
```typescript
// GOOD - Effect Array with pipe
const names = F.pipe(items, A.map(item => item.name));
```
```

## Verification Checklist

- [ ] Plan includes decision tree with at least 5 decision points
- [ ] Verification phase uses CRITICAL/NEVER/MUST language
- [ ] Anti-pattern gallery has at least 3 FORBIDDEN/REQUIRED pairs
- [ ] Error recovery covers: missing package.json, empty source dir, malformed exports
- [ ] Before/after example shows transformation of real README issues
- [ ] Output metrics include at least 2 quality indicators beyond file counts
- [ ] All code examples follow Effect namespace import conventions

---

## Metadata

### Research Sources
- Files Explored: `.claude/agents/*.md` (9 files)
- AGENTS.md Files: 51 across monorepo
- Documentation: `documentation/EFFECT_PATTERNS.md`, `documentation/PACKAGE_STRUCTURE.md`

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
