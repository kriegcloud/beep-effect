# Initial Quality Check Results

> Baseline analysis of `@beep/todox` quality commands before remediation.

**Date**: 2026-01-27

---

## Lint Results

```bash
bun run lint --filter=@beep/todox
```

### Summary

| Category | Count |
|----------|-------|
| Errors | 106 |
| Warnings | 20 |
| Infos | 64 |
| Files checked | 331 |

### Error Breakdown

| Rule | Count | Auto-fixable |
|------|-------|--------------|
| `noUnusedImports` | ~15 | No (but easy) |
| `useButtonType` | ~10 | No |
| `noDangerouslySetInnerHtml` | 5 | No |
| `useTemplate` | ~5 | Yes |
| `noGlobalIsNan` | 1 | Yes |
| `useIframeTitle` | 2 | No |
| `useAnchorContent` | 1 | No |
| `noRedundantAlt` | 1 | No |
| `noExplicitAny` | 2 | No |
| Other | ~64 | Various |

### Sample Errors

**Unused Imports**:
```
src/app/lexical/context/ToolbarContext.tsx:5:8 - React unused
src/app/lexical/hooks/useModal.tsx:4:13 - React unused
src/app/lexical/nodes/EquationComponent.tsx:16:13 - React unused
src/app/lexical/nodes/ExcalidrawNode/ExcalidrawComponent.tsx:11:13 - React unused
src/app/lexical/nodes/FigmaNode.tsx:7:13 - React unused
```

**Button Types Missing**:
```
src/app/lexical/Settings.tsx:53:7 - <button> without type
src/app/lexical/nodes/ExcalidrawNode/ExcalidrawComponent.tsx:161:9 - <button> without type
src/app/lexical/nodes/PollComponent.tsx:99:7 - <button> without type
```

**Template Literal Preferences**:
```
src/app/lexical/collaboration.ts:29:52 - String concat instead of template
src/app/lexical/nodes/DateTimeNode/DateTimeComponent.tsx:168:50 - String concat
```

**Security Warnings (dangerouslySetInnerHTML)**:
```
src/app/demo/_lib/App.tsx:587:23
src/app/demo/_lib/App.tsx:604:25
src/app/demo/_lib/JsonView.tsx:53:43
src/app/lexical/nodes/ExcalidrawNode/ExcalidrawImage.tsx:124:7
```

---

## Type Check Results

```bash
bunx tsc --noEmit -p apps/todox/tsconfig.json
```

### Critical Blocker

**Corrupted File** prevents full type check:

```
apps/todox/src/app/lexical/plugins/LayoutPlugin/InsertLayoutDialog.tsx:1:1 - error TS1161: Unterminated regular expression literal.
```

The file has a malformed license header that breaks parsing:
```
/ **adelnory * Copyright(c);
Meta;
Platforms, Inc.and;
```

**Required Action**: Fix license header before any type checking can complete.

---

## Build Results

Build not yet attempted due to type check blocker.

---

## Circular Dependency Check

```bash
# Part of lint task
madge -c .
```

**Status**: No circular dependencies found in `@beep/todox`.

---

## Priority Order for Fixes

1. **CRITICAL**: Fix corrupted `InsertLayoutDialog.tsx` (blocks type check)
2. **HIGH**: Run `lint:fix` for auto-fixes
3. **MEDIUM**: Fix button types (10+ occurrences)
4. **MEDIUM**: Remove unused imports
5. **LOW**: Address accessibility warnings
6. **LOW**: Review `dangerouslySetInnerHTML` usage (likely acceptable)

---

## Expected Post-P1 State

After Phase 1 completion:
- Zero lint errors
- Zero type errors
- Build passes
- All 331 files clean
