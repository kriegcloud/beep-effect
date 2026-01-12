# Spec Bootstrapper: Master Orchestration

> Complete workflow for implementing the spec bootstrapper CLI command and Claude skill.

---

## Overview

This orchestration guide covers the full implementation of:
1. **CLI Command**: `bun run beep bootstrap-spec` - Core file generation engine
2. **Claude Skill**: `/new-spec` - Interactive guidance layer that invokes the CLI command

---

## Phase 0: Scaffolding (COMPLETED)

### Completed Items
- [x] Created spec folder structure
- [x] README.md with purpose and scope
- [x] REFLECTION_LOG.md template
- [x] QUICK_START.md guide
- [x] RUBRICS.md evaluation criteria
- [x] templates/ with file templates

### Outputs
- `specs/spec-bootstrapper/README.md`
- `specs/spec-bootstrapper/REFLECTION_LOG.md`
- `specs/spec-bootstrapper/QUICK_START.md`
- `specs/spec-bootstrapper/RUBRICS.md`
- `specs/spec-bootstrapper/templates/`

---

## Phase 1: Research (COMPLETED)

### Completed Items
- [x] CLI implementation patterns research
- [x] Skill/agent creation patterns research
- [x] Synthesis of findings

### Outputs
- `outputs/cli-research.md` - CLI command patterns
- `outputs/skill-research.md` - Skill creation patterns
- `outputs/synthesis-report.md` - Integrated findings

---

## Phase 2: CLI Implementation

### Task 2.1: Create Schema Definitions

**File**: `tooling/cli/src/commands/bootstrap-spec/schemas.ts`

```typescript
import * as S from "effect/Schema";

export const SpecName = S.String.pipe(
  S.minLength(3, { message: () => "Must be at least 3 characters" }),
  S.maxLength(50, { message: () => "Must be at most 50 characters" }),
  S.pattern(/^[a-z][a-z0-9-]*$/, {
    message: () => "Must be lowercase kebab-case starting with letter"
  }),
  S.brand("SpecName")
);

export const SpecDescription = S.String.pipe(
  S.minLength(1, { message: () => "Description is required" }),
  S.maxLength(200, { message: () => "Must be 200 characters or less" }),
  S.brand("SpecDescription")
);

export const SpecComplexity = S.Literal("simple", "medium", "complex");

export class BootstrapSpecInput extends S.Class<BootstrapSpecInput>("BootstrapSpecInput")({
  specName: SpecName,
  specDescription: SpecDescription,
  purpose: S.optionalWith(S.String, { default: () => "" }),
  problemStatement: S.optionalWith(S.String, { default: () => "" }),
  scope: S.optionalWith(S.String, { default: () => "" }),
  complexity: S.optionalWith(SpecComplexity, { default: () => "medium" as const }),
  dryRun: S.optionalWith(S.Boolean, { default: () => false }),
}) {}

// Note: purpose, problemStatement, and scope are optional at CLI input level.
// If not provided, createSpecContext() will derive sensible defaults from specDescription.
```

### Task 2.2: Create Error Definitions

**File**: `tooling/cli/src/commands/bootstrap-spec/errors.ts`

```typescript
import * as S from "effect/Schema";

export class InvalidSpecNameError extends S.TaggedError<InvalidSpecNameError>()(
  "InvalidSpecNameError",
  {
    specName: S.String,
    reason: S.String,
  }
) {
  get displayMessage(): string {
    return `Invalid spec name "${this.specName}": ${this.reason}`;
  }
}

export class SpecExistsError extends S.TaggedError<SpecExistsError>()(
  "SpecExistsError",
  {
    specName: S.String,
    path: S.String,
  }
) {
  get displayMessage(): string {
    return `Spec "${this.specName}" already exists at ${this.path}`;
  }
}
```

### Task 2.3: Create Template Service

**File**: `tooling/cli/src/commands/bootstrap-spec/utils/template.ts`

Define:
- **SpecContext interface** with required variables:
  - `specName`: string (kebab-case)
  - `specDescription`: string
  - `purpose`: string (derived from description)
  - `problemStatement`: string (derived from description)
  - `scope`: string (derived from description)
  - `complexity`: "simple" | "medium" | "complex"
  - `createdAt`: string (ISO 8601 timestamp)
- `createSpecContext()` function to build context from BootstrapSpecInput
- Template strings for all file types
- Handlebars compilation

### Task 2.4: Create File Generator Service

**File**: `tooling/cli/src/commands/bootstrap-spec/utils/file-generator.ts`

Define:
- GenerationPlan interface
- getFilesForComplexity() function
- createPlan() function
- previewPlan() function
- executePlan() function

### Task 2.5: Create Command Handler

**File**: `tooling/cli/src/commands/bootstrap-spec/handler.ts`

```typescript
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import { FileSystem } from "@effect/platform";
import { RepoUtils } from "./services";
import { SpecExistsError } from "./errors";
import { createSpecContext, createPlan, previewPlan, executePlan } from "./utils/file-generator";
import type { BootstrapSpecInput } from "./schemas";

export const bootstrapSpecHandler = (input: BootstrapSpecInput) =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const fs = yield* FileSystem.FileSystem;
    const specPath = `${repo.REPOSITORY_ROOT}/specs/${input.specName}`;

    // Check if exists using Effect FileSystem
    const exists = yield* fs.exists(specPath);
    if (exists) {
      return yield* Effect.fail(new SpecExistsError({
        specName: input.specName,
        path: specPath,
      }));
    }

    // Create plan
    const context = createSpecContext(input);
    const plan = createPlan(context);

    // Handle dry-run
    if (input.dryRun) {
      yield* Console.log(previewPlan(plan));
      return;
    }

    // Execute
    yield* executePlan(plan);
    yield* Console.log(`Created spec: ${input.specName}`);
  });
```

