# CLI Command Implementation Research Report

## Executive Summary

Analysis of the beep-effect CLI reveals a well-structured, Effect-based command pattern that prioritizes type safety, error handling, and testability. Key findings:

1. **Command Structure**: Commands use `@effect/cli/Command` with schema-validated inputs and layered service dependencies
2. **Validation Pattern**: Input validation occurs in the command handler using Effect Schema, with detailed error messages
3. **Service Composition**: Commands declare dependencies as layers (e.g., `FsUtilsLive`, `TsMorphServiceLive`) that are merged and provided via `Command.provide()`
4. **Error Handling**: Tagged errors using `S.TaggedError` with identity composer support for traceable, structured error reporting
5. **Template Engine**: Handlebars with custom helpers for case transformations (kebab-case, PascalCase, snake_case)
6. **File Generation**: Two-phase approach: plan generation + execution, enabling dry-run and preview capabilities

---

## Command Structure

### 1. Basic Command Definition Pattern

Every command follows this structure:

```typescript
// 1. Define Options
const nameOption = Options.text("name").pipe(
  Options.withAlias("n"),
  Options.withDescription("Option description")
);

const dryRunOption = Options.boolean("dry-run").pipe(
  Options.withDefault(false),
  Options.withDescription("Preview changes without modifying files")
);

// 2. Define Service Layer
const MyServiceLayer = Layer.mergeAll(
  ServiceA.Live,
  ServiceB.Live,
  DependencyC.Live
);

// 3. Create Command
export const myCommand = Command.make(
  "my-command",
  { name: nameOption, dryRun: dryRunOption },
  ({ name, dryRun }) =>
    Effect.gen(function* () {
      // Handler logic
    })
).pipe(
  Command.withDescription("Brief command description"),
  Command.provide(MyServiceLayer)
);
```

### 2. Options API Patterns

**Text Options**:
```typescript
Options.text("name").pipe(
  Options.withAlias("n"),
  Options.withDescription("The name parameter")
)
```

**Boolean Options with Default**:
```typescript
Options.boolean("dry-run").pipe(
  Options.withDefault(false),
  Options.withDescription("Safe default prevents accidental changes")
)
```

**Optional Text Options**:
```typescript
Options.optional(Options.text("filter")).pipe(
  Options.withAlias("f"),
  Options.withDescription("Optional parameter")
)
```

### 3. Command Registration

Commands are registered in the parent CLI via `Command.withSubcommands()`:

```typescript
const repoCommand = CliCommand.make("beep").pipe(
  CliCommand.withDescription("Beep repository maintenance CLI."),
  CliCommand.withSubcommands([
    agentsValidateCommand,
    createSliceCommand,
    // ... other commands
    bootstrapSpecCommand,  // NEW
  ])
);
```

---

## Options Specification

### Required Options

**Name** (kebab-case identifier):
```typescript
const nameOption = Options.text("name").pipe(
  Options.withAlias("n"),
  Options.withDescription("The spec name in kebab-case (e.g., 'feature-name')")
);
```

**Description** (brief text):
```typescript
const descriptionOption = Options.text("description").pipe(
  Options.withAlias("d"),
  Options.withDescription("Brief description of the spec's purpose")
);
```

### Optional Options

**Dry-run** (preview mode):
```typescript
const dryRunOption = Options.boolean("dry-run").pipe(
  Options.withDefault(false),
  Options.withDescription("Preview changes without creating files")
);
```

**Complexity** (spec complexity level):
```typescript
const complexityOption = Options.optional(
  Options.choice("complexity", [
    ["simple", "Simple spec (README + REFLECTION_LOG only)"],
    ["medium", "Medium spec (adds QUICK_START, outputs/)"],
    ["complex", "Complex spec (full structure with handoffs)"],
  ] as const)
).pipe(
  Options.withAlias("c"),
  Options.withDescription("Spec complexity level (defaults to 'medium')")
);
```

---

## Service Requirements

### FsUtils Service

Provided by `@beep/tooling-utils`, handles filesystem operations:

```typescript
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils";

const example = Effect.gen(function* () {
  const fsUtils = yield* FsUtils;

  // Create directories
  yield* fsUtils.mkdirCached("/path/to/dir");

  // Check existence
  const exists = yield* fs.exists("/path");

  // Read/write JSON
  const json = yield* fsUtils.readJson("/path/file.json");
  yield* fsUtils.writeJson("/path/file.json", data);
}).pipe(Effect.provide(FsUtilsLive));
```

