# Implementation Details

## Phase 1: Core Infrastructure

### Command Registration

In `tooling/cli/src/index.ts`, add the verify command to the subcommands array:

```typescript
import { verifyCommand } from "./commands/verify/index.js";

const repoCommand = CliCommand.make("beep").pipe(
  CliCommand.withDescription("Beep repository maintenance CLI."),
  CliCommand.withSubcommands([
    agentsValidateCommand,
    bootstrapSpecCommand,
    createSliceCommand,
    docgenCommand,
    envCommand,
    syncCommand,
    topoSortCommand,
    tsconfigSyncCommand,
    verifyCommand,  // Add this
  ])
);
```

### Shared Options Pattern

Create reusable options in `verify/index.ts`:

```typescript
import * as Options from "@effect/cli/Options";

export const filterOption = Options.text("filter").pipe(
  Options.optional,
  Options.withAlias("f"),
  Options.withDescription("Filter packages by name pattern (e.g., @beep/iam-*)")
);

export const formatOption = Options.choice("format", ["table", "json", "summary"]).pipe(
  Options.withDefault("table"),
  Options.withDescription("Output format")
);

export const severityOption = Options.choice("severity", ["critical", "warning", "all"]).pipe(
  Options.withDefault("all"),
  Options.withDescription("Filter by violation severity")
);

export const ciOption = Options.boolean("ci").pipe(
  Options.withDefault(false),
  Options.withDescription("CI mode: exit non-zero on violations")
);
```

### Violation Schema

```typescript
// schemas.ts
import * as S from "effect/Schema";

export const ViolationType = S.Literal(
  "entityid-domain",
  "entityid-client",
  "entityid-table",
  "native-set",
  "native-map",
  "native-error",
  "native-date"
);

export const ViolationSeverity = S.Literal("critical", "warning");

export class Violation extends S.Class<Violation>("Violation")({
  type: ViolationType,
  severity: ViolationSeverity,
  filePath: S.String,
  line: S.Number,
  column: S.optional(S.Number),
  message: S.String,
  codeSnippet: S.optional(S.String),
  suggestion: S.optional(S.String),
}) {}

export class ViolationReport extends S.Class<ViolationReport>("ViolationReport")({
  violations: S.Array(Violation),
  summary: S.Struct({
    total: S.Number,
    critical: S.Number,
    warning: S.Number,
    byType: S.Record({ key: S.String, value: S.Number }),
  }),
  scannedPackages: S.Array(S.String),
  scannedFiles: S.Number,
}) {}
```

## Phase 2: EntityId Detection

### Detection Patterns (Port from Shell Script)

```typescript
// entityids/handler.ts

const ENTITYID_PATTERNS = [
  {
    name: "entityid-domain",
    description: "Plain S.String ID in domain model",
    glob: "packages/*/domain/src/entities/**/*.ts",
    pattern: /: S\.String/,
    contextPattern: /(id|Id):/i,
    severity: "critical" as const,
    suggestion: "Use EntityId from @beep/shared-domain (e.g., IamEntityIds.MemberId)",
  },
  {
    name: "entityid-client",
    description: "Plain S.String ID in client schema",
    glob: "packages/*/client/src/**/*.ts",
    pattern: /: S\.String/,
    contextPattern: /(id|Id):/i,
    severity: "critical" as const,
    suggestion: "Use EntityId from @beep/shared-domain",
  },
  {
    name: "entityid-table",
    description: "Missing .$type<>() on table ID column",
    glob: "packages/*/tables/src/tables/**/*.ts",
    pattern: /pg\.text\([^)]+\)\.notNull\(\)/,
    contextPattern: /(id|Id)/i,
    excludePattern: /\.\$type</,
    severity: "critical" as const,
    suggestion: "Add .$type<EntityId.Type>() to the column definition",
  },
];
```

### File Scanning Logic

```typescript
const scanForViolations = (
  pattern: DetectionPattern
) => Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repo = yield* RepoUtils;

  const repoRoot = yield* repo.getRepoRoot();
  const files = yield* glob(pattern.glob, { cwd: repoRoot });

  const violations: Violation[] = [];

  for (const file of files) {
    const content = yield* fs.readFileString(path.join(repoRoot, file));
    const lines = Str.split(content, "\n");

    for (let i = 0; i < A.length(lines); i++) {
      const line = lines[i];
      if (!pattern.pattern.test(line)) continue;
      if (pattern.contextPattern && !pattern.contextPattern.test(line)) continue;
      if (pattern.excludePattern && pattern.excludePattern.test(line)) continue;

      violations.push(new Violation({
        type: pattern.name,
        severity: pattern.severity,
        filePath: file,
        line: i + 1,
        message: pattern.description,
        codeSnippet: Str.trim(line),
        suggestion: pattern.suggestion,
      }));
    }
  }

  return violations;
});
```

## Phase 3: Effect Pattern Detection

### Detection Patterns (Port from Shell Script)

