# Lexical Canonical Editor Spec

**Status: COMPLETED (Phase 3 Complete)**

> Extract Lexical POC into canonical reusable editor component, replace tiptap email compose editor.

---

## Quick Summary

| Metric | Target |
|--------|--------|
| **Scope** | Extract 171+ files, 54 plugins from POC → composable component |
| **Target Location** | `apps/todox/src/components/editor/` |
| **First Integration** | Replace tiptap editor on `/` route email compose |
| **Complexity Score** | 38 (Medium) |

---

## Overview

This specification orchestrates the extraction of the Lexical editor from its current POC location (`apps/todox/src/app/lexical/`) into a canonical, reusable editor component. The component will support plugin composition, markdown serialization, and multiple UI modes (fullscreen, rich/simple toggle, mobile-responsive).

**Primary Motivation**: Build a canonical, reusable rich text editor component that will serve as the foundation for all text editing in TodoX. The long-term vision is enabling rich text editing for AI agent chat input — where users can structure prompts with headings, reorder paragraphs, embed formatted tables/code blocks, and drag content around before sending. However, this spec focuses on extraction and first integration only. AI chat input integration is a future spec.

**Immediate Use Case**: Replace the tiptap editor in the email compose area on the `/` route with the new Lexical component.

---

## Problem Statement

The Lexical editor currently exists in three locations with different purposes:

1. **Full POC playground** (`app/lexical/`) - 171+ files, 54 plugins, AI assistant, collaboration features
2. **Simplified wrapper** (`components/blocks/editor-00/`) - 3 files, minimal functionality
3. **Tiptap editor** (`features/editor/`) - Currently unused, but pattern exists

There is no canonical, reusable Lexical component that:
- Supports configurable plugin composition
- Provides fullscreen and rich/simple mode toggles
- Handles markdown serialization bidirectionally
- Works across multiple contexts (email, chat, documents)
- Offers mobile-responsive simplification

---

## Scope

### In Scope

- Extract Lexical editor into reusable component at `src/components/editor/`
- Support configurable plugin composition (not all 54 plugins hardcoded)
- Implement fullscreen toggle (expand to viewport, collapse back)
- Implement rich/simple mode toggle (switch between rich editor and plain textarea)
- Markdown serialization (Lexical state ↔ markdown via `@lexical/markdown`)
- Replace tiptap editor on `/` route with new Lexical component
- Mobile viewport simplified toolbar (reduced options, lean on slash commands)
- Feature parity with tiptap: bold, italic, underline, strike, lists, alignment, links, images, clear format

### Out of Scope (Explicit Non-Goals)

- **NOT** moving editor to shared package (e.g., `packages/ui/editor`) - future step
- **NOT** implementing AI chat input mode yet - focuses on email compose replacement
- **NOT** implementing streaming markdown→Lexical conversion - future spec
- **NOT** removing Lexical playground at `/lexical` - remains as development/testing tool
- **NOT** migrating all 54 plugins - only what's needed for email compose MVP

---

## Success Criteria

### Phase 1: Discovery ✅ COMPLETE
- [x] Spec scaffolding created (README, REFLECTION_LOG, handoffs/)

### Phase 2: Discovery
- [ ] `outputs/codebase-context.md` created with all 4 required sections
- [ ] All 54 Lexical POC plugins cataloged with columns: name, category, email-compose-needed (yes/no), notes
- [ ] Tiptap feature list documents: button name, shortcut key, API method, and behavior for ALL toolbar buttons
- [ ] Feature mapping table maps each tiptap feature to: Lexical plugin name, availability status (Available/Missing), priority (Must-have/Nice-to-have)
- [ ] Existing Lexical wrappers (`blocks/editor-00/`, `components/editor/`) analyzed with reuse recommendations
- [ ] Reflection logged

