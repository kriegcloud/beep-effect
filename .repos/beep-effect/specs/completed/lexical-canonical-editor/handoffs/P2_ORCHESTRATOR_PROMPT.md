# Phase 2 Orchestrator Prompt: Lexical Canonical Editor

> Copy-paste this prompt to start Phase 2 (Design & Implementation).

---

You are implementing Phase 2 (Design & Implementation) of the lexical-canonical-editor spec.

### Context

Phase 1 (Discovery) produced a comprehensive codebase-context document mapping the Lexical POC (53 plugins, 34 nodes), tiptap integration (22 toolbar features, HTML output, fullscreen toggle), and existing Lexical wrappers. All findings are in `specs/pending/lexical-canonical-editor/outputs/codebase-context.md`.

**Key Decisions**:
- Target: `apps/todox/src/components/editor/`
- API: `defineExtension` + `LexicalExtensionComposer` (newer Lexical API)
- Theme: Consolidate to playground theme (206 lines, dark mode)
- Wire format: Markdown via `@lexical/markdown`
- External API: `initialMarkdown`, `onChange(markdown)`, configurable plugins/nodes
- Fullscreen: React state + Portal + CSS fixed + Escape key (replicate tiptap pattern)

### Your Mission

Create the canonical LexicalEditor component and replace tiptap on the `/` route.

**Specific Work Items**:

1. **Create editor component** (`apps/todox/src/components/editor/lexical-editor.tsx`)
   - Use `defineExtension` + `LexicalExtensionComposer` (pattern from `app/lexical/App.tsx:114-121`)
   - Props: `initialMarkdown`, `onChange`, `fullscreenEnabled`, `richSimpleToggleEnabled`, `mobileSimplified`, `plugins`, `nodes`, `className`, `placeholder`
   - Mount 16 email-compose plugins (see list below)
   - Register 10 email-compose nodes

2. **Extract plugins from POC** (`app/lexical/plugins/` → `components/editor/plugins/`)
   - ToolbarPlugin (strip font size/family/color for email MVP)
   - ShortcutsPlugin, FloatingTextFormatToolbarPlugin, FloatingLinkEditorPlugin
   - LinkPlugin, AutoLinkPlugin, MarkdownShortcutPlugin, MarkdownTransformers
   - EmojisPlugin, ComponentPickerPlugin, EmojiPickerPlugin, MentionsPlugin
   - TabFocusPlugin, PreserveSelectionPlugin, ImagesPlugin, DragDropPastePlugin
   - Built-in: RichTextPlugin, HistoryPlugin, ListPlugin, AutoFocusPlugin, CheckListPlugin, ClickableLinkPlugin

3. **Consolidate theme** (copy playground theme → `components/editor/themes/`)
   - From: `app/lexical/themes/editor-theme.ts` (206 lines)
   - From: `app/lexical/themes/editor-theme.css`
   - Remove: old shared theme at `components/editor/themes/` (127 lines)

4. **Implement fullscreen toggle**
   - Pattern from tiptap (`features/editor/editor.tsx:97-139`):
     ```typescript
     const [fullscreen, setFullscreen] = useState(false)
     // Toggle: unmount editor → toggle state → re-render key
     // Escape key listener when fullscreen active
     // Portal wraps editor + Backdrop behind
     // CSS: position: fixed, 16px margins, modal z-index
     ```

5. **Implement markdown serialization**
   - Input: `$convertFromMarkdownString(markdown, TRANSFORMERS)` in editor initial state
   - Output: `$convertToMarkdownString(TRANSFORMERS)` in onChange callback
   - Transformers from `app/lexical/plugins/MarkdownTransformers/`

6. **Replace tiptap on `/` route**
   - Modify `features/mail/mail-compose.tsx` (line 127): swap `<Editor>` with `<LexicalEditor>`
   - Modify `features/mail/mail-details.tsx` (line 240): swap `<Editor>` with `<LexicalEditor>`
   - Current tiptap API: `<Editor value={msg} onChange={fn} placeholder="..." />`
   - Target API: `<LexicalEditor initialMarkdown={msg} onChange={fn} placeholder="..." fullscreenEnabled />`

