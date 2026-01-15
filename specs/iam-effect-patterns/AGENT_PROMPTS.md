# Agent Prompts

Ready-to-use prompts for each agent in the IAM Effect Patterns specification.

## Usage

Copy the relevant prompt and use it with the Task tool:

```typescript
Task({
  subagent_type: "agent-name",
  prompt: "...",
  description: "..."
});
```

---

## Section 1: Codebase Researcher (Phase 1)

**Agent Type**: `codebase-researcher` or `Explore`

**Description**: "Analyze IAM client patterns"

### Prompt

```
# IAM Effect Patterns - Phase 1 Analysis

## Context

You are performing Phase 1 of the IAM Effect Patterns specification. Your goal is deep analysis of current IAM client and UI patterns to identify inconsistencies and boilerplate opportunities.

## Pre-Requisites

Read these files first:
- specs/iam-effect-patterns/README.md
- specs/iam-effect-patterns/REFLECTION_LOG.md

## Analysis Tasks

### Task 1: Handler Analysis

Read each handler file and document:

Files:
- packages/iam/client/src/core/sign-out/sign-out.handler.ts
- packages/iam/client/src/core/get-session/get-session.handler.ts
- packages/iam/client/src/sign-in/email/sign-in-email.handler.ts
- packages/iam/client/src/sign-up/email/sign-up-email.handler.ts

For each handler, extract:
1. Effect.fn name string (e.g., "core/sign-out/handler")
2. Parameter signature (type, optionality)
3. Better Auth method called
4. Response handling (data extraction, error checking)
5. Session signal notification (present? conditional?)
6. Schema decode method (decode vs decodeUnknown)

### Task 2: Session Signal Audit

Run this search:
```
grep -rn "$sessionSignal" packages/iam/
```

Document every occurrence with:
- File path
- Line number
- Context (what triggers it)

### Task 3: Contract Analysis

Read each contract file:
- packages/iam/client/src/core/sign-out/sign-out.contract.ts
- packages/iam/client/src/core/get-session/get-session.contract.ts
- packages/iam/client/src/sign-in/email/sign-in-email.contract.ts
- packages/iam/client/src/sign-up/email/sign-up-email.contract.ts

For each, document:
1. Schema class definitions (Payload, Success, Response)
2. Annotation method (withFormAnnotations vs direct)
3. Form default values
4. Transformation logic (transformOrFail?)

### Task 4: Service Analysis

Read service files:
- packages/iam/client/src/core/service.ts
- packages/iam/client/src/sign-in/service.ts
- packages/iam/client/src/sign-up/service.ts

Document:
1. Service class definition pattern
2. Handler aggregation approach
3. Runtime creation pattern

### Task 5: UI Atom Analysis

Read atom files:
- packages/iam/ui/src/sign-in/email/sign-in-email.atom.ts
- packages/iam/ui/src/sign-up/email/sign-up-email.atoms.ts
- packages/iam/client/src/core/atoms.ts

Document:
1. Runtime.fn usage
2. Toast integration (withToast options)
3. Hook exposure (useAtomSet mode)
4. State management patterns

### Task 6: Reference Patterns

Read reference implementations:
- packages/shared/client/src/atom/files/atoms/files.atom.ts
- packages/runtime/client/src/runtime.ts

Extract patterns applicable to IAM.

## Output

Generate comprehensive report at: specs/iam-effect-patterns/outputs/current-patterns.md

Use this structure:

# Current IAM Effect Patterns Analysis

## Executive Summary
[2-3 paragraphs]

## Handler Analysis
### Matrix
| Handler | Name String | Signature | Mutates Session | Notifies Signal | Error Check |
|---------|-------------|-----------|-----------------|-----------------|-------------|

### Detailed Findings
[Per-handler analysis with code snippets]

## Contract Analysis
### Matrix
| Contract | Classes | Annotation Method | Has Transform | Defaults |
|----------|---------|-------------------|---------------|----------|

### Detailed Findings
[Per-contract analysis]

## Service Pattern Summary

## UI Atom Pattern Summary

## Inconsistency Catalog
| ID | Description | Files | Severity | Standardization |
|----|-------------|-------|----------|-----------------|

## Boilerplate Inventory
| Pattern | Occurrences | Lines/Instance | Total Lines | Factor? |
|---------|-------------|----------------|-------------|---------|

## Recommendations
### Priority 1: Critical Fixes
### Priority 2: Pattern Standardization
### Priority 3: Boilerplate Reduction

## Questions Answered

1. Are there handlers that properly check response.error? [Yes/No + details]
2. Is session signal inconsistency intentional? [Assessment]
3. What % of handler code is boilerplate? [Calculation]
4. Are there existing factory patterns? [Yes/No + location]
5. What is the canonical annotation approach? [Assessment]
```

