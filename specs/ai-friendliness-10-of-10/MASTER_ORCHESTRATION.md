# Master Orchestration: AI-Friendliness 10/10

Complete workflow for achieving maximum AI agent contribution effectiveness.

## Phase State Machine

```
P0:Discovery → P1:ai-context → P2:ErrorCatalog → P3:Onboarding →
P4:SelfHealing → P5:Validation → Complete
```

---

## Phase 0: Discovery & Baseline (1 session)

### Objective

Establish comprehensive baseline of current AI-friendliness state.

### Agents

- **Primary**: `codebase-researcher`
- **Support**: `architecture-pattern-enforcer`

### Tasks

| # | Task | Tool Calls | Output |
|---|------|------------|--------|
| 0.1 | Inventory all packages missing ai-context.md | 5-8 | `outputs/packages-inventory.md` |
| 0.2 | Catalog existing AGENTS.md quality | 8-12 | `outputs/agents-md-quality.md` |
| 0.3 | Identify common error patterns from specs | 10-15 | `outputs/error-patterns.md` |
| 0.4 | Audit abstract rules lacking examples | 5-8 | `outputs/rules-without-examples.md` |
| 0.5 | Assess onboarding friction points | 3-5 | `outputs/onboarding-gaps.md` |

### Success Criteria

- [ ] Complete package inventory with ai-context.md status
- [ ] Quality scores for all 66 AGENTS.md files
- [ ] 20+ error patterns identified from reflection logs
- [ ] List of all rules needing worked examples
- [ ] Onboarding friction points documented

### Verification

```bash
# Verify outputs exist
ls specs/ai-friendliness-10-of-10/outputs/
# Expected: 5 markdown files
```

---

## Phase 1: ai-context.md Generation (3-4 sessions)

### Objective

Create ai-context.md for all 62+ packages with consistent quality.

### Agents

- **Primary**: `documentation-expert`, `doc-writer`
- **Support**: `codebase-researcher`

### Sub-Phases

#### P1a: Templates & Tier-1 Packages (Session 1)

| # | Task | Packages | Output |
|---|------|----------|--------|
| 1a.1 | Create ai-context.md template | - | `templates/ai-context.template.md` |
| 1a.2 | Generate for shared/* | 8 packages | `packages/shared/*/ai-context.md` |
| 1a.3 | Generate for common/* | 8 packages | `packages/common/*/ai-context.md` |

#### P1b: Domain Slices (Session 2)

| # | Task | Packages | Output |
|---|------|----------|--------|
| 1b.1 | Generate for iam/* | 5 packages | `packages/iam/*/ai-context.md` |
| 1b.2 | Generate for documents/* | 5 packages | `packages/documents/*/ai-context.md` |
| 1b.3 | Generate for knowledge/* | 5 packages | `packages/knowledge/*/ai-context.md` |

#### P1c: Remaining Slices (Session 3)

| # | Task | Packages | Output |
|---|------|----------|--------|
| 1c.1 | Generate for calendar/* | 5 packages | `packages/calendar/*/ai-context.md` |
| 1c.2 | Generate for comms/* | 5 packages | `packages/comms/*/ai-context.md` |
| 1c.3 | Generate for customization/* | 5 packages | `packages/customization/*/ai-context.md` |
| 1c.4 | Generate for ui/* | 4 packages | `packages/ui/*/ai-context.md` |

#### P1d: Apps & Tooling (Session 4)

| # | Task | Packages | Output |
|---|------|----------|--------|
| 1d.1 | Generate for apps/* | 4 apps | `apps/*/ai-context.md` |
| 1d.2 | Generate for tooling/* | 5 packages | `tooling/*/ai-context.md` |
| 1d.3 | Generate for runtime/* | 2 packages | `packages/runtime/*/ai-context.md` |
| 1d.4 | Generate for _internal/* | 1 package | `packages/_internal/*/ai-context.md` |

### Template Structure

```markdown
---
path: packages/slice/layer
summary: One-line description for /modules listing
tags: [tag1, tag2, tag3]
---

# Module Name