### Phase 3: Design & Implementation
- [ ] Component API designed
- [ ] Reusable editor implemented at `src/components/editor/`
- [ ] Fullscreen toggle works
- [ ] Rich/simple mode toggle works
- [ ] Markdown serialization bidirectional
- [ ] Mobile simplified toolbar
- [ ] Reflection logged

### Phase 4: Integration
- [ ] Tiptap editor on `/` route replaced with Lexical component
- [ ] Feature parity verified (bold, italic, underline, strike, lists, alignment, links, images, clear format)
- [ ] Send button integration working
- [ ] No regressions on `/` route
- [ ] Reflection logged

### Phase 5: Testing & Polish
- [ ] Tests added for editor component
- [ ] Type errors fixed (`bun run check --filter @beep/todox` passes)
- [ ] Mobile responsive testing complete
- [ ] No regressions in Lexical playground at `/lexical`
- [ ] Reflection logged

---

## Architecture

### Current State

| Directory | What Lives There | Status |
|-----------|------------------|--------|
| `app/lexical/` | Full Lexical playground POC (171+ files, 54 plugins, AI assistant, collaboration, custom nodes) | Page-specific POC |
| `features/editor/` | Tiptap editor with toolbar, bubble toolbar, fullscreen support, custom extensions | Currently unused |
| `components/blocks/editor-00/` | Simplified Lexical wrapper (3 files: editor.tsx, nodes.ts, plugins.tsx) | Minimal reusable block |
| `components/editor/` | Shared editor utilities (themes/editor-theme.css, editor-theme.ts, ContentEditable wrapper) | Cross-editor infrastructure |

### Target State

```
apps/todox/src/components/editor/
├── lexical-editor.tsx           # Main composable component
├── plugins/                     # Extracted plugins (selectively)
│   ├── toolbar/                 # Toolbar plugin with fullscreen + rich/simple toggle
│   ├── markdown/                # Markdown serialization
│   ├── formatting/              # Bold, italic, underline, strike
│   ├── lists/                   # Bullet, ordered lists
│   ├── alignment/               # Text alignment
│   ├── links/                   # Link insertion/removal
│   ├── images/                  # Image insertion
│   └── mobile/                  # Mobile-responsive toolbar
├── nodes/                       # Required node types
├── themes/                      # Editor themes
└── index.ts                     # Barrel exports
```

### Component API Design

> See `templates/component-design.template.md` for the full P2 design documentation structure.

```typescript
interface LexicalEditorProps {
  // Editor content
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;

  // UI modes
  fullscreenEnabled?: boolean;
  richSimpleToggleEnabled?: boolean;
  mobileSimplified?: boolean;

  // Plugin composition
  plugins?: LexicalPlugin[];
  nodes?: LexicalNode[];

  // Styling
  className?: string;
  placeholder?: string;
}
```

---

## Phase Overview

| Phase | Focus | Agents | Estimated Sessions |
|-------|-------|--------|--------------------|
| P0 | Scaffolding | doc-writer | Complete |
| P1 | Discovery | codebase-researcher | 1 |
| P2 | Design & Implementation | react-expert, general-purpose | 2-3 |
| P3 | Integration | general-purpose | 1 |
| P4 | Testing & Polish | test-writer, package-error-fixer | 1-2 |

---

## Complexity Assessment

**Score: 38 → Medium**

| Factor | Value | Weight | Score |
|--------|-------|--------|-------|
| Phase Count | 4 | 2 | 8 |
| Agent Diversity | 4 | 3 | 12 |
| Cross-Package | 1 (apps/todox) | 4 | 4 |
| External Deps | 0 | 3 | 0 |
| Uncertainty | 2 (moderate) | 5 | 10 |
| Research | 2 (moderate) | 2 | 4 |
| **Total** | | | **(4×2)+(4×3)+(1×4)+(0×3)+(2×5)+(2×2) = 38** |

**Structure**: Medium complexity - includes QUICK_START, outputs/, handoffs/

---

## Key Design Decisions