---

## Section 2: MCP Researcher (Phase 2)

**Agent Type**: `mcp-researcher` or `effect-researcher`

**Description**: "Research Effect patterns"

### Prompt

```
# IAM Effect Patterns - Phase 2 Research

## Context

You are performing Phase 2 of the IAM Effect Patterns specification. Your goal is to research Effect best practices relevant to the issues identified in Phase 1.

## Pre-Requisites

Read:
- specs/iam-effect-patterns/outputs/current-patterns.md (Phase 1 output)
- specs/iam-effect-patterns/README.md

## Research Targets

### 1. Effect.fn Best Practices

Research via Effect documentation:
- When to use Effect.fn vs Effect.fnUntraced
- Naming conventions for trace name strings
- Error handling patterns in Effect generators
- Best practices for parameter signatures

Questions to answer:
- Should handler names follow "domain/method/handler" pattern?
- Is Effect.fn appropriate for all handlers or only traced ones?
- How should optional parameters be handled?

### 2. Schema Transformation Patterns

Research:
- S.Class vs S.Struct for contracts
- transformOrFail vs simple transform
- Annotation best practices
- Encoded vs Type for default values

Questions to answer:
- Should Payload schemas always use S.Class?
- When is transformOrFail preferred over filter?
- How to annotate for form defaults correctly?

### 3. Service Composition Patterns

Research:
- How to define service classes in Effect style
- Handler aggregation approaches
- Layer-based service provision

Questions to answer:
- Should services be classes or namespaces?
- How to compose multiple handlers into a service?

### 4. Error Channel Design

Research:
- TaggedError patterns
- Error transformation (fromUnknown)
- Cause preservation
- Error channel typing

Questions to answer:
- How to design IAM-specific error types?
- When to use TaggedError vs plain Error?
- How to preserve Better Auth error details?

### 5. State Machine Patterns

Research Effect-atom documentation:
- Atom state machines
- Registry integration
- Transition effects
- Multi-step flow patterns

Questions to answer:
- How to coordinate state across atoms?
- When to use state machines vs simple atoms?
- How to type state transitions?

## Output

Generate research report at: specs/iam-effect-patterns/outputs/effect-research.md

Structure:

# Effect Patterns Research

## Research Summary
[Overview of findings]

## 1. Effect.fn Patterns
### Official Documentation
[Quotes/references]

### Best Practices
[Synthesized guidance]

### Applicable to IAM
[How to apply]

## 2. Schema Patterns
### Transformation Patterns
### Annotation Patterns
### Applicable to IAM

## 3. Service Composition
### Service Class Patterns
### Handler Aggregation
### Applicable to IAM

## 4. Error Handling
### Tagged Error Patterns
### Error Transformation
### Applicable to IAM

## 5. State Machines
### Effect-Atom Patterns
### Registry Integration
### Applicable to IAM

## References
[Links to Effect docs, examples]

## Recommendations
[How Phase 3 should use this research]
```

---

## Section 3: Effect Code Writer (Phase 3)

**Agent Type**: `effect-code-writer`

**Description**: "Design IAM patterns"

### Prompt