## Architecture

[ASCII diagram of module structure]

## Core Modules

| Module | Purpose |
|--------|---------|
| `file.ts` | Description |

## Usage Patterns

[Code examples for common operations]

## Design Decisions

[Key architectural choices]

## Dependencies

- Internal: `@beep/package`
- External: `library`

## Related

- AGENTS.md (detailed guidance)
- Spec: `specs/related-spec/`
```

### Success Criteria

- [ ] 62+ ai-context.md files created
- [ ] All files pass frontmatter validation
- [ ] `/modules` command returns complete listing
- [ ] `/module-search` finds all packages

### Verification

```bash
# Count ai-context.md files
find packages apps tooling -name "ai-context.md" | wc -l
# Expected: 62+

# Test module discovery
bun run .claude/scripts/context-crawler.ts -- --mode=list
```

---

## Phase 2: Error Pattern Catalog (1-2 sessions)

### Objective

Create machine-readable error catalog with fix strategies.

### Agents

- **Primary**: `effect-expert`, `code-reviewer`
- **Support**: `mcp-researcher`

### Tasks

| # | Task | Tool Calls | Output |
|---|------|------------|--------|
| 2.1 | Extract errors from REFLECTION_LOG files | 15-20 | `outputs/extracted-errors.md` |
| 2.2 | Categorize errors by type and severity | 5-8 | `outputs/error-categories.md` |
| 2.3 | Create error catalog YAML | 10-15 | `.claude/errors/catalog.yaml` |
| 2.4 | Add troubleshooting table to CLAUDE.md | 3-5 | CLAUDE.md updated |
| 2.5 | Create error lookup skill | 5-8 | `.claude/skills/error-lookup/` |

### Error Catalog Schema

```yaml
# .claude/errors/catalog.yaml
version: "1.0"
categories:
  - id: typescript
    name: TypeScript Errors
    auto_fixable: partial
  - id: effect
    name: Effect-TS Errors
    auto_fixable: false
  - id: biome
    name: Biome Lint/Format
    auto_fixable: true
  - id: turborepo
    name: Build Pipeline
    auto_fixable: false

