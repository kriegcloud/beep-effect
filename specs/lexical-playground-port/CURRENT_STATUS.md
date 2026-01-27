# Current Status: Lexical Playground Port

> Last Updated: 2026-01-27

## Status: IN PROGRESS (Phase 6 ~60% Complete, Phase 5 Not Started)

The Lexical Playground has been ported to Next.js and is accessible at `/lexical`. Core functionality works. Effect pattern conversion is in progress.

---

## Phase Completion Summary

| Phase | Description | Status |
|-------|-------------|--------|
| P1 | Lint/Build/Check fixes | COMPLETE |
| P2 | CSS consolidation + shadcn wrapping | COMPLETE |
| P3 | Next.js page + API routes | COMPLETE |
| P4 | Runtime error fixes | COMPLETE |
| P5 | Repository best practices (type assertions) | **NOT STARTED** |
| P6 | Effect patterns | **IN PROGRESS (~60%)** |

## Remaining Work

### Phase 6: Effect Patterns (Priority)

| Issue | Original | Current | Target |
|-------|----------|---------|--------|
| `try {` blocks | 7 | 4 | 0 |
| `JSON.parse` (unprotected) | 7 | 1 | 0 |
| `throw new Error` | 46 | 44 | 0 |

**Files Converted:**
- CopyButton/index.tsx ✅ (Pattern B - Clipboard)
- PrettierButton/index.tsx ✅ (Pattern B - async formatting)
- TweetNode.tsx ✅ (Pattern B - Twitter SDK)
- ImagesPlugin/index.tsx ✅ (Pattern E - Either/Option)
- PollNode.tsx ✅ (Pattern E - Either/Option)
- ExcalidrawComponent.tsx ✅ (Pattern E - Either/Option)
- DateTimeNode.tsx ✅ (Pattern E - Either/Option)

**Files Remaining (try/catch):**
- commenting/models.ts (lines 399, 416)
- TestRecorderPlugin/index.tsx (line 18)
- setupEnv.ts (line 20)

**FOUR DISTINCT PATTERNS** (choose based on operation type):

| Pattern | Name | When to Use |
|---------|------|-------------|
| **A** | Effect.Service + makeAtomRuntime | HTTP requests, API calls, server communication |
| **B** | useRuntime() + makeRunClientPromise() | Async browser APIs, clipboard, DOM, third-party SDKs |
| **E** | effect/Either + effect/Option | **Sync without runtime** - Lexical callbacks, useMemo, event handlers |
| **F** | makeRunClientSync(runtime) | Sync with Effect services needed |

**Critical Constraints**:
1. **Pattern E is PREFERRED for sync code** - no runtime needed, cleaner
2. **Sync effects CANNOT use yield* or Effect.gen** - must use Effect.pipe with flatMap/andThen
3. Use `Effect.fn` for parameterized effects (NOT `(param) => Effect.gen`)
4. Use `S.TaggedError` for all errors (NEVER native `Error`)
5. **Use Option internally, getOrNull only at Lexical API boundaries**

**Canonical References**:
- `plugins/ActionsPlugin/index.tsx` - Shows Pattern A + B combined
- `utils/docSerialization.ts` - Pure Effect patterns
- `nodes/DateTimeNode/DateTimeNode.tsx` - Pattern E (Either/Option) example
- `nodes/PollNode.tsx` - Pattern E example
- `schema/errors.ts` - All tagged error classes
- `packages/runtime/client/src/runtime.ts#L35-52` - Sync runners reference
- `.claude/skills/effect-atom.md` - effect-atom documentation

**Handoff Document**: `specs/lexical-playground-port/handoffs/HANDOFF_P6.md`
**Orchestrator Prompt**: `specs/lexical-playground-port/handoffs/P6_ORCHESTRATOR_PROMPT.md`

### Phase 5: Repository Best Practices

| Issue | Count | Action Needed |
|-------|-------|---------------|
| Type assertions (`as`) | 78 | Replace with proper types / type guards |
| Non-null assertions (`!`) | TBD | Remove or use Option |

---

## Verified Functionality

### Quality Commands

All pass as of 2026-01-27:

```bash
bunx turbo run lint --filter=@beep/todox   # OK
bunx turbo run check --filter=@beep/todox  # OK (101 tasks)
bunx turbo run build --filter=@beep/todox  # OK (/lexical route built)
```

### Editor Features Tested