```
# IAM Effect Patterns - Phase 3 Design

## Context

You are performing Phase 3 of the IAM Effect Patterns specification. Your goal is to design canonical patterns based on Phase 1 analysis and Phase 2 research.

## Pre-Requisites

Read in order:
1. specs/iam-effect-patterns/README.md
2. specs/iam-effect-patterns/outputs/current-patterns.md (Phase 1)
3. specs/iam-effect-patterns/outputs/effect-research.md (Phase 2)
4. specs/iam-effect-patterns/templates/*.template.ts

## Design Targets

### 1. Handler Factory

Design a generic handler factory that:
- Reduces boilerplate by 50%+
- Supports payload and no-payload variants
- Handles session signal notification
- Transforms errors consistently
- Follows Effect import rules

Requirements:
- Use namespace imports (import * as Effect from "effect/Effect")
- No native array/string methods
- Type-safe with proper inference
- Support Better Auth { data, error } response shape

Template location: specs/iam-effect-patterns/templates/handler.template.ts

### 2. Schema Helpers

Design helpers for:
- Form annotation with correct encoded types
- Response transformation from Better Auth
- Default value generation

Requirements:
- Preserve withFormAnnotations pattern
- Handle Redacted<string> → string encoding
- Support BS.DefaultFormValuesAnnotationId

### 3. Atom Factory

Design atom factory that:
- Integrates toast automatically
- Configures promise mode
- Generates typed hooks

Requirements:
- Use runtime.fn pattern
- Support F.flow composition
- Match existing withToast signature

Template location: specs/iam-effect-patterns/templates/atom.template.ts

### 4. State Machine Utilities

Design utilities for:
- State type definitions
- Transition effects
- Registry integration
- Multi-step flow coordination

Requirements:
- Type-safe state transitions
- Atom.make for state storage
- Registry.AtomRegistry for updates

## Implementation Rules

Follow these STRICTLY:
1. All imports must be namespace style
2. Use S, A, O, P, F, R aliases
3. Use PascalCase Schema constructors (S.String not S.string)
4. No native methods (no array.map, string.split)
5. All async in Effect.tryPromise
6. Proper error typing

## Output

Generate design document at: specs/iam-effect-patterns/outputs/pattern-proposals.md

Structure:

# Pattern Proposals

## Summary
[Overview of designed patterns]

## 1. Handler Factory

### API Design
```typescript
// Show the type signatures
```

### Implementation
```typescript
// Full implementation
```

### Usage Examples
```typescript
// Before/after comparison
```

### Migration Guide
- Step 1: ...
- Step 2: ...

## 2. Schema Helpers

### API Design
### Implementation
### Usage Examples

## 3. Atom Factory

### API Design
### Implementation
### Usage Examples

## 4. State Machine Utilities

### API Design
### Implementation
### Usage Examples

## Breaking Changes
[List any breaking changes]

## Migration Plan
[How to migrate existing code]

## Boilerplate Reduction Calculation
| Pattern | Before | After | Savings |
|---------|--------|-------|---------|
```

---

## Section 4: Code Reviewer (Phase 4)

**Agent Type**: `code-reviewer`

**Description**: "Review IAM patterns"

### Prompt

```
# IAM Effect Patterns - Phase 4 Code Review

## Context

You are performing code review for Phase 4 of the IAM Effect Patterns specification. Your goal is to validate proposed patterns against codebase rules.

## Pre-Requisites

Read:
- specs/iam-effect-patterns/outputs/pattern-proposals.md (Phase 3)
- .claude/rules/effect-patterns.md
- .claude/rules/general.md

## Review Checklist

### 1. Effect Import Rules

Verify ALL code follows:
- [ ] Namespace imports: `import * as Effect from "effect/Effect"`
- [ ] Correct aliases: S, A, O, P, F, R, etc.
- [ ] PascalCase constructors: `S.String` not `S.string`

Flag violations with file/line.

### 2. Native Method Ban

Search for violations:
- [ ] No `array.map()`, `array.filter()`, `array.reduce()`
- [ ] No `string.split()`, `string.trim()`
- [ ] All operations through Effect utilities

Flag any usage.

### 3. Type Safety

Check for:
- [ ] No `any` type usage
- [ ] No `@ts-ignore` comments
- [ ] No unsafe casts (`as unknown as`)
- [ ] Proper type inference

### 4. Security Review

Check for:
- [ ] No credential exposure in examples
- [ ] Error messages don't leak sensitive data
- [ ] Default values are safe

### 5. Pattern Consistency

Verify patterns match:
- [ ] Templates in specs/iam-effect-patterns/templates/
- [ ] Existing working code in packages/iam/
- [ ] Effect documentation patterns

## Output

Generate review report at: specs/iam-effect-patterns/outputs/pattern-review.md

Structure:

# Pattern Review

## Review Summary
### Overall Assessment
[PASS/FAIL/CONDITIONAL]

### Ready for Implementation
[Yes/No/After fixes]

## Import Compliance
### Findings
[List of checks performed]

### Issues
[Any violations found]

## Native Method Check
### Findings
### Issues

## Type Safety Review
### Findings
### Issues

## Security Review
### Findings
### Issues

## Pattern Consistency
### Findings
### Issues

## Required Changes Before Implementation
1. [Change 1]
2. [Change 2]

## Approved Patterns
- [x] Handler Factory (approved / needs changes)
- [x] Schema Helpers (approved / needs changes)
- [x] Atom Factory (approved / needs changes)
- [x] State Machine Utilities (approved / needs changes)
```