### RepoUtils Service

Provides repository root and workspace utilities:

```typescript
import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";

const example = Effect.gen(function* () {
  const repo = yield* RepoUtils;
  const root = repo.REPOSITORY_ROOT; // Absolute path to repo root
}).pipe(Effect.provide(RepoUtilsLive));
```

### Layer Composition

```typescript
const BootstrapSpecLayer = Layer.mergeAll(
  FsUtilsLive,
  RepoUtilsLive,
  BunFileSystem.layer,
  BunContext.layer
);
```

---

## File Generation Strategy

### 1. Template-Based Generation (Handlebars)

```typescript
const TEMPLATE = `# {{specName}}

> {{specDescription}}

## Purpose
...
`;

const compiled = Handlebars.compile(template, { noEscape: true });
const result = compiled({ specName: "my-feature", specDescription: "Feature description" });
```

### 2. Spec Context Interface

```typescript
interface SpecContext {
  specName: string;              // "my-feature"
  SpecName: string;              // "MyFeature"
  SPEC_NAME: string;             // "MY_FEATURE"
  spec_name: string;             // "my_feature"
  specDescription: string;
  complexity: "simple" | "medium" | "complex";
  createdAt: string;             // ISO date
}
```

### 3. Two-Phase Generation Pattern

**Phase 1: Plan Creation**
```typescript
interface GeneratedFile {
  readonly path: string;
  readonly content: string;
  readonly isNew: boolean;
}

interface GenerationPlan {
  readonly directories: readonly string[];
  readonly files: readonly GeneratedFile[];
}
```

**Phase 2: Execution**
```typescript
const executePlan = (plan: GenerationPlan) =>
  Effect.gen(function* () {
    const fsUtils = yield* FsUtils;

    for (const dir of plan.directories) {
      yield* fsUtils.mkdirCached(dir);
    }

    for (const file of plan.files) {
      yield* fs.writeFileString(file.path, file.content);
    }
  });
```

---

## Error Handling

### Tagged Error Pattern

```typescript
import * as S from "effect/Schema";
import { $RepoCliId } from "@beep/identity/packages";

const $I = $RepoCliId.create("commands/bootstrap-spec");

export class InvalidSpecNameError extends S.TaggedError<InvalidSpecNameError>()($I`InvalidSpecNameError`, {
  specName: S.String,
  reason: S.String,
}) {
  get displayMessage(): string {
    return `Invalid spec name "${this.specName}": ${this.reason}`;
  }
}

export class SpecExistsError extends S.TaggedError<SpecExistsError>()($I`SpecExistsError`, {
  specName: S.String,
}) {
  get displayMessage(): string {
    return `Spec "${this.specName}" already exists at specs/${this.specName}/`;
  }
}
```

---

## Recommended Implementation Steps

### Step 1: Create Directory Structure
```
tooling/cli/src/commands/bootstrap-spec/
├── index.ts              # Command factory and registration
├── handler.ts            # Main handler logic
├── schemas.ts            # Input validation schemas
├── errors.ts             # Tagged error definitions
└── utils/
    ├── template.ts       # Template rendering and context
    └── file-generator.ts # Plan creation and execution
```

### Step 2: Define Schemas (`schemas.ts`)
- SpecName (kebab-case, 3-50 chars)
- SpecDescription (non-empty, max 200 chars)
- BootstrapSpecInput class

### Step 3: Define Errors (`errors.ts`)
- InvalidSpecNameError
- SpecExistsError
- FileWriteError

### Step 4: Create Templates (`utils/template.ts`)
- README template
- REFLECTION_LOG template
- QUICK_START template
- Complexity-based file sets

### Step 5: Create File Generator (`utils/file-generator.ts`)
- createPlan() - build plan based on complexity
- previewPlan() - format for dry-run output
- executePlan() - write files to disk

### Step 6: Create Handler (`handler.ts`)
- Validate inputs
- Check if spec exists
- Create plan
- Handle dry-run vs execute

### Step 7: Create Command (`index.ts`)
- Define options
- Compose service layer
- Register command

### Step 8: Register in CLI (`tooling/cli/src/index.ts`)
- Import bootstrapSpecCommand
- Add to subcommands array

---

## Summary

Key patterns to follow:
1. **Type Safety**: Schema validation with branded types
2. **Composability**: Layered services with Effect patterns
3. **Error Handling**: Tagged errors with structured messages
4. **Testability**: Pure plan generation, side-effects in execution
5. **User Experience**: Dry-run mode, detailed feedback
