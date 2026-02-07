# Phase 9 Handoff: Runtime Verification

> **Date**: 2026-01-27 | **From**: P7 (Type Assertions) | **Status**: Ready

---

## Working Context (≤2K tokens)

### Current Task

Validate the Lexical Playground has no runtime errors and all features work correctly using Playwright and browser DevTools inspection.

### Prerequisites

- Lexical Playground accessible at `/lexical`
- All P1-P7 code quality phases complete
- Dev server running (`bun run dev`)

### Success Criteria

- [ ] No console errors during page load
- [ ] No console errors during feature testing
- [ ] All toolbar features functional
- [ ] All plugin features functional
- [ ] Issues documented with exact file/line references
- [ ] P10 handoff created with fix recommendations

### Blocking Issues

Pre-existing (outside lexical scope):
- `@beep/runtime-client` build error - Geolocation service type
- `dangerouslySetInnerHTML` lint warning in demo code

---

## Episodic Context (≤1K tokens)

### P1-P7 Summary

| Phase | Focus | Status |
|-------|-------|--------|
| P1 | Lint/Build | ✅ 106→0 errors |
| P2 | CSS/shadcn | ✅ 32→5 CSS files |
| P3 | Next.js | ✅ Page + API routes |
| P4 | Runtime | ✅ SSR guards |
| P6 | Effect | ✅ 46→18 throws |
| P7 | Type assertions | ✅ 79→61 casts |

### Known Acceptable Issues

1. **WebSocket Timeout** - Collaboration plugin tries to connect to non-existent Yjs server (acceptable, collaboration disabled by default)
2. **Circular Dependencies** - 7 instances in Lexical nodes (build warnings only)

---

## Semantic Context (≤500 tokens)

- **Tech stack**: Next.js 16, React 19, Lexical, Effect 3
- **Page URL**: `http://localhost:3000/lexical`
- **Test approach**: Playwright for automation, DevTools for console inspection
- **Output file**: `specs/lexical-playground-port/P9_ISSUES.md`

---

## Procedural Context (Links)

- Main page: `apps/todox/src/app/lexical/page.tsx`
- Editor: `apps/todox/src/app/lexical/Editor.tsx`
- Plugins: `apps/todox/src/app/lexical/plugins/`
- Nodes: `apps/todox/src/app/lexical/nodes/`

---

## Orchestrator Role

**You MUST NOT write code yourself.** Use browser automation tools to:

1. Navigate to the editor page
2. Capture console errors/warnings
3. Test each feature systematically
4. Document issues with stack traces

---

## Test Plan

### Phase 1: Page Load Verification

1. Navigate to `http://localhost:3000/lexical`
2. Wait for editor to fully load
3. Capture any console errors/warnings
4. Take screenshot of initial state

### Phase 2: Core Editor Features

| Feature | Test Action | Expected Result |
|---------|-------------|-----------------|
| Text input | Type "Hello World" | Text appears in editor |
| Bold | Select text + Ctrl+B | Text becomes bold |
| Italic | Select text + Ctrl+I | Text becomes italic |
| Underline | Select text + Ctrl+U | Text becomes underlined |
| Undo | Ctrl+Z | Previous action undone |
| Redo | Ctrl+Shift+Z | Undone action restored |

### Phase 3: Toolbar Features

| Toolbar Item | Test Action | Expected Result |
|--------------|-------------|-----------------|
| Font dropdown | Click and select | Font changes |
| Size dropdown | Click and select | Size changes |
| Alignment | Click each option | Text aligns |
| Insert dropdown | Open menu | No errors |
| Format dropdown | Open menu | No errors |

### Phase 4: Plugin Features

| Plugin | Test Action | Expected Result |
|--------|-------------|-----------------|
| Link | Ctrl+K, enter URL | Link created |
| Image | Insert image | Image displays |
| Code block | Insert code | Syntax highlighting |
| Table | Insert 3x3 table | Table renders |
| Collapsible | Insert collapsible | Expands/collapses |
| Checklist | Insert checklist | Checkboxes work |

### Phase 5: Debug Panel

1. Open TreeView panel
2. Verify tree updates with editor changes
3. Check for console errors during inspection

---

## Output Format

Create `P9_ISSUES.md` with this structure:

```markdown
# P9 Runtime Verification Issues

## Summary
- Total issues found: X
- Critical (blocking): X
- Warning (non-blocking): X
- Info (cosmetic): X

## Issues

### Issue 1: [Title]
- **Severity**: Critical/Warning/Info
- **Category**: Console Error/UI Bug/Feature Broken
- **Steps to Reproduce**:
  1. Step 1
  2. Step 2
- **Error Message**: `exact error text`
- **Stack Trace**: (if available)
- **Suspected Source**: `path/to/file.tsx:123`
- **Screenshot**: (reference if taken)

### Issue 2: ...
```

---

## P10 Handoff Creation

After testing, create `HANDOFF_P10.md` with:

1. **Issue summary** from P9_ISSUES.md
2. **Fix recommendations** for each issue:
   - Exact file and line number
   - Description of the problem
   - Recommended fix approach
   - Code pattern to follow

---

## Verification Commands

```bash
# Start dev server
bun run dev

# Editor URL
http://localhost:3000/lexical

# Console filtering (in DevTools)
# Filter: -/hot-update/ -/webpack/ to reduce noise
```

---

## Gotchas

1. **WebSocket errors are expected** - Yjs collaboration tries to connect
2. **Check for silent failures** - Some features may fail without console errors
3. **Test in both light and dark mode** - Theme switching may cause issues
4. **Check mobile responsiveness** - Resize browser to test
