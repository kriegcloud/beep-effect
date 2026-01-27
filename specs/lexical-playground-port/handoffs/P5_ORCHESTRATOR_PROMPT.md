# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 implementation.

---

## Prompt

You are implementing Phase 5 of the `lexical-playground-port` spec: **Repository Best Practices**.

### Context

Phases 1-4 are complete:
- All quality commands pass (lint, check, build)
- CSS files reduced from 32 to 5
- UI components wrapped with shadcn equivalents
- Page accessible at `/lexical` with dynamic import
- API routes at `/api/lexical/set-state` and `/api/lexical/validate`
- Runtime errors fixed, editor functional

### Your Mission

Finalize the spec documentation and prepare for PR/merge.

### Implementation Steps

1. **Update CURRENT_STATUS.md**:
   - Mark all phases as complete
   - Document final state of the codebase

2. **Review REFLECTION_LOG.md**:
   - Ensure Phase 4 learnings are captured
   - Identify patterns ready for promotion to PATTERN_REGISTRY.md

3. **Create PR Description**:
   Summarize changes across all phases:
   - Phase 1: Initial port, lint fixes
   - Phase 2: Build fixes, CSS consolidation (32 → 5 files)
   - Phase 3: UI component wrapping, page setup
   - Phase 4: Runtime error fixes, functionality verification

4. **Final Verification**:
   ```bash
   # Run all quality commands
   bunx turbo run lint --filter=@beep/todox
   bunx turbo run check --filter=@beep/todox
   bunx turbo run build --filter=@beep/todox

   # Start dev server and manually test
   bun run dev --filter=@beep/todox
   # Navigate to http://localhost:3000/lexical
   # Test: typing, bold, italic, links
   ```

5. **Archive Handoff Files**:
   - Move completed handoff files to `handoffs/archive/`
   - Keep only current status documents in root

### Success Criteria

- [ ] CURRENT_STATUS.md updated with Phase 4 completion
- [ ] REFLECTION_LOG.md has Phase 4 learnings
- [ ] All quality commands pass
- [ ] PR description ready
- [ ] Spec structure clean and organized

### Files to Update

| File | Action |
|------|--------|
| `CURRENT_STATUS.md` | Update with Phase 4 completion |
| `README.md` | Update status badge/summary |
| `handoffs/archive/` | Create and archive completed handoffs |

### PR Description Template

```markdown
## Lexical Playground Port

### Summary

Ports the Lexical rich text editor playground to the @beep/todox app, accessible at `/lexical`.

### Changes

**Phase 1: Initial Port & Lint Fixes**
- Ported 143 TS/TSX files from lexical-playground
- Fixed all lint errors (106 errors → 0)
- Repaired corrupted file (InsertLayoutDialog.tsx)

**Phase 2: CSS Consolidation & shadcn Integration**
- Reduced CSS files from 32 to 5
- Wrapped UI components with shadcn equivalents
- Converted inline styles to Tailwind

**Phase 3: Next.js Integration**
- Created page at `/lexical` with dynamic import
- Added API routes for editor state validation
- Migrated server/validation.ts to serverless routes

**Phase 4: Runtime Error Fixes**
- Fixed SSR window access guards
- Fixed SVG import paths (moved to public folder)
- Fixed Floating UI virtual element configuration

### Testing

- [x] Editor loads without errors
- [x] Typing works
- [x] Bold/Italic formatting works
- [x] All quality commands pass

### Known Limitations

- Collaboration feature disabled (requires Yjs server)
- 7 circular dependencies in Lexical nodes (from upstream)
```

### Notes

This phase is primarily documentation and cleanup. The editor is fully functional after Phase 4.