### Task 2.6: Create Command Definition

**File**: `tooling/cli/src/commands/bootstrap-spec/index.ts`

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Command } from "@effect/cli";
import { BunContext, BunFileSystem } from "@effect/platform-bun";
import { BootstrapSpecInput } from "./schemas";
import { bootstrapSpecHandler } from "./handler";
import { RepoUtilsLive, FsUtilsLive } from "./services";
import {
  nameOption,
  descriptionOption,
  purposeOption,
  problemOption,
  scopeOption,
  complexityOption,
  dryRunOption
} from "./options";

// Layer composition: BunFileSystem.layer provides FileSystem.FileSystem service
// BunContext.layer provides platform context (Terminal, etc.)
const BootstrapSpecLayer = Layer.mergeAll(
  FsUtilsLive,
  RepoUtilsLive,
  BunFileSystem.layer,
  BunContext.layer
);

export const bootstrapSpecCommand = Command.make(
  "bootstrap-spec",
  {
    name: nameOption,
    description: descriptionOption,
    purpose: purposeOption,
    problem: problemOption,
    scope: scopeOption,
    complexity: complexityOption,
    dryRun: dryRunOption,
  },
  ({ name, description, purpose, problem, scope, complexity, dryRun }) =>
    Effect.gen(function* () {
      // Validate and execute
      const input = new BootstrapSpecInput({
        specName: name,
        specDescription: description,
        purpose,
        problemStatement: problem,
        scope,
        complexity,
        dryRun,
      });
      yield* bootstrapSpecHandler(input);
    })
).pipe(
  Command.withDescription("Create a new spec with standardized structure"),
  Command.provide(BootstrapSpecLayer)
);
```

### Task 2.7: Register Command

**File**: `tooling/cli/src/index.ts`

Add `bootstrapSpecCommand` to the subcommands array.

---

## Phase 3: Skill Implementation

The skill provides an interactive wrapper that:
1. Guides users through context gathering
2. Helps select appropriate complexity level
3. Validates inputs interactively
4. Invokes `bun run beep bootstrap-spec` with collected parameters

### Task 3.1: Create Skill Directory

```bash
mkdir -p .claude/skills/spec-bootstrapper
```

### Task 3.2: Create SKILL.md

**File**: `.claude/skills/spec-bootstrapper/SKILL.md`

Content:
- When to use guidance
- Input format
- 5-phase workflow that culminates in CLI invocation
- Authorization gates
- Error handling
- Examples showing CLI command execution

### Task 3.3: Create Supporting Templates

**Files**:
- `templates/README.template.md`
- `templates/REFLECTION_LOG.template.md`
- `PHASE_GUIDE.md`
- `AGENT_RECOMMENDATIONS.md`

---

## Phase 4: Integration

### Task 4.1: Update CLI Documentation

**File**: `tooling/cli/CLAUDE.md`

Add new command to:
- Usage Snapshots section
- Quick Recipes section

### Task 4.2: Update Spec Creation Guide

**File**: `specs/SPEC_CREATION_GUIDE.md`

Add reference to new automation tool.

### Task 4.3: Update Specs README

**File**: `specs/README.md`

Add spec-bootstrapper to the spec listing.

---

## Phase 5: Testing & Validation

### Task 5.1: Test CLI Command

```bash
# Test dry-run
bun run beep bootstrap-spec -n test-spec -d "Test description" --dry-run

# Test simple complexity
bun run beep bootstrap-spec -n simple-test -d "Simple test" -c simple

# Test medium complexity
bun run beep bootstrap-spec -n medium-test -d "Medium test"

# Test complex
bun run beep bootstrap-spec -n complex-test -d "Complex test" -c complex
```

### Task 5.2: Validate Generated Structure

Check that generated specs:
- Have correct file structure
- README.md follows template
- REFLECTION_LOG.md has proper format
- Directories match complexity level

### Task 5.3: Test Skill Workflow

Run `/new-spec` and verify:
- 5-phase workflow executes
- Authorization gates work
- Agent recommendations are accurate

---

## Verification Commands

```bash
# Check command is registered
bun run beep --help

# Check command help
bun run beep bootstrap-spec --help

# Run type check
bun run check --filter @beep/repo-cli

# Run lint
bun run lint --filter @beep/repo-cli
```

---

## Success Criteria

- [ ] CLI command creates valid spec structure
- [ ] All three complexity levels work
- [ ] Dry-run mode shows preview
- [ ] Error messages are helpful
- [ ] Skill provides guided workflow
- [ ] Documentation is updated
- [ ] Type check passes
- [ ] Lint passes

---

## Agent Assignment

| Phase | Task | Agent |
|-------|------|-------|
| 2.1-2.6 | CLI Implementation | effect-code-writer |
| 2.7 | Command Registration | Manual |
| 3.1-3.3 | Skill Creation | doc-writer |
| 4.1-4.3 | Integration | doc-writer |
| 5.1-5.3 | Testing | package-error-fixer |