errors:
  # TypeScript Errors
  - id: TS_001
    pattern: "Property '(.+)' is missing in type"
    category: typescript
    severity: error
    fix_type: safe
    remediation: easy
    description: Missing required property in type definition
    diagnosis: Check schema definition for required fields
    fix_steps:
      - Identify the missing property from error message
      - Add property to the type/interface/schema
      - Ensure property type matches expected
    example:
      error: "Property 'id' is missing in type '{ name: string; }'"
      before: |
        S.Struct({ name: S.String })
      after: |
        S.Struct({ name: S.String, id: S.String })

  - id: TS_002
    pattern: "Type 'string' is not assignable to type '(.+)Id'"
    category: typescript
    severity: error
    fix_type: safe
    remediation: easy
    description: Plain string used where branded EntityId required
    diagnosis: Using plain string instead of branded EntityId type
    fix_steps:
      - Import EntityId from @beep/shared-domain
      - Use EntityId schema instead of S.String
      - For table columns, add .$type<EntityId.Type>()
    auto_fix: false
    example:
      error: "Type 'string' is not assignable to type 'UserId'"
      before: |
        userId: S.String
      after: |
        userId: SharedEntityIds.UserId

  # Effect Errors
  - id: EFF_001
    pattern: "Argument of type .* is not assignable to parameter of type 'Effect<"
    category: effect
    severity: error
    fix_type: unsafe
    remediation: major
    description: Effect type mismatch in pipeline
    diagnosis: Return type doesn't match expected Effect signature
    fix_steps:
      - Check the expected Effect<A, E, R> signature
      - Verify your return matches Success type A
      - Check Error channel E includes your errors
      - Verify Requirements R are satisfied
    manual_review: true

  - id: EFF_002
    pattern: "Cannot find name 'yield'"
    category: effect
    severity: error
    fix_type: safe
    remediation: trivial
    description: Using yield outside generator function
    diagnosis: Missing Effect.gen wrapper or function* syntax
    fix_steps:
      - Wrap code in Effect.gen(function* () { ... })
      - Or use pipe() with flatMap instead of yield*
    example:
      before: |
        const result = yield* someEffect;
      after: |
        Effect.gen(function* () {
          const result = yield* someEffect;
        })

  # Biome Errors
  - id: BIOME_001
    pattern: "Unexpected any"
    category: biome
    severity: warning
    fix_type: unsafe
    remediation: easy
    description: Explicit any type used
    diagnosis: Code uses 'any' type which bypasses type checking
    fix_steps:
      - Replace with specific type
      - Use unknown if type truly unknown
      - Use Schema.decode for runtime validation
    auto_fix: false

  - id: BIOME_002
    pattern: "missing semicolon|extra semicolon"
    category: biome
    severity: warning
    fix_type: safe
    remediation: trivial
    description: Semicolon formatting issue
    auto_fix_command: "bun run lint:fix"

  # Turborepo Errors
  - id: TURBO_001
    pattern: "error TS\\d+ in packages/(.+)/"
    category: turborepo
    severity: error
    fix_type: manual
    remediation: major
    description: Cascading type error from upstream package
    diagnosis: |
      Turborepo's --filter cascades through dependencies.
      Error may be in upstream package, not target.
    fix_steps:
      - Check error path to identify actual failing package
      - Fix upstream package errors first
      - Re-run check on target package
    example:
      error: "packages/iam-domain/src/Member.ts(42,5): error TS2322"
      diagnosis: "Error is in iam-domain, not your target package"

  - id: TURBO_002
    pattern: "Cannot find module '@beep/(.+)'"
    category: turborepo
    severity: error
    fix_type: safe
    remediation: easy
    description: Missing package reference
    auto_fix_command: "bun run repo-cli tsconfig-sync"
    fix_steps:
      - Run tsconfig-sync to update references
      - Verify package exists in packages/
      - Check tsconfig.json references
```

### Troubleshooting Table (for CLAUDE.md)

```markdown
## Troubleshooting

### Quick Reference

| Symptom | Diagnosis | Fix |
|---------|-----------|-----|
| `Cannot find module '@beep/*'` | Missing tsconfig reference | `bun run repo-cli tsconfig-sync` |
| `Type 'string' not assignable to '*Id'` | Missing branded EntityId | Use `SharedEntityIds.*` |
| Turborepo fails on unrelated package | Cascading dependency error | Fix upstream package first |
| `Unexpected any` lint error | Bypassing type system | Replace with Schema.decode |
| `yield` outside generator | Missing Effect.gen wrapper | Wrap in `Effect.gen(function* () { })` |
| `Property missing in type` | Incomplete schema | Add missing field to S.Struct |

### Auto-Recoverable Errors

Run these commands to auto-fix:

| Error Type | Command |
|------------|---------|
| Biome lint/format | `bun run lint:fix` |
| Import sorting | `bun run lint:fix` |
| tsconfig references | `bun run repo-cli tsconfig-sync` |
```

### Success Criteria

- [ ] 50+ error patterns documented
- [ ] All categories have at least 5 entries
- [ ] Troubleshooting table added to CLAUDE.md
- [ ] Error lookup skill functional

### Verification

```bash
# Validate YAML syntax
bun x yaml-lint .claude/errors/catalog.yaml

# Count error entries
grep -c "^  - id:" .claude/errors/catalog.yaml
```

---

## Phase 3: Onboarding System (1 session)

### Objective

Create interactive onboarding for new agent instances.

### Agents

- **Primary**: `skill-creator`, `doc-writer`

### Tasks

| # | Task | Tool Calls | Output |
|---|------|------------|--------|
| 3.1 | Create onboarding documentation | 5-8 | `.claude/onboarding/README.md` |
| 3.2 | Create Effect primer | 8-12 | `.claude/onboarding/effect-primer.md` |
| 3.3 | Create first-contribution checklist | 5-8 | `.claude/onboarding/first-contribution.md` |
| 3.4 | Create onboarding skill | 10-15 | `.claude/skills/onboarding/` |

### Onboarding Structure

```
.claude/onboarding/
├── README.md                 # Entry point
├── effect-primer.md          # Effect essentials (not tutorial)
├── first-contribution.md     # Step-by-step first task
├── common-tasks.md           # Task patterns with examples
└── verification-checklist.md # Quality gates
```

### Onboarding Skill

```markdown
---
name: onboarding
description: Interactive onboarding checklist for new agents
---