```typescript
// patterns/handler.ts

const EFFECT_PATTERNS = [
  {
    name: "native-set",
    description: "Native Set usage (use MutableHashSet.make())",
    glob: "packages/*/src/**/*.ts",
    pattern: /new Set\(/,
    severity: "critical" as const,
    suggestion: "import * as MutableHashSet from 'effect/MutableHashSet'; MutableHashSet.make(...)",
  },
  {
    name: "native-map",
    description: "Native Map usage (use MutableHashMap.make())",
    glob: "packages/*/src/**/*.ts",
    pattern: /new Map\(/,
    severity: "critical" as const,
    suggestion: "import * as MutableHashMap from 'effect/MutableHashMap'; MutableHashMap.make(...)",
  },
  {
    name: "native-error",
    description: "Native Error constructor (use S.TaggedError)",
    glob: "packages/*/src/**/*.ts",
    pattern: /new Error\(/,
    excludePattern: /\/\/ biome-ignore/,
    severity: "critical" as const,
    suggestion: "Create a tagged error class extending S.TaggedError",
  },
  {
    name: "native-date",
    description: "Native Date constructor (prefer DateTime.now)",
    glob: "packages/*/src/**/*.ts",
    pattern: /new Date\(/,
    excludeGlob: "**/*.test.ts",  // Exclude test files
    severity: "warning" as const,
    suggestion: "import * as DateTime from 'effect/DateTime'; yield* DateTime.now",
  },
];
```

## Phase 4: Unified Command

### All Command Handler

```typescript
// all/index.ts

export const verifyAllCommand = Command.make(
  "all",
  { filter: filterOption, format: formatOption, severity: severityOption, ci: ciOption },
  (options) => Effect.gen(function* () {
    const entityIdViolations = yield* entityIdHandler(options);
    const patternViolations = yield* patternHandler(options);

    const allViolations = A.appendAll(entityIdViolations, patternViolations);

    yield* reportViolations(allViolations, options);

    if (options.ci && A.length(allViolations) > 0) {
      return yield* Effect.fail(new ViolationsFoundError({ count: A.length(allViolations) }));
    }
  })
);
```

## Phase 5: Cleanup

### Files to Delete

```bash
# These files MUST be deleted after verification
rm scripts/verify-entityids.sh
rm scripts/verify-effect-patterns.sh
```

### package.json Updates

```json
{
  "scripts": {
    // REMOVE these:
    // "verify:entityids": "bash scripts/verify-entityids.sh",
    // "verify:effect-patterns": "bash scripts/verify-effect-patterns.sh",
    // "verify:all": "bash scripts/verify-entityids.sh && bash scripts/verify-effect-patterns.sh",

    // REPLACE with:
    "verify:entityids": "bun run repo-cli verify entityids",
    "verify:patterns": "bun run repo-cli verify patterns",
    "verify:all": "bun run repo-cli verify all"
  }
}
```

### Documentation Updates

1. **CLAUDE.md** - Update verification section to show new commands
2. **`.claude/rules/effect-patterns.md`** - Update verification examples
3. **`documentation/patterns/effect-collections.md`** - Update verification commands section

## Output Format Examples

### Table Format (Default)

```
Verification Report
═══════════════════

 Severity │ Type           │ File                                    │ Line │ Message
──────────┼────────────────┼─────────────────────────────────────────┼──────┼─────────────────────────
 critical │ entityid-client│ packages/iam/client/src/member.schema.ts│  42  │ Plain S.String ID
 critical │ native-set     │ packages/knowledge/server/src/utils.ts  │  18  │ Native Set usage
 warning  │ native-date    │ packages/documents/server/src/service.ts│  95  │ Native Date constructor

Summary: 3 violations (2 critical, 1 warning) across 25 files
```

### JSON Format

```json
{
  "violations": [
    {
      "type": "entityid-client",
      "severity": "critical",
      "filePath": "packages/iam/client/src/member.schema.ts",
      "line": 42,
      "message": "Plain S.String ID in client schema",
      "suggestion": "Use EntityId from @beep/shared-domain"
    }
  ],
  "summary": {
    "total": 3,
    "critical": 2,
    "warning": 1,
    "byType": {
      "entityid-client": 1,
      "native-set": 1,
      "native-date": 1
    }
  },
  "scannedPackages": ["@beep/iam-client", "@beep/knowledge-server", "@beep/documents-server"],
  "scannedFiles": 25
}
```

### Summary Format

```
Verification Summary
════════════════════

EntityId Violations:
  ✗ Domain models:  5 violations
  ✗ Client schemas: 46 violations
  ✗ Table columns:  0 violations

Effect Pattern Violations:
  ✓ Native Set:   0 violations
  ✓ Native Map:   0 violations
  ✓ Native Error: 0 violations
  ⚠ Native Date:  12 violations (warning)

Total: 51 critical, 12 warnings
```

## Testing Strategy

### Unit Tests

```typescript
// test/commands/verify/entityids.test.ts
import { effect, strictEqual } from "@beep/testkit";
import { scanForViolations, ENTITYID_PATTERNS } from "./handler.js";

effect("detects plain S.String ID fields", () =>
  Effect.gen(function* () {
    const testContent = `
      export class Member extends S.Class<Member>()({
        id: S.String,  // This should be flagged
        name: S.String,  // This should NOT be flagged
      }) {}
    `;

    const violations = yield* scanContent(testContent, ENTITYID_PATTERNS[0]);
    strictEqual(violations.length, 1);
    strictEqual(violations[0].line, 3);
  })
);
```

### Integration Tests

```typescript
// test/commands/verify/integration.test.ts
import { effect, strictEqual } from "@beep/testkit";
import { runRepoCli } from "../../src/index.js";

effect("verify:entityids returns correct exit code", () =>
  Effect.gen(function* () {
    const result = yield* runRepoCli(["verify", "entityids", "--format", "json"]);
    // Verify output structure
  })
);
```