- [x] Editor loads without crashes
- [x] Lexical logo displays correctly
- [x] Can type text
- [x] Bold formatting (Ctrl+B)
- [x] Italic formatting (Ctrl+I)
- [x] TreeView debug panel works
- [x] Toolbar dropdowns functional

### MCP Validation (REQUIRED for Phases 5-6)

After completing Effect pattern conversions, use MCP tools to verify no regressions:

1. **next-devtools MCP**: Navigate to `/lexical` and inspect editor state
2. **playwright MCP**: Run automated regression tests for:
   - Editor initialization
   - Text input and formatting (bold, italic)
   - Toolbar interactions
   - Share/Import/Export buttons
   - Lock/Unlock toggle

---

## Key Metrics

| Metric | Before | After |
|--------|--------|-------|
| Lint errors | 106 | 0 |
| Type errors | Blocked | 0 |
| CSS files | 32 | 5 |
| Build status | Failing | Passing |
| Runtime errors | Multiple | 1 (acceptable) |

---

## Known Issues (Acceptable for MVP)

### 1. WebSocket Timeout Warning

**Symptom**: "Timeout" unhandled rejection in console
**Cause**: Collaboration plugin tries to connect to non-existent Yjs server
**Impact**: None - collaboration disabled by default
**Resolution**: Not needed for MVP

### 2. Circular Dependencies (7 instances)

**Location**: Lexical nodes (EquationNode, ImageNode, etc.)
**Cause**: Upstream Lexical playground architecture
**Impact**: Build warnings only, no runtime issues
**Resolution**: Can address in future optimization phase

---

## File Structure

### Key Paths

| Purpose | Path |
|---------|------|
| Page route | `apps/todox/src/app/lexical/page.tsx` |
| Main app | `apps/todox/src/app/lexical/App.tsx` |
| Editor | `apps/todox/src/app/lexical/Editor.tsx` |
| Plugins | `apps/todox/src/app/lexical/plugins/` |
| Nodes | `apps/todox/src/app/lexical/nodes/` |
| Themes | `apps/todox/src/app/lexical/themes/` |
| Static assets | `apps/todox/public/lexical/images/` |
| API routes | `apps/todox/src/app/api/lexical/` |

### CSS Files (Consolidated)

| File | Purpose |
|------|---------|
| `index.css` | Main entry, global styles |
| `themes/PlaygroundEditorTheme.css` | Editor theme + node styles |
| `themes/CommentEditorTheme.css` | Comment editor theme |
| `themes/StickyEditorTheme.css` | Sticky note theme |
| `plugins/CommentPlugin/index.css` | Comment UI (complex, kept as-is) |

---

## Deferred Work

### Phase 5: Repository Best Practices

Original scope:
- Remove `as any` casts (~40+ instances in Lexical code)
- Remove non-null assertions
- Use Effect Array/String utilities

**Decision**: Deferred. The Lexical playground is external code with its own patterns. Converting to Effect collections creates significant churn with low ROI for an editor that works correctly.

### Phase 6: Effect Patterns

Original scope:
- Replace `JSON.parse` with `S.parseJson`
- Replace `try/catch` with Effect error handling
- Convert Promises to Effects

**Decision**: Deferred. Same rationale - Lexical's internal patterns are deeply integrated. Effect conversion would require substantial rewrite for minimal benefit.

---

## Next Steps (If Resuming)

1. **If extending editor functionality**: Work within existing Lexical patterns
2. **If integrating with app state**: Use Effect at integration boundaries, not inside Lexical
3. **If fixing specific bugs**: Address individually without wholesale pattern changes

---

## Session Summary

### Sessions Used

| Phase | Sessions | Notes |
|-------|----------|-------|
| P0 (Discovery) | 0.5 | File inventory, lint baseline |
| P1 (Lint/Check) | 1 | Corrupted file fix, lint cleanup |
| P2 (CSS/shadcn) | 2 | 32 → 5 CSS files, component wrapping |
| P3 (Next.js) | 1 | Page + API routes |
| P4 (Runtime) | 1 | SSR guards, asset paths, Floating UI |
| P5 (Finalization) | 0.5 | Documentation, PR prep |
| **Total** | **6** | Within estimate (6-11) |

### Key Learnings

See `REFLECTION_LOG.md` for detailed patterns worth promoting:
- Static Asset Migration Pattern
- Floating UI Virtual Element Pattern
- SSR Guard Pattern
- Wrapper Component Pattern
- Context Budget as Forcing Function
