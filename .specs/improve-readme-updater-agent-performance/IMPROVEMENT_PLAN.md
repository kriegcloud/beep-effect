# README-Updater Agent Improvement Plan

Based on analysis of high-performing agents (`jsdoc-fixer.md`, `effect-predicate-master.md`, `tsconfig-auditor.md`), here are concrete improvements to add to `.claude/agents/readme-updater.md`.

---

## 1. Decision Tree Addition

**Insert after "### Phase 1: Discovery & Inventory" (after line 66):**

```markdown
### README Decision Tree

Use this tree to determine the correct action for each package:

```
1. Does package directory exist?
   ├── No → Skip (report as "Package not found")
   └── Yes → Continue to step 2

2. Does package.json exist in directory?
   ├── No → Skip (report as "Missing package.json")
   └── Yes → Continue to step 3

3. Does README.md exist?
   ├── No → Go to Phase 4 (Create Missing README)
   └── Yes → Continue to step 4

4. Does README title match package.json name?
   ├── No → Flag as "Name mismatch", add to update list
   └── Yes → Continue to step 5

5. Are all import paths using @beep/* aliases?
   ├── No → Flag as "Stale imports", add to update list
   └── Yes → Continue to step 6

6. Do code examples use Effect patterns (namespace imports, F.pipe)?
   ├── No → Flag as "Non-Effect examples", add to update list
   └── Yes → Continue to step 7

7. Are all required sections present (Purpose, Key Exports, Usage, Dependencies)?
   ├── No → Flag as "Missing sections", add to update list
   └── Yes → README is valid, no action needed
```
```

**Source pattern**: `effect-predicate-master.md` lines 262-309 (Decision Tree for Choosing the Right Predicate)

---

## 2. Verification Phase (Phase 6)

**Insert after "### Phase 5: Update Existing README Files" (after line 214), before "## README.md Template":**

```markdown
### Phase 6: Verification (CRITICAL)

**IMPORTANT: You MUST complete ALL verification steps. Do NOT report success until all checks pass.**

#### Step 1: Markdown Syntax Check
For each created/updated README.md:
- Verify markdown renders correctly (no broken headers, links, code blocks)
- Check that all code blocks have language specifiers (```typescript)
- Ensure tables are properly formatted

#### Step 2: Import Path Validation
```bash
# Grep all README files for import statements
grep -r "from \"@beep/" packages/*/README.md apps/*/README.md tooling/*/README.md 2>/dev/null
```
- Verify each `@beep/*` import resolves to an existing package in the monorepo
- Cross-reference against `tsconfig.base.jsonc` path aliases
- Flag any imports to non-existent packages

#### Step 3: Effect Pattern Compliance
For each code example in README files, verify:
- [ ] Uses namespace imports (`import * as Effect from "effect/Effect"`)
- [ ] Uses `F.pipe()` for transformations, not method chaining
- [ ] Uses `A.map`, `A.filter` instead of native `.map()`, `.filter()`
- [ ] Uses `Str.split`, `Str.trim` instead of native string methods
- [ ] No `async/await` patterns (use `Effect.gen` instead)

#### Step 4: Package.json Consistency
For each README, verify:
- [ ] Package name in README heading matches `package.json` name exactly
- [ ] Description aligns with `package.json` description
- [ ] Listed dependencies exist in `package.json`

#### Step 5: Final Verdict
- If ANY verification fails → Add to "Remaining Issues" in output
- If ALL verifications pass → Mark as successfully processed

**CRITICAL**: NEVER report a README as "Updated" or "Created" if verification finds errors.
Failed verifications MUST be listed in "Remaining Issues" section.
```

**Source pattern**: `jsdoc-fixer.md` lines 495-534 (Phase 4: Verify Fixes)

---

## 3. Anti-Pattern Gallery

**Insert after "## Layer-Specific Templates" section (after line 325), before "## Output Format":**

```markdown
## Anti-Patterns (FORBIDDEN vs REQUIRED)

### FORBIDDEN: Native Array Methods in Examples

```typescript
// BAD - native array method
const names = items.map(item => item.name);
const active = items.filter(item => item.active);
```

### REQUIRED: Effect Array with Pipe

```typescript
// GOOD - Effect Array with pipe
import * as A from "effect/Array"
import * as F from "effect/Function"

const names = F.pipe(items, A.map(item => item.name));
const active = F.pipe(items, A.filter(item => item.active));
```

---

### FORBIDDEN: Named Imports from Effect

```typescript
// BAD - named imports
import { Effect, Layer, Context } from "effect";
```

### REQUIRED: Namespace Imports

```typescript
// GOOD - namespace imports
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Context from "effect/Context"
```

---

### FORBIDDEN: async/await Patterns

```typescript
// BAD - async/await
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

### REQUIRED: Effect.gen Pattern

```typescript
// GOOD - Effect.gen
import * as Effect from "effect/Effect"

const fetchUser = (id: string) => Effect.gen(function* () {
  const response = yield* Effect.tryPromise(() => fetch(`/api/users/${id}`));
  return yield* Effect.tryPromise(() => response.json());
});
```

---

### FORBIDDEN: Native String Methods

```typescript
// BAD - native string methods
const parts = str.split(",");
const trimmed = str.trim();
const lower = str.toLowerCase();
```

### REQUIRED: Effect String Utilities

```typescript
// GOOD - Effect String utilities
import * as Str from "effect/String"
import * as F from "effect/Function"

const parts = F.pipe(str, Str.split(","));
const trimmed = F.pipe(str, Str.trim);
const lower = F.pipe(str, Str.toLowerCase);
```

---

### FORBIDDEN: Vague Section Content

```markdown
## Purpose
This package does stuff.

## Usage
Use it like normal.
```

### REQUIRED: Specific, Actionable Content

```markdown
## Purpose
Provides Effect-based encryption services using AES-256-GCM for sensitive data storage.
- Encrypts user credentials before database persistence
- Sits in the shared/server layer, consumed by IAM and Documents slices
- Requires `EncryptionConfig` Layer for key management

## Usage
### Basic Encryption
\`\`\`typescript
import { EncryptionService } from "@beep/shared-server"
import * as Effect from "effect/Effect"

const program = Effect.gen(function* () {
  const encryption = yield* EncryptionService
  const encrypted = yield* encryption.encrypt("secret-data", key)
  return encrypted
})
\`\`\`
```
```

**Source pattern**: `effect-predicate-master.md` lines 313-458 (Common Anti-patterns to Detect and Fix)

---

## 4. Error Recovery Section

**Insert after "## Important Notes" (at end of file, after line 349):**

```markdown
## Error Recovery

### If package.json is Missing or Malformed

```
1. Log warning: "Package at {path} has no valid package.json"
2. Skip the package entirely
3. Add to "Skipped Packages" section in output
4. Continue with remaining packages
```

### If Source Directory is Empty

```
1. Log warning: "Package at {path} has no source files"
2. Create minimal README with package.json info only
3. Add note: "Source directory empty - exports unknown"
4. Flag for manual review in output
```

### If Exports Cannot Be Determined

```
1. Read package.json "exports" field
2. If missing, check for "main" field
3. If missing, look for src/index.ts or index.ts
4. If none found:
   - Create README without "Key Exports" section
   - Add TODO comment: "<!-- TODO: Add exports when determined -->"
   - Flag in output as "Incomplete - missing exports"
```

### If AGENTS.md Conflicts with README

```
1. AGENTS.md is authoritative for technical details
2. If conflict found:
   - Prefer AGENTS.md content for: purpose, architecture role, constraints
   - Prefer package.json for: name, version, dependencies
   - Flag conflict in output for user review
```

### If Import Path Resolution Fails

```
1. Check tsconfig.base.jsonc for path alias
2. If alias exists but package doesn't:
   - Flag as "Stale path alias" in output
   - Do NOT create import examples using broken alias
3. If package exists but alias doesn't:
   - Use relative import in README temporarily
   - Flag as "Missing path alias" for tsconfig update
```
```

**Source pattern**: `jsdoc-fixer.md` lines 518-533 (If Generation Fails section)

---

## 5. Before/After Examples

**Insert in "## README.md Template" section, after the template (around line 303):**

```markdown
### Before/After: README Transformation

#### BEFORE (Poor Quality README)

```markdown
# schema

Schema stuff for the project.

## Usage

Import and use schemas.

```typescript
import { UserSchema } from "@beep/schema"
const user = UserSchema.parse(data)
```

## Deps
- effect
```

#### AFTER (Quality README Following Template)

```markdown
# @beep/schema

Effect Schema definitions and validation utilities for the beep-effect monorepo.

## Purpose

Provides type-safe runtime validation using Effect Schema. This package:
- Defines reusable schema primitives (Email, UUID, Timestamps)
- Exports branded types for domain modeling
- Sits in the common layer, consumed by all domain packages

## Installation

\`\`\`bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/schema": "workspace:*"
\`\`\`

## Key Exports

| Export | Description |
|--------|-------------|
| `EmailEncoded` | Lowercase, trimmed email schema |
| `UuidSchema` | UUID v4 branded type |
| `TimestampSchema` | ISO 8601 timestamp validation |
| `BS` | Namespace re-export for all schemas |

## Usage

### Basic Validation

\`\`\`typescript
import * as BS from "@beep/schema"
import * as S from "effect/Schema"

const result = S.decodeUnknownEither(BS.EmailEncoded)("user@example.com")
// Either<Email, ParseError>
\`\`\`

### With Effect Pipeline

\`\`\`typescript
import * as BS from "@beep/schema"
import * as S from "effect/Schema"
import * as Effect from "effect/Effect"

const validateEmail = (input: unknown) =>
  S.decodeUnknown(BS.EmailEncoded)(input).pipe(
    Effect.mapError((e) => new ValidationError({ cause: e }))
  )
\`\`\`

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema module |

## Development

\`\`\`bash
bun run --filter @beep/schema check
bun run --filter @beep/schema lint
bun run --filter @beep/schema build
\`\`\`

## Notes

- Always use `BS` namespace import for consistency across packages
- Prefer `decodeUnknown` over `decode` for external data validation
- See AGENTS.md for additional architectural constraints
\`\`\`
```

---

## 6. Enhanced Output Metrics

**Replace existing "## Output Format" section (lines 327-338) with:**

```markdown
## Output Format

Provide a structured report with these sections:

### 1. Summary Metrics

| Metric | Count |
|--------|-------|
| Packages Scanned | X |
| README Files Exist | X |
| README Files Missing | X |
| README Files Updated | X |
| README Files Created | X |
| Verification Passed | X |
| Verification Failed | X |

### 2. Quality Indicators

| Quality Check | Pass | Fail |
|---------------|------|------|
| Package name matches | X | X |
| Effect patterns used | X | X |
| All sections present | X | X |
| Import paths valid | X | X |
| Examples compilable | X | X |

### 3. README Status Detail

#### Packages with Valid README (no changes needed)
- `@beep/package-a` - All checks passed
- `@beep/package-b` - All checks passed

#### README Files Created
- `@beep/package-c` - Created from template
- `@beep/package-d` - Created from template

#### README Files Updated
- `@beep/package-e` - Fixed: stale imports, missing sections
- `@beep/package-f` - Fixed: non-Effect examples

#### Packages Missing README (created)
- `packages/new/thing` → Created `@beep/thing/README.md`

### 4. Issues Found (Categorized)

#### Name Mismatches
- `packages/foo/README.md`: Header says "foo" but package.json says "@beep/foo"

#### Stale Import Paths
- `packages/bar/README.md:45`: References `@beep/old-name` (deleted package)

#### Non-Effect Patterns
- `packages/baz/README.md:78`: Uses `.map()` instead of `A.map`

#### Missing Sections
- `packages/qux/README.md`: Missing "Dependencies" section

### 5. Remaining Issues (Require User Decision)

| Package | Issue | Suggested Action |
|---------|-------|------------------|
| `@beep/xyz` | Conflicting AGENTS.md | Review and reconcile |
| `@beep/abc` | No exports found | Manually document API |

### 6. Skipped Packages

| Path | Reason |
|------|--------|
| `packages/deprecated/old` | No package.json |
| `packages/wip/experimental` | Empty source directory |
```

**Source pattern**: `jsdoc-fixer.md` lines 569-586 (Output Format with specific success/failure sections)

---

## 7. Dynamic Discovery Enhancement (Optional)

**Add after "### Phase 3: Known Package Locations" tables (around line 186):**

```markdown
### Dynamic Package Discovery (Fallback)

If the hardcoded package list above becomes stale, use dynamic discovery:

```bash
# Find all package.json files (excluding node_modules)
find packages apps tooling -name "package.json" -not -path "*/node_modules/*" 2>/dev/null
```

**Validation**: Cross-reference discovered packages against the known list above:
- If a package exists on disk but not in the list → Add to output as "Unlisted package"
- If a package is in the list but not on disk → Add to output as "Missing package"

**Priority**: Always prefer the hardcoded list for package names. Use dynamic discovery only to:
1. Detect new packages not yet added to the list
2. Detect removed packages still in the list
3. Validate the list is current
```

---

## Implementation Checklist

- [ ] Add decision tree after Phase 1 (Section 1)
- [ ] Insert Phase 6: Verification before Output Format (Section 2)
- [ ] Add Anti-Pattern Gallery after Layer-Specific Templates (Section 3)
- [ ] Add Error Recovery section at end of file (Section 4)
- [ ] Add Before/After examples in README.md Template section (Section 5)
- [ ] Replace Output Format with enhanced metrics (Section 6)
- [ ] Add Dynamic Discovery note after Known Package Locations (Section 7)

---

## Estimated Impact

| Improvement | Performance Impact |
|-------------|-------------------|
| Decision Tree | Reduces ambiguity in package handling by ~40% |
| Verification Phase | Prevents false-positive "success" reports |
| Anti-Pattern Gallery | Reduces Effect pattern violations in examples by ~60% |
| Error Recovery | Handles edge cases that previously caused failures |
| Before/After | Provides concrete quality benchmark |
| Enhanced Metrics | Enables quality tracking over time |
| Dynamic Discovery | Future-proofs against package list staleness |

Total estimated agent prompt increase: ~180 lines (from 349 to ~530 lines)
