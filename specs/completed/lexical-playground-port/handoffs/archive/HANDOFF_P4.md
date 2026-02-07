# Phase 4 Handoff: Runtime Error Fixes

> Full context for implementing Phase 4 of the Lexical Playground Port.

---

## Context Budget Verification

| Memory Type | Content | Est. Tokens | Budget | Status |
|-------------|---------|-------------|--------|--------|
| Working | P4 tasks, debugging protocol | ~1,200 | ≤2,000 | OK |
| Episodic | Phase 3 summary, key learnings | ~500 | ≤1,000 | OK |
| Semantic | File paths, error categories | ~300 | ≤500 | OK |
| **Total** | | **~2,000** | **≤4,000** | **OK** |

---

## Phase 3 Summary

Phase 3 completed successfully. Next.js page and API routes created:

- **Page route**: `/lexical` with dynamic import (SSR disabled)
- **API routes**: `/api/lexical/set-state` and `/api/lexical/validate`
- **Client code**: Updated ActionsPlugin to use relative API paths
- **Quality checks**: All passing (lint, check, build)

Key implementation decisions:
- Dynamic import with `ssr: false` to avoid Lexical browser API issues
- Simplified stateless API routes (JSON validation only, no headless editor)
- Pre-existing circular dependencies noted but not blocking

---

## Phase 4 Objective

Fix all runtime errors and console warnings to achieve a functional editor experience.

**Success Criteria**:
- Zero console errors on page load
- Zero React hydration warnings
- Editor accepts text input
- At least 3 formatting actions work (bold, italic, links)
- No uncaught exceptions in DevTools

---

## Known Issues from Phase 3

### 1. Circular Dependencies (7 instances)

Build warnings show circular imports in Lexical nodes:

```
Circular dependencies:
- nodes/EquationComponent.tsx ↔ nodes/EquationNode.tsx
- nodes/ImageComponent.tsx ↔ nodes/ImageNode.tsx
- nodes/ExcalidrawNode/ExcalidrawComponent.tsx ↔ nodes/ExcalidrawNode/index.tsx
- nodes/PollComponent.tsx ↔ nodes/PollNode.tsx
- nodes/StickyComponent.tsx ↔ nodes/StickyNode.tsx
- nodes/TweetNode.tsx (self)
- nodes/YouTubeNode.tsx (self)
```

**Impact**: May cause runtime issues with lazy loading or undefined references.

**Fix Strategy**:
1. Extract shared types to separate files
2. Use forward references or lazy imports
3. Consider if all these nodes are needed for MVP

### 2. Validation API Simplification

The API routes only perform structural JSON validation, not full Lexical state validation:
- `/api/lexical/set-state` - Acknowledges receipt, checks `root` exists
- `/api/lexical/validate` - Checks `root.type` is string

**Impact**: Read-only mode validation may not work as originally designed.

**Workaround**: Editor still functions; validation is non-blocking.

---

## Debugging Protocol

### Step 1: Start Development Server

```bash
cd /home/elpresidank/YeeBois/projects/beep-effect2
bun run dev --filter=@beep/todox
```

Wait for server to start (typically port 3000).

### Step 2: Access the Editor

1. Open Chrome: `http://localhost:3000/lexical`
2. If redirected to login: Use credentials below
3. Wait for editor to fully load

### Step 3: Capture Console Errors

1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Clear console (Ctrl+L)
4. Refresh page
5. Document ALL errors and warnings:
   - Red errors (critical)
   - Yellow warnings (important)
   - Blue info (lower priority)

### Step 4: Categorize Errors

| Category | Examples | Priority |
|----------|----------|----------|
| React Hydration | "Text content mismatch", "Hydration failed" | High |
| Missing Dependencies | "Cannot read property of undefined" | High |
| Plugin Errors | "Failed to register node", "Plugin threw error" | Medium |
| Deprecation Warnings | "componentWillMount deprecated" | Low |
| Network Errors | 404s, failed fetches | Medium |

### Step 5: Fix in Priority Order

