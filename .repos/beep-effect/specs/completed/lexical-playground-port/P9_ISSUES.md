# P9 Runtime Verification Issues

> **Date**: 2026-01-27 | **Tester**: Claude Code | **Editor URL**: http://localhost:3000/lexical

## Summary

| Severity | Count |
|----------|-------|
| Critical (blocking) | 0 |
| Warning (non-blocking) | 1 |
| Info (cosmetic) | 0 |
| **Total** | 1 |

## Test Results

### Page Load
- [x] Editor renders
- [x] Toolbar visible
- [x] Editor focusable
- [ ] No console errors - **Warning: Timeout error on initial load**

### Core Features
- [x] Text input works
- [x] Bold (Ctrl+B) works
- [x] Italic (Ctrl+I) works
- [x] Undo (Ctrl+Z) works
- [x] Redo (Ctrl+Shift+Z) works

### Toolbar Features
- [x] Font family dropdown works (Arial, Courier New, Georgia, Times New Roman, Trebuchet MS, Verdana)
- [x] Block format dropdown works (Normal, Heading 1-3, Lists, Quote, Code Block)
- [x] Formatting buttons work (B, I, U)
- [x] Insert menu works (Horizontal Rule, Image, Table, Collapsible, etc.)
- [x] Alignment dropdown works

### Plugin Features
- [x] Table insertion works (3x3 table successfully inserted)
- [x] Code block works (with language selector)
- [x] Floating toolbar appears on text selection
- [x] Drag handles visible on block selection

### Debug Panel
- [x] TreeView displays document structure
- [x] Tree updates in real-time as content changes
- [x] Export DOM button visible
- [x] Time Travel button visible

---

## Issues Found

### Issue 1: Timeout Error on Page Load

**Severity**: Warning (non-blocking)

**Category**: Console Error

**Steps to Reproduce**:
1. Navigate to http://localhost:3000/lexical
2. Wait for page to load
3. Observe Next.js error overlay badge "1 Issue" in top-left corner
4. Click badge to view error details

**Expected Behavior**: Page loads without runtime errors

**Actual Behavior**: A "Timeout" runtime error is caught by Next.js error handler, displayed in the error overlay. The editor still functions normally despite this error.

**Console Error**:
```
Runtime Error
Timeout
```

**Stack Trace**:
```
coerceError
  ../../node_modules/next/src/next-devtools/userspace/app/errors/stitched-error.ts (14:35)

onUnhandledRejection
  ../../node_modules/next/src/next-devtools/userspace/app/errors/use-error-handler.ts (110:28)
```

**Suspected Source**: This appears to be an unhandled promise rejection, likely from:
- WebSocket connection timeout (Yjs collaboration server not running)
- Some async initialization that times out

**Notes**:
- The error does NOT block editor functionality
- All core editing features work correctly after the error
- This may be related to collaboration features (Yjs) that require a WebSocket server
- The error only appears in development mode via Next.js error overlay

**Recommended Investigation**:
1. Check for WebSocket/Yjs initialization code that may timeout
2. Look for Promise-based initializations without proper error handling
3. Consider wrapping timeout-prone code in try/catch or adding `.catch()` handlers

---

## Known/Expected Issues (Not Bugs)

These are documented and intentional:

1. **React DevTools Warning** - "If you are profiling the playground app, please ensure you turn off the debug view" - This is just a performance tip from React DevTools, not an error.

2. **Fast Refresh Logs** - "[Fast Refresh] rebuilding" / "[Fast Refresh] done in Xms" - Normal Next.js development behavior.

---

## Test Environment

- **Browser**: Chrome (via Claude-in-Chrome automation)
- **Next.js Version**: 16.2.0-canary.13 (Turbopack)
- **Platform**: Linux
- **Dev Server**: `bun run dev`

---

## Conclusion

The Lexical editor is **functional** with all core features working correctly:
- Text editing (input, formatting, undo/redo)
- Toolbar functionality (dropdowns, buttons)
- Plugin features (tables, code blocks)
- Debug panel (TreeView, real-time updates)

The only issue found is a non-blocking Timeout error on page load, which does not impact editor functionality. This is likely related to WebSocket/collaboration features and should be investigated for a clean production build.

**Recommendation**: Investigate and fix the Timeout error for production readiness, but this is not a P0/blocking issue.