# Agent Onboarding

Welcome to beep-effect. This checklist ensures you're ready to contribute.

## Verification Steps

### 1. Environment Check
- [ ] Confirm `bun --version` returns 1.3.x+
- [ ] Confirm `bun run check` passes (or note pre-existing errors)

### 2. Architecture Understanding
- [ ] Review CLAUDE.md for project overview
- [ ] Run `/modules` to see available modules
- [ ] Understand slice structure: domain → tables → server → client → ui

### 3. Effect Proficiency Check
Can you explain:
- [ ] What `Effect<A, E, R>` type parameters mean?
- [ ] How to use `Effect.gen(function* () { })`?
- [ ] What `yield*` does in Effect generators?
- [ ] How Layers provide dependencies?

If uncertain on any, read `.claude/onboarding/effect-primer.md`

### 4. Pattern Awareness
- [ ] Review `.claude/rules/effect-patterns.md` for REQUIRED patterns
- [ ] Note NEVER/ALWAYS rules
- [ ] Understand EntityId requirement for all ID fields

### 5. Ready to Contribute
- [ ] Start with a simple task to verify understanding
- [ ] Run `bun run check` after any changes
- [ ] Request review before large modifications

## Quick Commands
| Action | Command |
|--------|---------|
| Type check | `bun run check` |
| Lint fix | `bun run lint:fix` |
| Run tests | `bun run test` |
| Sync tsconfig | `bun run repo-cli tsconfig-sync` |
```

### Success Criteria

- [ ] Onboarding documentation complete
- [ ] Effect primer covers essential patterns
- [ ] Onboarding skill validates agent readiness
- [ ] First-contribution guide is actionable

### Verification

```bash
# Verify files exist
ls .claude/onboarding/
# Expected: 5 markdown files

# Test skill
/onboarding
```

---

## Phase 4: Self-Healing Hooks (1 session)

### Objective

Implement hooks that auto-fix recoverable errors.

### Agents

- **Primary**: `effect-expert`, `test-writer`
- **Support**: `package-error-fixer`

### Tasks

| # | Task | Tool Calls | Output |
|---|------|------------|--------|
| 4.1 | Create lint-fix hook | 8-12 | `.claude/hooks/auto-lint-fix/` |
| 4.2 | Create tsconfig-sync hook | 8-12 | `.claude/hooks/auto-tsconfig-sync/` |
| 4.3 | Test hooks in isolation | 10-15 | Test results |
| 4.4 | Document hook behavior | 3-5 | `.claude/hooks/README.md` |

### Hook Implementation Pattern

```typescript
// .claude/hooks/auto-lint-fix/index.ts
import { Effect, Console } from "effect";

interface HookContext {
  tool: string;
  toolInput: Record<string, unknown>;
  result: string;
}

const isLintError = (result: string): boolean =>
  result.includes("Unexpected any") ||
  result.includes("missing semicolon") ||
  result.includes("biome");

const autoFix = Effect.gen(function* () {
  yield* Console.log("Auto-fixing lint errors...");
  // Run bun run lint:fix
  // Return fixed status
});

export const afterToolUse = (context: HookContext) =>
  Effect.gen(function* () {
    if (context.tool === "Bash" && isLintError(context.result)) {
      yield* autoFix;
      return { retry: true };
    }
    return { retry: false };
  });
```

### Safety Constraints

```yaml
# Only auto-fix these error categories
safe_auto_fix:
  - biome_format
  - biome_lint_safe
  - import_sorting
  - tsconfig_references

# Never auto-fix (require human review)
never_auto_fix:
  - type_errors
  - effect_errors
  - logic_errors
  - security_issues
