# Phase 1 Handoff: Fix Lint/Build/Check Errors

> Full context for implementing Phase 1 of the Lexical Playground Port.

---

## Context Budget Verification

| Memory Type | Content | Est. Tokens | Budget | Status |
|-------------|---------|-------------|--------|--------|
| Working | P1 tasks, success criteria | ~800 | ≤2,000 | OK |
| Episodic | Phase 0 summary, key learnings | ~400 | ≤1,000 | OK |
| Semantic | File paths, lint categories | ~200 | ≤500 | OK |
| **Total** | | **~1,400** | **≤4,000** | **OK** |

---

## Phase 0 Summary

Initial analysis completed. The Lexical Playground has been copied to `apps/todox/src/app/lexical/` with 143 TS/TSX files and 32 CSS files. Quality command analysis revealed:

- **106 lint errors** (many auto-fixable)
- **20 lint warnings**
- **64 lint infos** (accessibility)
- **1 corrupted file** requiring manual fix

---

## Critical Issues to Fix First

### 1. Corrupted File (HIGHEST PRIORITY)

**File**: `apps/todox/src/app/lexical/plugins/LayoutPlugin/InsertLayoutDialog.tsx`

**Problem**: License header is malformed - looks like line breaks were inserted incorrectly.

**Current (broken)**:
```
/ **adelnory * Copyright(c);
Meta;
Platforms, Inc.and;
affiliates.
```

**Should be**:
```typescript
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
```

**Action**: Restore the proper license header format.

---

## Lint Error Categories

### Auto-Fixable (run `lint:fix` first)

| Category | Count | Fix |
|----------|-------|-----|
| `useTemplate` | ~5 | String concat → template literals |
| `noUnusedImports` | ~15 | Remove unused imports |

### Manual Fixes Required

| Category | Count | Fix |
|----------|-------|-----|
| `useButtonType` | ~10 | Add `type="button"` attribute |
| `noDangerouslySetInnerHtml` | ~5 | Security review needed |
| `useIframeTitle` | ~2 | Add `title` attribute |
| `noRedundantAlt` | ~1 | Fix alt text |
| `useAnchorContent` | ~1 | Add accessible content |
| `noGlobalIsNan` | ~1 | `isNaN()` → `Number.isNaN()` |
| `noExplicitAny` | ~2 | Type properly |

---

## Implementation Order

1. **Fix corrupted file** (blocks type checking)
2. **Run `bun run lint:fix --filter=@beep/todox`** (auto-fix what we can)
3. **Fix button types** (most common manual fix)
4. **Fix remaining lint errors** (work through list)
5. **Run type check** to find additional issues
6. **Verify with all quality commands**

---

## Verification Commands

```bash
# After each significant change batch
bun run lint --filter=@beep/todox

# After all lint fixes
bun run check --filter=@beep/todox
bun run build --filter=@beep/todox
```

---

## Files Requiring Button Type Fixes

Based on lint output:
- `src/app/lexical/Settings.tsx:53` - options button
- `src/app/lexical/nodes/ExcalidrawNode/ExcalidrawComponent.tsx:161`
- `src/app/lexical/nodes/PollComponent.tsx:99`
- Additional files (search for `<button` without `type=`)

---

## Files with dangerouslySetInnerHTML

These need security review but are likely acceptable for editor output:
- `src/app/lexical/nodes/ExcalidrawNode/ExcalidrawImage.tsx:124` - SVG rendering
- `src/app/demo/_lib/App.tsx:587,604` - Demo content
- `src/app/demo/_lib/JsonView.tsx:53` - JSON display

---

## Files with Unused Imports

- `src/app/lexical/context/ToolbarContext.tsx:5` - React default import
- `src/app/lexical/hooks/useModal.tsx:4` - React namespace
- `src/app/lexical/nodes/EquationComponent.tsx:16` - React namespace
- `src/app/lexical/nodes/ExcalidrawNode/ExcalidrawComponent.tsx:11` - React namespace
- `src/app/lexical/nodes/FigmaNode.tsx:7` - React namespace

Pattern: Many files have `import * as React from "react"` that's unused because they also have destructured imports.

---

## Success Criteria

Phase 1 is complete when ALL of these pass:

- [ ] `bun run lint --filter=@beep/todox` - zero errors
- [ ] `bun run check --filter=@beep/todox` - zero errors
- [ ] `bun run build --filter=@beep/todox` - success

---

## Known Gotchas

1. **Turborepo Cascade**: `check` command checks ALL dependencies. Errors in upstream packages will appear. Focus only on `apps/todox/src/app/lexical/` errors.

2. **React Imports**: The codebase uses both `import * as React` and destructured imports. Prefer keeping only destructured imports.

3. **dangerouslySetInnerHTML**: Don't remove these - they're needed for editor functionality. Just acknowledge the lint warnings.

4. **Test Files**: `test/lexical/utils.test.ts` has intentional `any` casts - may need biome-ignore comments.

---

## Next Phase Preview

After P1 completes, P2 will:
- Convert CSS files to Tailwind utility classes
- Replace lexical UI components with shadcn equivalents
- Ensure visual consistency with existing editor themes