### Email Compose Node Set (10 nodes)

```typescript
const emailComposeNodes = [
  HeadingNode,        // @lexical/rich-text
  ListNode,           // @lexical/list
  ListItemNode,       // @lexical/list
  QuoteNode,          // @lexical/rich-text
  AutoLinkNode,       // @lexical/link
  LinkNode,           // @lexical/link
  HorizontalRuleNode, // @lexical/react
  ImageNode,          // Custom from app/lexical/nodes/
  MentionNode,        // Custom from app/lexical/nodes/
  EmojiNode,          // Custom from app/lexical/nodes/
];
```

### Feature Mapping (Tiptap → Lexical)

| Tiptap Feature | Lexical Equivalent | Plugin |
|---|---|---|
| Bold/Italic/Underline/Strike | FORMAT_TEXT_COMMAND | RichTextPlugin (built-in) |
| Heading Selector | Block format dropdown | ToolbarPlugin |
| Bullet/Ordered List | INSERT_*_LIST_COMMAND | ListPlugin (built-in) |
| Align Left/Center/Right/Justify | FORMAT_ELEMENT_COMMAND | ToolbarPlugin |
| Insert/Remove Link | TOGGLE_LINK_COMMAND | LinkPlugin + FloatingLinkEditorPlugin |
| Insert Image | INSERT_IMAGE_COMMAND | ImagesPlugin |
| Hard Break | INSERT_LINE_BREAK_COMMAND | RichTextPlugin (built-in) |
| Clear Format | Clear nodes + unset marks | ToolbarPlugin |
| Undo/Redo | UNDO/REDO_COMMAND | HistoryPlugin (built-in) |
| Fullscreen Toggle | Custom implementation | New (React state + Portal + CSS) |
| Bubble Toolbar | Selection-triggered toolbar | FloatingTextFormatToolbarPlugin |

### Critical Patterns

**Delegation Pattern** (REQUIRED):
- Use `effect-code-writer` agent for component implementation
- Use `codebase-researcher` agent to verify plugin dependencies before extraction
- Use `package-error-fixer` agent after implementation to fix type errors

**Do NOT**:
- Modify files in `app/lexical/` (POC stays intact)
- Remove tiptap packages/files (defer to Phase 3)
- Add plugins beyond the 16 email-compose set
- Use `LexicalComposer` (older API) -- use `LexicalExtensionComposer`

### Verification

```bash
# Type check
bun run check --filter @beep/todox

# Verify new component exists
ls apps/todox/src/components/editor/lexical-editor.tsx

# Verify tiptap still importable (NOT removed yet)
grep -r "from.*@tiptap" apps/todox/src/features/editor/ | head -5

# Verify Lexical editor used in mail
grep -r "LexicalEditor" apps/todox/src/features/mail/
```

### Success Criteria

- [ ] `apps/todox/src/components/editor/lexical-editor.tsx` created with full props API
- [ ] 16 email-compose plugins mounted and functional
- [ ] 10 email-compose nodes registered
- [ ] Fullscreen toggle works (enter/exit, Escape key)
- [ ] Markdown serialization works (input and output)
- [ ] Tiptap replaced on `/` route (MailCompose + MailDetails)
- [ ] Toolbar has visual parity with tiptap (bold, italic, underline, strike, headings, lists, alignment, links, images, clear format, undo/redo)
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `HANDOFF_P3.md` + `P3_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/pending/lexical-canonical-editor/handoffs/HANDOFF_P2.md`

### Related References

- **Codebase Context**: `specs/pending/lexical-canonical-editor/outputs/codebase-context.md`
- **Component Design Template**: `specs/pending/lexical-canonical-editor/templates/component-design.template.md`
- **Plugin Architecture**: `specs/completed/lexical-playground-port/outputs/02-plugin-architecture.md`
- **Effect Patterns**: `.claude/rules/effect-patterns.md`