```

### Success Criteria

- [ ] Lint-fix hook auto-corrects formatting errors
- [ ] tsconfig-sync hook fixes missing references
- [ ] Hooks only fix safe errors
- [ ] Hook behavior documented

### Verification

```bash
# Test lint-fix hook
echo "const x = 1" > /tmp/test.ts  # Missing semicolon
# Hook should auto-fix

# Verify hooks registered
cat .claude/settings.json | grep hooks
```

---

## Phase 5: Examples & Validation (1-2 sessions)

### Objective

Add worked examples to all abstract rules and validate zero ambiguity.

### Agents

- **Primary**: `code-reviewer`, `reflector`
- **Support**: `spec-reviewer`

### Tasks

| # | Task | Tool Calls | Output |
|---|------|------------|--------|
| 5.1 | Add examples to effect-patterns.md | 15-20 | Updated rules |
| 5.2 | Add examples to code-standards.md | 10-15 | Updated rules |
| 5.3 | Add examples to meta-thinking.md | 8-12 | Updated rules |
| 5.4 | Ambiguity audit | 10-15 | `outputs/ambiguity-audit.md` |
| 5.5 | Final validation | 5-8 | `outputs/final-score.md` |

### Example Enhancement Pattern

**Before (Abstract):**
```
handle(path) := ∀path ∈ {happy, edge, adversarial}
```

**After (With Example):**
```
handle(path) := ∀path ∈ {happy, edge, adversarial}

Example - User Input Validation:
```typescript
// Happy path: valid email
const validEmail = yield* validateEmail("user@example.com");
// Returns: Effect.succeed({ email: "user@example.com" })

// Edge case: empty string
const emptyEmail = yield* validateEmail("");
// Returns: Effect.fail(new ValidationError({ field: "email", reason: "empty" }))

// Adversarial: SQL injection attempt
const maliciousEmail = yield* validateEmail("'; DROP TABLE users;--");
// Returns: Effect.fail(new ValidationError({ field: "email", reason: "invalid_format" }))
```
```

### Ambiguity Audit Criteria

| Criterion | Pass Condition |
|-----------|----------------|
| Rule clarity | Agent can implement without asking |
| Example coverage | Every REQUIRED pattern has example |
| Terminology | No undefined jargon |
| Edge cases | All NEVER patterns have "why" |

### Success Criteria

- [ ] All abstract rules have worked examples
- [ ] Ambiguity audit passes 95%+
- [ ] Final score assessment completed
- [ ] 10/10 criteria met

### Verification

```bash
# Count examples in rules
grep -c "Example" .claude/rules/*.md
# Should be 50+

# Run final assessment
# Use code-reviewer agent to score
```

---

## Checkpoint Protocol

### Per-Task Checkpoints

After each task:
1. Verify output exists
2. Run relevant `bun run check` if code changed
3. Update REFLECTION_LOG.md with learnings

### Per-Session Checkpoints

After each session:
1. Create/update HANDOFF_P[N].md
2. Create/update P[N]_ORCHESTRATOR_PROMPT.md
3. Commit changes with descriptive message

### Token Budget

- Working context: ≤2,000 tokens per handoff
- Episodic context: ≤1,000 tokens per handoff
- Semantic context: ≤500 tokens per handoff
- Total: ≤4,000 tokens per handoff

---

## Exit Criteria

### Minimum Viable (Score: 9/10)

- [ ] 80%+ ai-context.md coverage
- [ ] 30+ error patterns documented
- [ ] Onboarding documentation complete
- [ ] Troubleshooting table in CLAUDE.md

### Target (Score: 9.5/10)

All minimum viable plus:
- [ ] 100% ai-context.md coverage
- [ ] 50+ error patterns documented
- [ ] Onboarding skill functional
- [ ] 80%+ worked examples coverage

### Stretch (Score: 10/10)

All target plus:
- [ ] Self-healing hooks operational
- [ ] Zero ambiguity audit passes
- [ ] All abstract rules have examples
- [ ] New agent success rate validated
