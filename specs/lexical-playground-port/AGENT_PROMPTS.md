# Agent Prompts

> Copy-paste prompts for sub-agents used in the Lexical Playground Port specification.

---

## Agent Registry

| Agent | Phases | Primary Use |
|-------|--------|-------------|
| `package-error-fixer` | P1 | Lint/type/build error fixes |
| `codebase-researcher` | P2, P5 | Code pattern exploration |
| `effect-code-writer` | P2, P3, P5, P6 | Code implementation |
| `code-reviewer` | P5 | Pattern violation detection |
| `mcp-researcher` | P6 | Effect documentation lookup |

---

## package-error-fixer

### Delegation Trigger

Use when:
- Lint command reports errors
- Type check command reports errors
- Build command fails

### Prompt Template

```markdown
Fix all type errors, build errors, and lint issues for the @beep/todox package.

**Focus Directory**: `apps/todox/src/app/lexical/`

**Priority Order**:
1. [FIRST] Fix corrupted InsertLayoutDialog.tsx license header at `plugins/LayoutPlugin/InsertLayoutDialog.tsx`
2. Run `bun run lint:fix --filter=@beep/todox` for auto-fixes
3. Add `type="button"` to all `<button>` elements missing type attribute
4. Remove unused imports (especially `import * as React from "react"`)
5. Fix remaining individual errors per lint output

**Quality Commands** (verify each step):
```bash
bun run lint --filter=@beep/todox    # Target: 0 errors
bun run check --filter=@beep/todox   # Target: 0 errors
bun run build --filter=@beep/todox   # Target: Success
```

**Known Patterns**:
- Button type fix: `<button onClick=...>` → `<button type="button" onClick=...>`
- isNaN fix: `isNaN(value)` → `Number.isNaN(value)`
- Unused import: Remove `import * as React` when destructured imports exist

**Do NOT fix**: `dangerouslySetInnerHTML` warnings - these are required for editor functionality.
```

### Expected Output

- Zero lint errors
- Zero type errors
- Successful build

---

## codebase-researcher

### Delegation Trigger

Use when:
- Need to understand existing code patterns before refactoring
- Searching for more than 3 files
- Mapping component dependencies

### Prompt Template (P2: CSS Analysis)

```markdown
Analyze the CSS files in `apps/todox/src/app/lexical/` to plan Tailwind conversion.

**Research Questions**:
1. What CSS properties are used in each file?
2. Which styles are critical for Lexical functionality vs. cosmetic?
3. What Tailwind utilities map to the existing styles?
4. Are there CSS variables that need to be preserved?

**Scope**: 32 CSS files
- `themes/` (3 files) - Editor themes
- `ui/` (12 files) - UI components
- `plugins/` (17 files) - Plugin styling

**Output Format**:
```markdown
## [File Path]
- **Critical for function**: Yes/No
- **Key patterns**: [list CSS patterns]
- **Tailwind mapping**: [list utility classes]
- **Preserve**: [CSS variables or complex selectors]
```

Do NOT modify any files. Research only.
```

### Prompt Template (P5: Pattern Detection)

```markdown
Search for unsafe TypeScript patterns in `apps/todox/src/app/lexical/`.

**Search Targets**:
1. Type assertions: `as Type`, `as any`
2. Non-null assertions: `value!`
3. `any` types in function signatures
4. Native array methods: `.map()`, `.filter()`, `.reduce()`
5. Native string methods: `.split()`, `.toLowerCase()`

**For Each Finding**:
- File path and line number
- Current pattern
- Recommended Effect replacement

**Output Format**:
```markdown
## File: [path]
Line [N]: `array.map(...)` → `A.map(array, ...)`
Line [M]: `value!` → `O.fromNullable(value)`
```

Do NOT modify any files. Research only.
```

### Expected Output

- Comprehensive pattern inventory
- No code modifications

---

## effect-code-writer

### Delegation Trigger

Use when:
- Writing new Effect-based code
- Refactoring existing code to use Effect patterns
- Creating API routes with Effect handlers

### Prompt Template (P2: Component Replacement)

```markdown
Replace the Lexical UI component with its shadcn equivalent.

**Component**: `apps/todox/src/app/lexical/ui/Modal.tsx`
**Replace With**: shadcn `Dialog` component

**Critical Constraint**: This repo uses `@base-ui/react` primitives, NOT `@radix-ui`.

**Reference Implementation**: `apps/todox/src/components/ui/dialog.tsx`

**Tasks**:
1. Read the existing Modal component to understand its API
2. Create a compatibility wrapper using shadcn Dialog
3. Update all imports of Modal to use the new component
4. Remove the old Modal.tsx and Modal.css files
5. Verify no visual regressions

**Pattern Reference**:
```typescript
// Before (Lexical Modal)
import Modal from "../ui/Modal";
<Modal title="Dialog Title" onClose={handleClose}>
  {children}