---

## Section 5: Architecture Pattern Enforcer (Phase 4)

**Agent Type**: `architecture-pattern-enforcer`

**Description**: "Enforce IAM architecture"

### Prompt

```
# IAM Effect Patterns - Architecture Review

## Context

You are performing architecture review for Phase 4 of the IAM Effect Patterns specification.

## Pre-Requisites

Read:
- specs/iam-effect-patterns/outputs/pattern-proposals.md
- CLAUDE.md (architecture boundaries section)

## Architecture Checks

### 1. Package Boundaries

Verify proposed patterns respect:
- [ ] Slice structure: domain → tables → infra → client → ui
- [ ] Cross-slice imports only through packages/shared/* or packages/common/*
- [ ] @beep/* path aliases used (no relative ../../../)

### 2. Dependency Direction

Check that:
- [ ] _common/ doesn't import from handlers
- [ ] handlers don't import from UI
- [ ] factories don't create circular dependencies

### 3. Export Structure

Verify:
- [ ] Public API through index.ts files
- [ ] Internal utilities properly scoped
- [ ] No leaking implementation details

### 4. Layer Composition

Check:
- [ ] Services don't depend on concrete implementations
- [ ] Proper dependency injection patterns
- [ ] Runtime creation follows established patterns

## Output

Add architecture section to: specs/iam-effect-patterns/outputs/pattern-review.md

## Architecture Review

### Package Boundary Compliance
[Findings]

### Dependency Direction
[Findings]

### Export Structure
[Findings]

### Layer Composition
[Findings]

### Architecture Violations
| ID | Description | Location | Fix |
|----|-------------|----------|-----|

### Architecture Approval
[APPROVED / NEEDS CHANGES]
```

---

## Section 6: Effect Code Writer + Package Error Fixer (Phase 6)

**Agent Type**: `effect-code-writer`

**Description**: "Implement IAM patterns"

### Prompt (Part 1: Implementation)

```
# IAM Effect Patterns - Phase 6 Implementation

## Context

You are implementing canonical patterns for Phase 6 of the IAM Effect Patterns specification.

## Pre-Requisites

Read in order:
1. specs/iam-effect-patterns/PLAN.md
2. specs/iam-effect-patterns/outputs/pattern-proposals.md
3. specs/iam-effect-patterns/outputs/pattern-review.md
4. specs/iam-effect-patterns/templates/*.template.ts

## Implementation Order

### Step 1: Create Foundation Files

Create these files in order:

1. `packages/iam/client/src/_common/handler.factory.ts`
   - Implement createHandler from pattern proposals
   - Support payload and no-payload variants
   - Include session signal notification

2. `packages/iam/client/src/_common/schema.helpers.ts`
   - Enhanced withFormAnnotations if needed
   - Response transformation utilities

3. `packages/iam/client/src/_common/atom.factory.ts`
   - createToastAtom implementation
   - Hook generation utilities

4. `packages/iam/client/src/_common/state-machine.ts`
   - State transition helpers
   - Registry integration utilities

### Step 2: Reference Implementation

Refactor sign-in/email handler to use new patterns:
- packages/iam/client/src/sign-in/email/sign-in-email.handler.ts

Before:
```typescript
// Current implementation
```

After:
```typescript
// Using new patterns
```

### Step 3: Second Reference

Refactor sign-out handler:
- packages/iam/client/src/core/sign-out/sign-out.handler.ts

## Critical Rules

1. All imports MUST be namespace style
2. Use correct aliases (S, A, O, P, F)
3. PascalCase Schema constructors
4. NO native array/string methods
5. All async wrapped in Effect.tryPromise
6. Check Better Auth response.error

## After Implementation

Run these commands:
```bash
bun run check
bun run lint:fix
bun run test --filter=@beep/iam-client
```

Document any errors for package-error-fixer.
```