### 1. Markdown as Wire Format
- Lexical state ↔ Markdown for both input serialization and response parsing
- Use `@lexical/markdown` utilities: `$convertFromMarkdownString`, `$generateMarkdownFromNodes`
- Future: Raw markdown during stream → convert to Lexical blocks on completion

### 2. Plugin Composition
- Component supports configurable plugin array (not all 54 plugins hardcoded)
- Email compose MVP: formatting, lists, alignment, links, images
- Future contexts can compose different plugin sets

### 3. Rich/Simple Toggle
- Toggle button in toolbar for MVP
- Rich mode: Full editor with all plugins
- Simple mode: Plain textarea-like input for quick messages
- Can evolve to auto-detection later

### 4. Mobile Simplification
- Simplified toolbar with reduced options on mobile viewports
- Lean on slash commands for advanced features
- Responsive design, not separate mobile component

### 5. Location Choice
- `apps/todox/src/components/editor/` (not `packages/ui/editor`)
- App-specific for now, can promote to shared package later
- Avoids cross-package complexity in initial implementation

---

## Reference Files

### Lexical POC
- **Entry point**: `apps/todox/src/app/lexical/page.tsx` → `App.tsx` → `Editor.tsx`
- **Plugins**: `apps/todox/src/app/lexical/plugins/` (54 directories)
- **Nodes**: `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts`
- **Themes**: `apps/todox/src/app/lexical/themes/editor-theme.ts`

### Existing Editors
- **Simple Lexical wrapper**: `apps/todox/src/components/blocks/editor-00/`
- **Shared infrastructure**: `apps/todox/src/components/editor/`
- **Tiptap editor**: `apps/todox/src/features/editor/editor.tsx` (has fullscreen support)
- **Tiptap toolbar**: `apps/todox/src/features/editor/components/toolbar.tsx`

### Tiptap Integration Points
- **Email compose page**: `/` route (uses tiptap for compose)
- **Current features**: Heading menu, bold, italic, underline, strike, bullet list, ordered list, align left/center/right/justify, insert link, remove link, insert image, hard break, clear format, fullscreen toggle, send button

### Patterns
- **Effect Patterns**: `.claude/rules/effect-patterns.md`
- **Repository Rules**: `.claude/rules/general.md`
- **Related Specs**: `specs/completed/lexical-playground-port/`, `specs/completed/lexical-utils-effect-refactor/`

---

## Quality Commands

Run after each phase:

```bash
bun run lint:fix --filter @beep/todox
bun run lint --filter @beep/todox
bun run check --filter @beep/todox
bun run build --filter @beep/todox
```

---

## Verification Protocol

After each phase completion:

1. Run quality commands (see above)
2. Verify no regressions with visual inspection
3. Update `REFLECTION_LOG.md` with learnings
4. Create handoff documents for next phase (`HANDOFF_P[N+1].md` + `P[N+1]_ORCHESTRATOR_PROMPT.md`)

---

## Related Specs

- `specs/completed/lexical-playground-port/` - Initial POC port (reference outputs for plugin architecture patterns)
- `specs/completed/lexical-utils-effect-refactor/` - Effect migration patterns
- `specs/_guide/README.md` - Spec creation workflow
- `specs/_guide/HANDOFF_STANDARDS.md` - Handoff document standards

### Patterns to Reuse from Related Specs

Before starting Discovery, agents should check:
- `specs/completed/lexical-playground-port/outputs/` — May contain plugin architecture documentation
- `specs/completed/lexical-playground-port/REFLECTION_LOG.md` — Lessons from the POC port
- `specs/completed/lexical-utils-effect-refactor/REFLECTION_LOG.md` — Effect migration learnings

---

## Entry Points

- **Simple (1 session)**: Start from this README
- **Medium/Complex**: Start from `handoffs/HANDOFF_P1.md` + `handoffs/P1_ORCHESTRATOR_PROMPT.md`

Current phase: **COMPLETED — All phases done (P0→P1→P2→P3)**
