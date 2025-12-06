# Review & Optimization Prompt: EXIF Refactor Implementation Guide

## Your Role

You are a senior Effect-TS architect and prompt engineer tasked with reviewing, aligning, fixing, and optimizing the implementation prompt located at `EXIF_REFACTOR_PROMPT.md`. Your goal is to ensure the prompt is comprehensive, accurate, and follows best practices for both Effect-first development and prompt engineering.

---

## Phase 1: Context Gathering

### 1.1 Read the Implementation Prompt
First, read the target prompt file:
```
Read: EXIF_REFACTOR_PROMPT.md
```

### 1.2 Read the Project Guidelines
Understand the codebase conventions by reading:
```
Read: AGENTS.md
```

### 1.3 Examine the Current Implementation
Read the existing files to understand what's being replaced:
```
Read: packages/common/schema/src/integrations/files/exif-metadata/ExifMetadata.ts
Read: packages/common/schema/src/integrations/files/exif-metadata/ExifTags.ts
Read: packages/common/schema/src/integrations/files/exif-metadata/errors.ts
Read: packages/common/schema/src/integrations/files/exif-metadata/index.ts
```

### 1.4 Examine the Reference WASM Pattern
Read the pattern that should be followed for lazy loading:
```
Read: tooling/repo-scripts/src/utils/convert-to-nextgen.ts
```

### 1.5 Research Effect Patterns
Use the `effect-researcher` agent to verify:
- Current best practices for `S.declare` vs `S.Class` in Effect Schema
- Correct patterns for Effect Service/Layer with async initialization
- Proper error handling with `Data.TaggedError`
- Whether `Context.GenericTag` or `Context.Tag` is preferred in current Effect versions

---

## Phase 2: Review Checklist

Evaluate the implementation prompt against each criterion and note issues:

### 2.1 Effect Pattern Compliance

| Criterion | Status | Notes |
|-----------|--------|-------|
| No `async/await` or bare Promises | | |
| Correct import conventions (namespace imports) | | |
| No native Array methods (use `A.map`, etc.) | | |
| No native String methods (use `Str.*`) | | |
| Errors use `Data.TaggedError` | | |
| Services use correct `Context.Tag` pattern | | |
| Layers use `Layer.effect` or `Layer.scoped` correctly | | |
| `Effect.fn` used for named effectful functions | | |
| No `any` types | | |
| Uses `@beep/utils` no-ops where applicable | | |

### 2.2 Schema Pattern Compliance

| Criterion | Status | Notes |
|-----------|--------|-------|
| `S.Class` vs `S.declare` used appropriately | | |
| Schema annotations include `identifier`, `title`, `description` | | |
| Optional fields use `S.optional()` correctly | | |
| Type exports follow `S.Schema.Type<typeof X>` pattern | | |

### 2.3 Architecture Alignment

