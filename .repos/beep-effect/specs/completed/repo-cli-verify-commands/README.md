# Spec: @beep/repo-cli Verification Commands

## Overview

Convert shell-based verification scripts (`scripts/verify-entityids.sh`, `scripts/verify-effect-patterns.sh`) into proper Effect-based `@beep/repo-cli` commands.

## Problem Statement

The verification scripts were created to detect violations of:
1. **EntityId patterns** - Plain `S.String` IDs in domain/client schemas, missing `.$type<>()` on table columns
2. **Effect patterns** - Native `Set`/`Map`/`Error`/`Date` usage instead of Effect utilities

Current shell scripts work but:
- Cannot be extended with Effect-based analysis
- No structured output (JSON, summary reports)
- No integration with repo-cli's service layer
- No support for filtering by package or severity
- Cannot leverage TypeScript AST for accurate detection

## Goals

1. Replace `scripts/verify-entityids.sh` with `bun run repo-cli verify:entityids`
2. Replace `scripts/verify-effect-patterns.sh` with `bun run repo-cli verify:patterns`
3. Add unified `bun run repo-cli verify` command with subcommands
4. Support `--filter @beep/package` to scope verification
5. Support `--format json|table|summary` output modes
6. Support `--fix` for auto-fixable violations (future)
7. Exit with non-zero code when violations found (CI integration)

## Non-Goals

- Auto-fixing all violations (only structurally simple ones in Phase 3)
- IDE integration (VS Code extension, etc.)
- Real-time file watching

## Technical Approach

### Command Structure

```
bun run repo-cli verify
├── verify:entityids   # EntityId pattern violations
├── verify:patterns    # Effect pattern violations (native collections, etc.)
└── verify:all         # Run all verifications
```

### Service Architecture

```
VerifyCommand
├── PatternMatcherService     # Regex/AST-based violation detection
├── ViolationReporterService  # Formats and outputs violations
└── PackageFilterService      # Filters packages by --filter option
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--filter` | text (optional) | none | Package filter (e.g., `@beep/iam-*`) |
| `--format` | choice | `table` | Output format: `table`, `json`, `summary` |
| `--severity` | choice | `all` | Filter by severity: `critical`, `warning`, `all` |
| `--ci` | boolean | `false` | CI mode (non-zero exit on violations) |

### Violation Model

```typescript
class Violation extends S.Class<Violation>("Violation")({
  id: S.String,
  type: S.Literal("entityid", "native-set", "native-map", "native-error", "native-date"),
  severity: S.Literal("critical", "warning"),
  filePath: S.String,
  line: S.Number,
  column: S.optional(S.Number),
  message: S.String,
  suggestion: S.optional(S.String),
  autoFixable: S.Boolean,
}) {}
```

### Detection Strategies

#### EntityId Violations

| Pattern | Detection | Severity |
|---------|-----------|----------|
| Plain `S.String` ID in domain model | Regex: `: S.String` + grep `(id|Id):` | critical |
| Plain `S.String` ID in client schema | Regex: `: S.String` + grep `(id|Id):` | critical |
| Missing `.$type<>()` on table column | Regex: `pg.text.*notNull()` + grep ID + not `.$type<` | critical |

#### Effect Pattern Violations

| Pattern | Detection | Severity |
|---------|-----------|----------|
| `new Set()` | Regex: `new Set\(` | critical |
| `new Map()` | Regex: `new Map\(` | critical |
| `new Error()` | Regex: `new Error\(` (exclude biome-ignore) | critical |
| `new Date()` | Regex: `new Date\(` (exclude test files) | warning |

## Implementation Phases

### Phase 1: Core Infrastructure

**Goal**: Create command structure and service interfaces

**Deliverables**:
- [x] `tooling/cli/src/commands/verify/index.ts` - Parent command with subcommands
- [x] `tooling/cli/src/commands/verify/schemas.ts` - Violation, ViolationReport schemas
- [x] `tooling/cli/src/commands/verify/errors.ts` - VerificationError tagged errors
- [x] Detection logic embedded in handlers (simpler than separate services)
- [x] Reporting logic in `tooling/cli/src/commands/verify/reporter.ts`
- [x] Register `verifyCommand` in `tooling/cli/src/index.ts`

**Verification**:
```bash
bun run repo-cli verify --help
# Should show subcommands: entityids, patterns, all
```

### Phase 2: EntityId Verification

**Goal**: Implement `verify:entityids` subcommand