1. **Hydration errors first**: Usually SSR/CSR mismatch
2. **Undefined errors next**: Missing imports or initialization
3. **Plugin errors**: May need to disable problematic plugins
4. **Warnings last**: Unless they cause cascading issues

---

## Authentication Context

### Test Credentials
- **Email**: `beep@hole.com`
- **Password**: `F55kb3iy!`

### Login Route
- `/auth/sign-in`

---

## File Locations Reference

| Purpose | Path |
|---------|------|
| Lexical editor root | `apps/todox/src/app/lexical/` |
| Page component | `apps/todox/src/app/lexical/page.tsx` |
| Main app | `apps/todox/src/app/lexical/App.tsx` |
| Editor component | `apps/todox/src/app/lexical/Editor.tsx` |
| Plugins directory | `apps/todox/src/app/lexical/plugins/` |
| Nodes directory | `apps/todox/src/app/lexical/nodes/` |
| API routes | `apps/todox/src/app/api/lexical/` |

---

## Common Runtime Error Fixes

### Hydration Mismatch

**Symptom**: "Text content does not match server-rendered HTML"

**Fix**: Ensure dynamic import has `ssr: false`:
```tsx
const Component = dynamic(() => import("./Component"), { ssr: false });
```

### Undefined Window/Document

**Symptom**: "window is not defined" or "document is not defined"

**Fix**: Guard with typeof check or move to useEffect:
```tsx
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Browser-only code
  }
}, []);
```

### Missing Node Registration

**Symptom**: "Node type X not registered"

**Fix**: Ensure node is in PlaygroundNodes array:
```typescript
// nodes/PlaygroundNodes.ts
export default [
  // ... all node types
];
```

### Plugin Initialization Error

**Symptom**: "Cannot read property X of undefined" in plugin

**Fix**: Check plugin's useEffect dependencies and initialization order.

### Import Cycle Error

**Symptom**: Undefined exports, "Cannot access X before initialization"

**Fix**:
1. Move shared types to separate file
2. Use lazy/dynamic imports
3. Restructure to break the cycle

---

## Testing Checklist

### Basic Functionality
- [ ] Page loads without white screen
- [ ] Editor area is visible
- [ ] Can click into editor
- [ ] Can type text
- [ ] Text appears as typed

### Formatting
- [ ] Bold (Ctrl+B) works
- [ ] Italic (Ctrl+I) works
- [ ] Underline (Ctrl+U) works
- [ ] Link insertion works

### Toolbar
- [ ] Toolbar is visible
- [ ] Dropdown menus open
- [ ] Font size selector works
- [ ] Format buttons respond

### Advanced (if time permits)
- [ ] Code blocks work
- [ ] Lists work
- [ ] Images can be inserted
- [ ] Tables work

---

## Verification Commands

```bash
# After fixes, run quality checks
bunx turbo run lint --filter=@beep/todox
bunx turbo run check --filter=@beep/todox
bunx turbo run build --filter=@beep/todox

# Start dev server for testing
bun run dev --filter=@beep/todox
```

---

## Known Gotchas

1. **Lexical uses imperative DOM**: Many nodes create DOM directly via `createDOM()`, not React. Console errors may come from these.

2. **Plugin order matters**: Some plugins depend on others being registered first. Check `Editor.tsx` for plugin order.

3. **Theme class dependencies**: Lexical nodes reference `.PlaygroundEditorTheme__*` classes. Missing styles can cause visual issues (not errors).

4. **Excalidraw heavy dependency**: If Excalidraw plugin causes issues, consider disabling it for MVP.

5. **Collaboration features**: If using Yjs collaboration, may see WebSocket errors if no server running.

---

## Success Criteria Checklist

- [ ] Zero console errors on page load
- [ ] Zero hydration warnings
- [ ] Editor loads and is interactive
- [ ] Text input works
- [ ] At least 3 formatting actions work
- [ ] No uncaught exceptions
- [ ] All quality commands pass

---

## Next Phase Preview

After P4 completes, P5 will:
- Remove `as Type` assertions
- Remove `!` non-null assertions
- Replace `any` with proper types
- Use Effect Array/String utilities
- Apply repository best practices
