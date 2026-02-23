# Phase 10 Handoff: Issue Resolution

> **Date**: 2026-01-27 | **From**: P9 (Runtime Verification) | **Status**: Ready for Investigation

## Context

Phase 9 runtime verification completed successfully. The Lexical editor is **fully functional** with all core features working:
- Text editing (input, formatting, undo/redo)
- Toolbar (dropdowns, formatting buttons)
- Plugin features (tables, code blocks, collapsibles)
- Debug panel (TreeView with real-time updates)

**One non-blocking issue was found that warrants investigation.**

---

## Issues to Fix

### Issue 1: Timeout Error on Page Load

**Severity**: Warning (non-blocking - editor still works)

**Error Message**:
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

**Problem**: An unhandled promise rejection occurs during page initialization, caught by Next.js error handler. This displays a "1 Issue" badge in the development overlay but doesn't affect editor functionality.

**Root Cause Investigation**:

The "Timeout" error with no additional context suggests a Promise that:
1. Rejects with a bare "Timeout" value (not an Error object)
2. Is not properly caught anywhere in the chain

**Likely Sources** (in order of probability):

1. **Yjs/WebSocket Collaboration** - The playground may initialize Yjs collaboration that attempts to connect to a WebSocket server that doesn't exist in local dev

2. **Excalidraw Plugin** - The Excalidraw component has async initialization that may timeout

3. **Tweet/YouTube Embeds** - External embed components may timeout trying to load resources

**Files to Investigate**:

```
apps/todox/src/app/lexical/
├── index.tsx                    # Main editor setup
├── plugins/
│   ├── CollaborationPlugin/     # Yjs collaboration - PRIMARY SUSPECT
│   ├── ExcalidrawPlugin/        # Async canvas initialization
│   └── AutoEmbedPlugin/         # External embeds
└── nodes/
    ├── ExcalidrawNode/          # Excalidraw component
    ├── TweetNode.tsx            # Twitter embeds
    └── YouTubeNode.tsx          # YouTube embeds
```

**Recommended Fix Approach**:

1. **Search for timeout-related code**:
   ```bash
   grep -r "timeout\|Timeout\|setTimeout" apps/todox/src/app/lexical/
   ```

2. **Check for unhandled Promise patterns**:
   ```typescript
   // PROBLEMATIC - Promise rejects without catch
   const result = await someAsyncOperation(); // If this throws "Timeout", it's unhandled

   // FIXED - Add error handling
   const result = await someAsyncOperation().catch(error => {
     console.warn('Operation timed out:', error);
     return null; // or fallback value
   });
   ```

3. **Wrap collaboration initialization**:
   ```typescript
   // If Yjs/WebSocket collaboration exists:
   useEffect(() => {
     let mounted = true;

     const initCollaboration = async () => {
       try {
         await connectToCollaborationServer();
       } catch (error) {
         if (mounted) {
           console.warn('Collaboration unavailable:', error);
           // Gracefully degrade to local-only mode
         }
       }
     };

     initCollaboration();
     return () => { mounted = false; };
   }, []);
   ```

4. **Check for bare timeout throws**:
   ```typescript
   // PROBLEMATIC
   throw "Timeout";  // Throws a string, not an Error

   // FIXED
   throw new Error("Timeout");  // Proper Error object with stack trace
   ```

**Pattern Reference**: See P7 type guard conversions for similar defensive coding patterns.

---

## Verification Steps After Fix

1. Start dev server: `bun run dev`
2. Navigate to http://localhost:3000/lexical
3. Wait for full page load
4. Verify NO error overlay badge appears
5. Open browser DevTools Console
6. Confirm no unhandled promise rejections
7. Test all editor features still work

---

## Files Modified in P9

None - P9 was verification only.

## Files Created in P9

- `specs/lexical-playground-port/P9_ISSUES.md` - Full issue documentation
- `specs/lexical-playground-port/handoffs/HANDOFF_P10.md` - This file

---

## Success Criteria for P10

- [ ] Timeout error is identified and fixed
- [ ] No error overlay badge on page load
- [ ] No unhandled promise rejections in console
- [ ] All editor features remain functional
- [ ] Code has proper error handling for async operations

---

## Notes

This is a **low-priority fix** since the editor is fully functional. However, it should be addressed before production deployment to ensure:
1. Clean error state in production
2. Proper graceful degradation for features that may be unavailable
3. Better developer experience without spurious error indicators