**Deliverables**:
- [x] `tooling/cli/src/commands/verify/entityids/index.ts` - Subcommand definition
- [x] `tooling/cli/src/commands/verify/entityids/handler.ts` - Detection logic
- [x] Port detection patterns from `scripts/verify-entityids.sh`
- [x] Support `--filter` option
- [x] Support `--format` option (table, json, summary)
- [x] Non-zero exit code on critical violations

**Verification**:
```bash
bun run repo-cli verify:entityids --format summary
# Should show violation counts matching shell script output

bun run repo-cli verify:entityids --filter @beep/iam-client --format json
# Should output JSON violations for specific package
```

### Phase 3: Effect Pattern Verification

**Goal**: Implement `verify:patterns` subcommand

**Deliverables**:
- [x] `tooling/cli/src/commands/verify/patterns/index.ts` - Subcommand definition
- [x] `tooling/cli/src/commands/verify/patterns/handler.ts` - Detection logic
- [x] Port detection patterns from `scripts/verify-effect-patterns.sh`
- [x] Add severity filtering (critical vs warning for Date)
- [x] Support all shared options

**Verification**:
```bash
bun run repo-cli verify:patterns --format summary
# Should show violation counts matching shell script output

bun run repo-cli verify:patterns --severity critical
# Should exclude Date warnings
```

### Phase 4: Unified Command & Polish

**Goal**: Complete `verify:all` and finalize UX

**Deliverables**:
- [x] `tooling/cli/src/commands/verify/all/index.ts` - Runs both verifications
- [x] Unified report combining all violations
- [x] Add `--ci` flag for CI-friendly output
- [x] Update `package.json` scripts to use new commands

**Verification**:
```bash
bun run repo-cli verify:all --ci
# Exit 1 if violations found, 0 if clean

bun run repo-cli verify --help
# All options documented
```

### Phase 5: Cleanup & Documentation

**Goal**: Remove shell scripts and update documentation

**Deliverables**:
- [x] **DELETE** `scripts/verify-entityids.sh`
- [x] **DELETE** `scripts/verify-effect-patterns.sh`
- [x] Update `package.json` to remove old npm scripts:
  - Remove `verify:entityids` bash script reference
  - Remove `verify:effect-patterns` bash script reference
  - Update `verify:all` to use new repo-cli command
- [x] CLAUDE.md already references correct commands (no changes needed)
- [x] `.claude/rules/effect-patterns.md` has no verification examples (no changes needed)
- [x] Update `documentation/patterns/effect-collections.md` verification section

**Verification**:
```bash
# Shell scripts should not exist
ls scripts/verify-*.sh
# Should return "No such file or directory"

# New commands work
bun run verify:all
# Should execute via repo-cli
```

## File Structure

```
tooling/cli/src/commands/verify/
├── index.ts                    # Parent command with subcommands
├── schemas.ts                  # Violation, ViolationReport schemas
├── errors.ts                   # Tagged error types
├── services/
│   ├── index.ts               # Re-exports
│   ├── pattern-matcher.ts     # PatternMatcherService
│   └── violation-reporter.ts  # ViolationReporterService
├── entityids/
│   ├── index.ts               # verify:entityids command
│   └── handler.ts             # EntityId detection logic
├── patterns/
│   ├── index.ts               # verify:patterns command
│   └── handler.ts             # Effect pattern detection logic
└── all/
    └── index.ts               # verify:all command
```

## Success Criteria

1. `bun run repo-cli verify:entityids` produces identical violation counts to shell script
2. `bun run repo-cli verify:patterns` produces identical violation counts to shell script
3. All output formats work correctly (table, json, summary)
4. `--filter` correctly scopes to specific packages
5. Exit codes are correct for CI integration
6. Shell scripts can be safely removed
7. Documentation updated to reference new commands

## Dependencies

- `@effect/cli` - Command definition and options
- `@effect/platform` - FileSystem for file reading
- `@beep/tooling-utils` - RepoUtils for package discovery
- `picocolors` - Terminal output styling

## References

- Shell scripts: `scripts/verify-entityids.sh`, `scripts/verify-effect-patterns.sh`
- Similar command: `tooling/cli/src/commands/create-slice/` (complex command pattern)
- Simple command: `tooling/cli/src/commands/sync.ts` (single-file pattern)
- Effect patterns: `.claude/rules/effect-patterns.md`
- Database patterns: `documentation/patterns/database-patterns.md`
