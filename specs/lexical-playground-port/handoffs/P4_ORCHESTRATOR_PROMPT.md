# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 of the `lexical-playground-port` spec: **Runtime Error Fixes**.

### Context

Phases 1-3 are complete:
- All quality commands pass (lint, check, build)
- CSS files reduced from 32 to 5
- UI components wrapped with shadcn equivalents
- Page accessible at `/lexical` with dynamic import
- API routes at `/api/lexical/set-state` and `/api/lexical/validate`

Known issues from Phase 3:
- 7 circular dependencies in Lexical nodes (may cause runtime issues)
- API routes simplified to structural validation only

### Your Mission

Fix all runtime errors and console warnings to achieve a functional editor experience.

### Implementation Steps

1. **Start Development Server**:
   ```bash
   cd /home/elpresidank/YeeBois/projects/beep-effect2
   bun run dev --filter=@beep/todox
   ```

2. **Login and Access Editor**:
   - Navigate to: `http://localhost:3000/auth/sign-in`
   - Login: `beep@hole.com` / `F55kb3iy!`
   - Navigate to: `http://localhost:3000/lexical`

3. **Capture All Console Errors**:
   - Open Chrome DevTools (F12)
   - Go to Console tab
   - Clear console, refresh page
   - Document ALL red errors and yellow warnings

4. **Categorize Errors by Priority**:
   | Priority | Category | Action |
   |----------|----------|--------|
   | P0 | White screen / crash | Fix immediately |
   | P1 | Hydration errors | SSR/CSR mismatch |
   | P2 | Undefined errors | Missing imports |
   | P3 | Plugin errors | May disable for MVP |
   | P4 | Warnings | Fix if time permits |

5. **Fix Each Error Category**:

   **Hydration Errors**:
   - Ensure dynamic import has `ssr: false`
   - Check for window/document access outside useEffect

   **Undefined Errors**:
   - Check circular dependency breaks
   - Verify all imports resolve

   **Plugin Errors**:
   - Check PlaygroundNodes registration
   - Verify plugin initialization order in Editor.tsx

6. **Test Core Functionality**:
   - [ ] Editor loads without errors
   - [ ] Can type text
   - [ ] Bold (Ctrl+B) works
   - [ ] Italic (Ctrl+I) works
   - [ ] Link insertion works

7. **Verify Quality**:
   ```bash
   bunx turbo run lint --filter=@beep/todox
   bunx turbo run check --filter=@beep/todox
   bunx turbo run build --filter=@beep/todox
   ```

### Authentication Details

- **Test login**: `beep@hole.com` / `F55kb3iy!`
- **Login route**: `/auth/sign-in`
- **Editor route**: `/lexical`

### Common Error Fixes

**"Text content does not match"** (Hydration):
```tsx
// Ensure ssr: false on dynamic import
const Editor = dynamic(() => import("./Editor"), { ssr: false });
```

**"window is not defined"**:
```tsx
useEffect(() => {
  if (typeof window === 'undefined') return;
  // Browser-only code here
}, []);
```

**"Cannot read property of undefined"** (Circular dep):
```typescript
// Move shared types to separate file
// Or use lazy imports
const Node = React.lazy(() => import('./Node'));
```

**"Node type X not registered"**:
```typescript
// Ensure node in PlaygroundNodes array
// nodes/PlaygroundNodes.ts
```

### Reference Files

- Handoff details: `specs/lexical-playground-port/handoffs/HANDOFF_P4.md`
- Page component: `apps/todox/src/app/lexical/page.tsx`
- Editor component: `apps/todox/src/app/lexical/Editor.tsx`
- Nodes registration: `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts`
- Plugins: `apps/todox/src/app/lexical/plugins/`

### Success Criteria

- [ ] Zero console errors on page load
- [ ] Zero React hydration warnings
- [ ] Editor is visible and interactive
- [ ] Can type text into editor
- [ ] Bold, italic, and links work
- [ ] `bunx turbo run lint --filter=@beep/todox` passes
- [ ] `bunx turbo run check --filter=@beep/todox` passes
- [ ] `bunx turbo run build --filter=@beep/todox` passes

### After Completion

1. Update `specs/lexical-playground-port/REFLECTION_LOG.md` with Phase 4 learnings
2. Create `handoffs/HANDOFF_P5.md` with context for Repository Best Practices
3. Create `handoffs/P5_ORCHESTRATOR_PROMPT.md` for next phase

### Gotchas

1. **Circular dependencies**: 7 known cycles in nodes - may need to extract shared types
2. **Excalidraw heavy**: If causing issues, consider disabling for MVP
3. **Plugin order**: Some plugins depend on others - check Editor.tsx registration order
4. **Theme classes required**: Lexical nodes use `.PlaygroundEditorTheme__*` classes
5. **Collaboration WebSocket**: May see errors if Yjs server not running - can ignore for MVP

### Debugging Tips

1. **Check Network tab**: Look for 404s or failed API calls
2. **Check Sources tab**: Set breakpoints in error locations
3. **React DevTools**: Check component tree for issues
4. **Disable plugins one-by-one**: Isolate which plugin causes errors
5. **Check if error is from Lexical internals**: Some warnings are expected from library