### Prompt (Part 2: Error Fixing)

**Agent Type**: `package-error-fixer`

**Description**: "Fix IAM package errors"

```
# IAM Effect Patterns - Error Fixing

## Context

Fix all errors in @beep/iam-client after Phase 6 implementation.

## Package

@beep/iam-client

## Commands to Run

1. Type check:
```bash
bun run check --filter=@beep/iam-client
```

2. Build:
```bash
bun run build --filter=@beep/iam-client
```

3. Lint fix:
```bash
bun run lint:fix --filter=@beep/iam-client
```

4. Test:
```bash
bun run test --filter=@beep/iam-client
```

## Error Categories

### Type Errors
- Fix inference issues
- Add missing type annotations
- Correct generic parameters

### Import Errors
- Fix path aliases
- Correct namespace imports
- Remove unused imports

### Lint Errors
- Run biome fix
- Address remaining issues manually

## Process

1. Run each command
2. Document errors found
3. Fix one category at a time
4. Re-run to verify
5. Repeat until all pass
```

---

## Section 7: Doc Writer (Phase 7)

**Agent Type**: `doc-writer`

**Description**: "Update IAM documentation"

### Prompt

```
# IAM Effect Patterns - Phase 7 Documentation

## Context

You are updating documentation for Phase 7 of the IAM Effect Patterns specification.

## Pre-Requisites

Read:
- Implementation code in packages/iam/client/src/_common/
- specs/iam-effect-patterns/outputs/pattern-proposals.md
- specs/iam-effect-patterns/templates/*.template.ts

## Documentation Targets

### 1. packages/iam/client/AGENTS.md

Update with:

#### Handler Factory Section
- Purpose and usage
- API signature
- Example usage
- When to use vs not use

#### Schema Helpers Section
- withFormAnnotations usage
- Default value patterns
- Transformation patterns

#### Anti-Patterns Section
- Common mistakes to avoid
- Wrong vs right examples

### 2. packages/iam/ui/AGENTS.md

Update with:

#### Atom Factory Section
- createToastAtom usage
- Hook generation
- Promise mode configuration

#### State Machine Section
- When to use state machines
- State type definitions
- Transition patterns

### 3. Template Validation

Verify these templates match implementation:
- specs/iam-effect-patterns/templates/handler.template.ts
- specs/iam-effect-patterns/templates/contract.template.ts
- specs/iam-effect-patterns/templates/atom.template.ts

Update if implementation differs.

## Output

Update files:
- packages/iam/client/AGENTS.md
- packages/iam/ui/AGENTS.md

Update spec status:
- specs/iam-effect-patterns/README.md - Mark Phase 7 Complete

Add final entry:
- specs/iam-effect-patterns/REFLECTION_LOG.md
```

---

## Template Variables Reference

When using templates from `specs/iam-effect-patterns/templates/`, use these variable substitutions:

| Variable | Case | Example | Usage |
|----------|------|---------|-------|
| `{{domain}}` | lowercase | `sign-in` | Effect.fn name, file paths |
| `{{Domain}}` | PascalCase | `SignIn` | Class names, type names |
| `{{method}}` | camelCase | `email` | Function names, properties |
| `{{Method}}` | PascalCase | `Email` | Class names, type names |
| `{{betterAuthMethod}}` | varies | `signIn.email` | Better Auth client path |
| `{{waitingMessage}}` | string | `"Signing in..."` | Toast message |
| `{{successMessage}}` | string | `"Signed in"` | Toast message |
| `{{description}}` | string | `"email sign-in"` | Schema description |

### Case Transformation Rules

```
Input: "sign-in-email"

domain:   "sign-in"      (lowercase, kebab-case preserved)
Domain:   "SignIn"       (PascalCase, hyphens removed)
method:   "email"        (camelCase)
Method:   "Email"        (PascalCase)
```

### Full Example

For `sign-in/email`:

```typescript
// {{domain}}/{{method}} → "sign-in/email"
// {{Domain}}Service → "SignInService"
// {{method}}Atom → "emailAtom"
// use{{Domain}} → "useSignIn"
```