| Criterion | Status | Notes |
|-----------|--------|-------|
| Follows vertical slice layering (domain -> tables -> infra -> sdk -> ui) | | |
| Uses `@beep/*` path aliases | | |
| Service placed in appropriate package | | |
| No cross-slice imports without going through shared/* | | |

### 2.4 Prompt Engineering Quality

| Criterion | Status | Notes |
|-----------|--------|-------|
| Clear phase structure with numbered steps | | |
| Explicit file paths provided | | |
| Code examples are syntactically correct | | |
| All edge cases addressed | | |
| Validation steps included | | |
| Deliverables checklist complete | | |
| Agent tool usage instructions (effect-researcher) | | |

---

## Phase 3: Specific Issues to Investigate

### 3.1 Effect Version Compatibility
Verify the prompt's code examples work with the current Effect version in the repo:
```bash
grep '"effect":' package.json
```

Check if:
- `Context.GenericTag` is still the correct API (vs `Context.Tag`)
- `S.Class` signature matches current Effect Schema API
- `Layer.effect` vs `Layer.scoped` for async initialization

### 3.2 Missing Pieces
Check if the prompt addresses:
- [ ] What happens if WASM CDN is unreachable?
- [ ] Browser vs Node.js environment detection
- [ ] Proper cleanup/disposal of WASM resources
- [ ] Concurrent extraction handling (multiple files)
- [ ] Memory management for large files
- [ ] Graceful degradation if ExifTool fails

### 3.3 Consumer Migration
Search for actual usages to ensure the prompt covers all migration paths:
```bash
grep -r "ExifMetadata" --include="*.ts" packages/ apps/
grep -r "ExifTags" --include="*.ts" packages/ apps/
grep -r "exifreader" --include="*.ts" packages/ apps/
grep -r "extractMetadata" --include="*.ts" packages/ apps/
```

### 3.4 Package.json Locations
Verify all package.json files that need modification:
```bash
grep -r "exifreader" --include="package.json" .
grep -r "exifreader" --include="*.lock" .
```

---

## Phase 4: Code Example Verification

### 4.1 Verify S.declare Usage
The prompt suggests using `S.declare`. Verify this is the correct pattern for a "pass-through" schema that trusts external data:

```typescript
// Is this the correct S.declare signature in current Effect?
export const ExifMetadata = S.declare(
  (input): input is ExifMetadataValue =>
    typeof input === "object" && input !== null,
  {
    identifier: "ExifMetadata",
    // ...
  }
);
```

Use effect-researcher to confirm the current `S.declare` API.

### 4.2 Verify Service Pattern
The prompt uses `Context.GenericTag`. Verify this is correct:

```typescript
// Is this the current recommended pattern?
export const ExifToolService = Context.GenericTag<ExifToolService>("ExifToolService");

// Or should it be:
export class ExifToolService extends Context.Tag("ExifToolService")<
  ExifToolService,
  ExifToolServiceImpl
>() {}
```

### 4.3 Verify Layer Pattern
Check if `Layer.effect` is appropriate for async initialization or if `Layer.scoped` should be used for proper resource cleanup:

```typescript
// Current in prompt:
export const ExifToolServiceLive = Layer.effect(ExifToolService, make);

// Should it be scoped for cleanup?
export const ExifToolServiceLive = Layer.scoped(ExifToolService, make);
```

---

## Phase 5: Optimization Opportunities

### 5.1 Caching/Memoization
Consider if the module import should be memoized to avoid re-importing on every service instantiation.

### 5.2 Error Enrichment
The error type could include more context:
- ExifTool stderr output
- WASM module load time
- File size that was being processed

### 5.3 Telemetry Integration
Add spans/metrics following `@beep/errors` patterns:
- Extraction duration
- Success/failure rates
- File types processed

### 5.4 Type Safety Improvements
Consider if common EXIF fields should be typed more strictly while still allowing arbitrary fields:

```typescript
interface WellKnownExifFields {
  readonly FileName?: string;
  readonly FileType?: string;
  readonly ImageWidth?: number;
  readonly ImageHeight?: number;
  readonly Make?: string;
  readonly Model?: string;
  // ... other common fields
}

interface ExifMetadataValue extends WellKnownExifFields {
  readonly [key: string]: unknown;
}
```

---

## Phase 6: Deliverables

After completing your review, produce the following:

### 6.1 Issues Report
Create a structured list of issues found:
```markdown
## Critical Issues (Must Fix)
1. [Issue description]
   - Location in prompt: [line/section]
   - Problem: [what's wrong]
   - Fix: [how to fix]

## Moderate Issues (Should Fix)
1. ...

## Minor Issues (Nice to Have)
1. ...
```

### 6.2 Updated Prompt
Rewrite `EXIF_REFACTOR_PROMPT.md` with all fixes applied. Preserve the structure but correct:
- Code examples
- API signatures
- Missing steps
- Unclear instructions

### 6.3 Verification Steps
Add a section to the prompt with commands to verify the implementation:
```bash
# Type check the specific package
bunx turbo run check --filter=@beep/schema

# Build the specific package
bunx turbo run build --filter=@beep/schema

# Run tests for the specific package
bun test packages/common/schema

# Verify no exifreader references remain
grep -r "exifreader" --include="*.ts" packages/ apps/ && echo "FAIL: exifreader still referenced" || echo "PASS"
```

---

## Critical Rules for Your Review

### Effect-TS Compliance (from AGENTS.md)
1. **Import Conventions**: Always use namespace imports
   ```typescript
   import * as Effect from "effect/Effect";
   import * as S from "effect/Schema";
   import * as A from "effect/Array";
   ```

2. **No Native Methods**: Replace all native Array/String methods
   ```typescript
   // BAD
   Array.isArray(parsed) ? parsed[0] : parsed

   // GOOD
   import * as A from "effect/Array";
   A.isArray(parsed) ? A.headNonEmpty(parsed as A.NonEmptyArray<unknown>) : parsed
   ```

3. **Effect.fn for Named Functions**: All exported effectful functions should use `Effect.fn`

4. **Proper Error Handling**: Use `Effect.fail` not `return yield*` for errors

### Prompt Engineering Best Practices
1. **Explicit over Implicit**: Don't assume the implementing agent knows anything
2. **Concrete File Paths**: Always provide full paths, not relative references
3. **Runnable Commands**: All bash commands should be copy-pasteable
4. **Validation at Each Step**: Include verification steps after each phase
5. **Agent Tool Instructions**: Explicitly state when to use `effect-researcher` or other agents

---

## Output Format

Structure your response as:

```markdown
# EXIF Refactor Prompt Review Report

## Executive Summary
[2-3 sentence summary of findings]

## Critical Issues Found
[Numbered list with fixes]

## Moderate Issues Found
[Numbered list with fixes]

## Minor Issues Found
[Numbered list with fixes]

## Optimizations Recommended
[Numbered list]

## Updated Prompt
[Complete rewritten EXIF_REFACTOR_PROMPT.md content]
```

---

## Begin Review

Start by reading the files in Phase 1, then systematically work through each phase. Use the effect-researcher agent when you need to verify current Effect APIs or patterns. Do not skip any phase - thoroughness is more important than speed.
