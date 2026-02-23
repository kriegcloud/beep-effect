# Pull Request: Lexical Playground Port

## Summary

Ports the Facebook Lexical rich text editor playground to the @beep/todox app, accessible at `/lexical`.

**Route**: `http://localhost:3000/lexical`

---

## Changes by Phase

### Phase 1: Initial Port & Lint Fixes

- Ported 143 TS/TSX files from lexical-playground
- Fixed all lint errors (106 errors -> 0)
- Repaired corrupted file (`InsertLayoutDialog.tsx` license header)
- Added `type="button"` to all button elements
- Fixed `isNaN` -> `Number.isNaN` usage

### Phase 2: CSS Consolidation & shadcn Integration

**CSS Reduction**: 32 files -> 5 files

Files kept:
- `index.css` - Main entry point
- `themes/PlaygroundEditorTheme.css` - Editor theme + consolidated node styles
- `themes/CommentEditorTheme.css` - Comment editor theme
- `themes/StickyEditorTheme.css` - Sticky note theme
- `plugins/CommentPlugin/index.css` - Complex comment UI

**UI Component Wrapping**:
- `Modal.tsx` -> Wrapped with shadcn Dialog
- `Button.tsx` -> Wrapped with shadcn Button (variant mapping)
- `DropDown.tsx` -> Wrapped with shadcn DropdownMenu
- `Switch.tsx` -> Integrated with shadcn patterns
- Removed unused `Select.tsx`

**Tailwind Conversions**:
- `PollComponent.tsx` - Full Tailwind conversion
- `StickyComponent.tsx` - ContentEditable styles
- `ImageComponent.tsx` - Caption styles
- Multiple node styles consolidated into theme CSS

### Phase 3: Next.js Integration

**Page Route**:
- Created `apps/todox/src/app/lexical/page.tsx`
- Dynamic import with `ssr: false` to avoid hydration issues
- Loading state while editor initializes

**API Routes**:
- `/api/lexical/set-state` - Validates JSON structure, acknowledges receipt
- `/api/lexical/validate` - Validates root structure has expected type

**Client Updates**:
- Changed `ActionsPlugin` to use relative API paths (`/api/lexical/...`)
- Removed hardcoded `localhost:1235` references

### Phase 4: Runtime Error Fixes

**Static Assets**:
- Moved images to `apps/todox/public/lexical/images/`
- Updated CSS to use absolute paths (`/lexical/images/icons/...`)
- Fixed SVG logo import to use public path

**SSR Fixes**:
- Added `typeof window !== "undefined"` guards in `Editor.tsx`
- Fixed collaboration initialization check

**Floating UI Fix**:
- Removed invalid `elements.reference` from `useFloating` config in `TableHoverActionsV2Plugin`
- Virtual element reference now set dynamically

---

## Testing

### Quality Commands (All Pass)

```bash
bunx turbo run lint --filter=@beep/todox   # OK
bunx turbo run check --filter=@beep/todox  # OK (101 tasks)
bunx turbo run build --filter=@beep/todox  # OK
```

### Manual Testing

- [x] Editor loads without crashes
- [x] Lexical logo displays
- [x] Can type text
- [x] Bold formatting (Ctrl+B)
- [x] Italic formatting (Ctrl+I)
- [x] TreeView debug panel works
- [x] Toolbar dropdowns functional

---

## Known Limitations

### WebSocket Timeout (Acceptable)

The collaboration plugin tries to connect to a non-existent Yjs server, causing a timeout warning. This is expected behavior when collaboration is disabled.

### Circular Dependencies (7 instances)

Build warnings show circular imports in Lexical nodes:
- `EquationComponent.tsx` <-> `EquationNode.tsx`
- `ImageComponent.tsx` <-> `ImageNode.tsx`
- etc.

These are from the upstream Lexical playground architecture and don't affect runtime.

### Deferred Work

- **Phase 5 (Repository Best Practices)**: Removing `as any` casts and type assertions deferred - low ROI for external code
- **Phase 6 (Effect Patterns)**: Converting to Effect deferred - requires substantial rewrite of Lexical internals

---

## File Structure

```
apps/todox/
├── src/app/lexical/
│   ├── page.tsx           # Route entry point (dynamic import)
│   ├── App.tsx            # Main app wrapper
│   ├── Editor.tsx         # Editor component
│   ├── plugins/           # 51 plugin components
│   ├── nodes/             # 25 custom nodes
│   ├── themes/            # Theme definitions + CSS
│   └── ui/                # UI components (shadcn wrapped)
├── src/app/api/lexical/
│   ├── set-state/route.ts # State API
│   └── validate/route.ts  # Validation API
└── public/lexical/
    └── images/            # Static assets
```

---

## Spec Documentation

- [README.md](specs/lexical-playground-port/README.md) - Overview and success criteria
- [CURRENT_STATUS.md](specs/lexical-playground-port/CURRENT_STATUS.md) - Final state
- [REFLECTION_LOG.md](specs/lexical-playground-port/REFLECTION_LOG.md) - Learnings and patterns