</Modal>

// After (shadcn Dialog with base-ui)
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogTitle>Dialog Title</DialogTitle>
    {children}
  </DialogContent>
</Dialog>
```

Verify with `bun run check --filter=@beep/todox`.
```

### Prompt Template (P3: API Route)

```markdown
Create Next.js API route for Lexical editor validation.

**Route**: `/api/lexical/validate`
**Method**: POST
**Purpose**: Validate editor state using Lexical headless editor

**Reference**: `apps/todox/src/app/lexical/server/validation.ts`

**Requirements**:
1. Use Effect-based handler pattern
2. Require authentication (use existing auth middleware)
3. Validate input with Effect Schema
4. Return `{ valid: boolean, errors?: string[] }`

**Schema**:
```typescript
import * as S from "effect/Schema";

const ValidateRequest = S.Struct({
  editorState: S.String,
});

const ValidateResponse = S.Struct({
  valid: S.Boolean,
  errors: S.optional(S.Array(S.String)),
});
```

**Pattern Reference**: Check existing API routes in `apps/todox/src/app/api/`.
```

### Prompt Template (P6: Effect Migration)

```markdown
Migrate JSON.parse calls to Effect Schema in `apps/todox/src/app/lexical/`.

**Target Pattern**:
```typescript
// Before
try {
  const data = JSON.parse(input);
  return data;
} catch (e) {
  console.error(e);
  return null;
}

// After
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";

const DataSchema = S.Struct({
  // define expected shape
});

const program = S.decodeUnknown(DataSchema)(input).pipe(
  Effect.catchTag("ParseError", (e) =>
    Effect.logError("Parse failed").pipe(
      Effect.map(() => null)
    )
  )
);
```

**File Scan Command**:
```bash
grep -r "JSON.parse" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx"
```

For each file, create appropriate Schema and migrate to Effect-based parsing.
```

### Expected Output

- Type-safe code following Effect patterns
- All quality commands pass

---

## code-reviewer

### Delegation Trigger

Use when:
- Verifying pattern compliance after refactoring
- Auditing code before phase completion
- Identifying remaining violations

### Prompt Template

```markdown
Review `apps/todox/src/app/lexical/` for repository guideline compliance.

**Check Against**:
- `.claude/rules/effect-patterns.md` - Effect patterns
- `.claude/rules/general.md` - Architecture boundaries

**Specific Checks**:
1. **No any types**: Search for `any` in type positions
2. **No type assertions**: Search for `as Type` patterns
3. **No non-null assertions**: Search for `!` operator
4. **Effect utilities**: Verify `A.map` instead of `.map()`, etc.
5. **Schema validation**: External data validated with Schema

**Output Format**:
| File | Line | Violation | Severity | Suggested Fix |
|------|------|-----------|----------|---------------|

**Severity Levels**:
- **High**: Must fix before phase completion
- **Medium**: Should fix, affects type safety
- **Low**: Stylistic, can defer

Do NOT modify any files. Report only.
```

### Expected Output

- Tabular violation report
- Prioritized by severity

---

## mcp-researcher

### Delegation Trigger

Use when:
- Need Effect documentation for specific patterns
- Unclear on Schema API
- Looking for Layer composition examples

### Prompt Template

```markdown
Research Effect documentation for JSON parsing with Schema.

**Questions**:
1. How to use `S.decodeUnknown` for parsing JSON strings?
2. What's the proper error handling for parse failures?
3. How to create Schema for nested objects?
4. How to handle optional fields in Schema?

**Search Terms**:
- "Schema decodeUnknown"
- "Schema parseJson"
- "ParseError handling"

**Output**: Summarize relevant APIs with code examples.
```

### Expected Output

- Effect API documentation summary
- Code examples for common patterns

---

## Quality Gates

Each agent must verify their work:

| Agent | Verification Command |
|-------|---------------------|
| `package-error-fixer` | `bun run lint && bun run check && bun run build` |
| `codebase-researcher` | N/A (read-only) |
| `effect-code-writer` | `bun run check --filter=@beep/todox` |
| `code-reviewer` | N/A (read-only) |
| `mcp-researcher` | N/A (read-only) |
