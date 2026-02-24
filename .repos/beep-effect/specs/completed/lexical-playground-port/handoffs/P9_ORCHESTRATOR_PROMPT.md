# Phase 9 Orchestrator Prompt: Runtime Verification

Copy-paste this prompt to start Phase 9 verification.

---

## Prompt

You are implementing Phase 9 of the `lexical-playground-port` spec: **Runtime Verification**.

### CRITICAL: YOU ARE THE ORCHESTRATOR

**You MUST use browser automation tools** to test the Lexical editor. Use:

| Tool | Purpose |
|------|---------|
| `mcp__claude-in-chrome__*` | Browser automation, screenshots, console reading |
| `Read/Write` | Create issues document |

### Context

Phases 1-7 (code quality) are complete:
- Lint errors: 106 → 0
- Type assertions: 79 → 61 (18 converted to guards)
- Effect patterns applied
- All high-risk casts converted to runtime guards

**Your Mission**: Validate the editor works at runtime and document any issues.

### Pre-requisites

1. Dev server must be running: `bun run dev`
2. Editor accessible at: `http://localhost:3000/lexical`

### Test Execution Steps

#### Step 1: Initialize Browser Session

```
Use mcp__claude-in-chrome__tabs_context_mcp to get current tabs.
Create a new tab if needed with mcp__claude-in-chrome__tabs_create_mcp.
Navigate to http://localhost:3000/lexical
```

#### Step 2: Page Load Verification

1. Take a screenshot after page loads
2. Read console messages: `mcp__claude-in-chrome__read_console_messages`
3. Filter for errors: `pattern: "error|Error|exception|Exception"`
4. Document any errors found

#### Step 3: Core Editor Testing

Test each feature and check console after each action:

| Test | Actions |
|------|---------|
| **Text Input** | Click editor, type "Hello World" |
| **Bold** | Select "Hello", press Ctrl+B |
| **Italic** | Select "World", press Ctrl+I |
| **Undo** | Press Ctrl+Z |
| **Redo** | Press Ctrl+Shift+Z |

After each test:
- Take screenshot
- Read console for errors
- Note any unexpected behavior

#### Step 4: Toolbar Testing

Click each toolbar button/dropdown and verify:
- Dropdown menus open without errors
- Selections apply correctly
- No console errors

Test order:
1. Font family dropdown
2. Font size dropdown
3. Text formatting buttons (B, I, U, S)
4. Text color picker
5. Background color picker
6. Alignment buttons
7. Insert dropdown (Link, Image, Table, etc.)

#### Step 5: Plugin Features

Test these specific features:

| Feature | How to Test |
|---------|-------------|
| **Link** | Select text, Ctrl+K, enter `https://example.com` |
| **Image** | Insert menu → Image → URL input |
| **Code Block** | Insert menu → Code Block → type code |
| **Table** | Insert menu → Table → 3x3 |
| **Horizontal Rule** | Insert menu → Horizontal Rule |
| **Collapsible** | Insert menu → Collapsible Section |

#### Step 6: Debug Panel

1. Find and click the TreeView/Debug toggle
2. Verify tree updates as you type
3. Check for console errors during tree rendering

### Issue Documentation

Create `specs/lexical-playground-port/P9_ISSUES.md` with this format:

```markdown
# P9 Runtime Verification Issues

> **Date**: 2026-01-27 | **Tester**: Claude Code

## Summary

| Severity | Count |
|----------|-------|
| Critical (blocking) | X |
| Warning (non-blocking) | X |
| Info (cosmetic) | X |
| **Total** | X |

## Test Results

### Page Load
- [ ] Editor renders
- [ ] No console errors
- [ ] Toolbar visible
- [ ] Editor focusable

### Core Features
- [ ] Text input works
- [ ] Bold (Ctrl+B) works
- [ ] Italic (Ctrl+I) works
- [ ] Undo/Redo works

### Toolbar Features
- [ ] Font dropdown works
- [ ] Size dropdown works
- [ ] Formatting buttons work
- [ ] Color pickers work
- [ ] Alignment works
- [ ] Insert menu works

### Plugin Features
- [ ] Link insertion works
- [ ] Image insertion works
- [ ] Code block works
- [ ] Table insertion works
- [ ] Collapsible works

---

## Issues Found

### Issue 1: [Descriptive Title]

**Severity**: Critical | Warning | Info

**Category**: Console Error | UI Bug | Feature Broken | Performance

**Steps to Reproduce**:
1. Navigate to /lexical
2. [Specific action]
3. [Another action]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happened]

**Console Error** (if any):
```
[Paste exact error message here]
```

**Stack Trace** (if available):
```
[Paste stack trace here]
```

**Suspected Source File**: `apps/todox/src/app/lexical/path/to/file.tsx`

**Suspected Line**: ~123 (based on stack trace or code inspection)

**Notes**: [Any additional context]

---

### Issue 2: ...

---

## Known/Expected Issues (Not Bugs)

These are documented and intentional:

1. **WebSocket Timeout** - Yjs collaboration server not running
2. **Circular Dependency Warnings** - Build-time only, no runtime impact

```

### P10 Handoff Creation

After testing, create `HANDOFF_P10.md` with fix instructions:

```markdown
# Phase 10 Handoff: Issue Resolution

> **Date**: 2026-01-27 | **From**: P9 (Verification) | **Status**: Ready

## Issues to Fix

### Issue 1: [Title from P9]

**File**: `apps/todox/src/app/lexical/specific/File.tsx`
**Line**: 123-130

**Problem**: [Clear description]

**Root Cause**: [Why this happens]

**Recommended Fix**:
```typescript
// Current code (problematic)
const element = document.querySelector('.foo') as HTMLElement;
element.focus(); // Crashes if element is null

// Fixed code
const element = document.querySelector('.foo');
if (element instanceof HTMLElement) {
  element.focus();
}
```

**Pattern Reference**: See P7 type guard conversions for similar fixes.

---

### Issue 2: ...
```

### Verification

After documenting issues:
1. Count total issues by severity
2. Verify each issue has file/line reference
3. Verify each issue has reproduction steps
4. Create P10 handoff if issues found

### Success Criteria

- [ ] All test categories executed
- [ ] Console checked after each action
- [ ] Screenshots taken for key states
- [ ] P9_ISSUES.md created with all findings
- [ ] P10_HANDOFF.md created (if issues found)
- [ ] Each issue has exact file/line reference
- [ ] Each issue has fix recommendation

### Reference Files

- Handoff: `specs/lexical-playground-port/handoffs/HANDOFF_P9.md`
- Status: `specs/lexical-playground-port/CURRENT_STATUS.md`
- Editor: `apps/todox/src/app/lexical/Editor.tsx`
- Plugins: `apps/todox/src/app/lexical/plugins/`
