# 04 - Lexical Editor Integration

## Current State

`packages/editor/lexical/src/EditorSurface.tsx` is a minimal Lexical surface with four node types registered at line 65:

- `HeadingNode`
- `ParagraphNode`
- `QuoteNode`
- `TextNode`

Plugins mounted: `RichTextPlugin`, `HistoryPlugin`, `OnChangePlugin`, `BlockTypeToolbar`.

There is no wiki_link support. No custom decorator nodes. No typeahead. No backlink awareness. The editor can produce and consume basic rich text but has no graph integration.

wiki_link extraction already exists server-side at `packages/editor/domain/src/Canonical.ts:389` via `extractBlockLinks`, which parses `[[target]]` syntax and produces `PageLinkRef` values. The gap is on the editor surface: there is no corresponding Lexical node that renders, resolves, or interacts with these links.

---

## Reference Implementation: beep-effect4/todox

The beep-effect4/todox codebase at `~/YeeBois/projects/beep-effect4/apps/todox/src/components/editor-domain/` contains a full-featured Lexical editor with:

- **54 plugins**: toolbar, AI assistant, collaboration (Yjs + Liveblocks), embeds, code highlighting, tables, floating link editor, drag-and-drop, auto-embed, horizontal rule, tab focus, collapsible containers, context menu, speech-to-text, and more.
- **30 custom node types**: `ExcalidrawNode`, `ImageNode`, `EquationNode`, `TweetNode`, `YouTubeNode`, `FigmaNode`, `StickyNode`, `CollapsibleContainerNode`, `InlineImageNode`, `AutocompleteNode`, `KeywordNode`, `MentionNode`, `PollNode`, and others.
- **Real-time collaboration** via Yjs + Liveblocks provider.
- **Markdown/JSON/HTML serialization** with a `PLAYGROUND_TRANSFORMERS` array for custom markdown rules.

What the reference implementation is **missing**: wiki_links (`[[]]`), backlinks, graph integration. These are exactly the capabilities this spec adds. The existing beep-effect4 editor proves the Lexical plugin architecture scales to 54 plugins, so adding wiki_link support is a known-tractable extension, not speculative.

---

## WikiLinkNode

A custom Lexical `DecoratorNode` that represents a `[[wiki_link]]` inline in the editor.

### Schema

The WikiLinkNode data is validated through an `S.Class` with `$I` identity:

```ts
/**
 * Schema for serialized WikiLinkNode state.
 *
 * Validated at every data boundary: on import from JSON,
 * on markdown parse, and on paste.
 *
 * @example
 * ```ts
 * import { $KnowledgeId } from "@beep/identity/packages"
 * import * as S from "effect/Schema"
 *
 * const $I = $KnowledgeId.create("WikiLink")
 *
 * class SerializedWikiLink extends S.Class<SerializedWikiLink>($I`SerializedWikiLink`)(
 *   {
 *     targetSlug: S.NonEmptyTrimmedString,
 *     displayText: S.NonEmptyTrimmedString,
 *     resolved: S.Boolean,
 *   },
 *   $I.annote("SerializedWikiLink", {
 *     description: "Schema for serialized WikiLinkNode state.",
 *   })
 * ) {}
 * ```
 *
 * @category model
 * @since 0.0.0
 */
```

| Field | Type | Description |
|-------|------|-------------|
| `targetSlug` | `NonEmptyTrimmedString` | Resolved slug of the target page (e.g., `"architecture-decisions"`) |
| `displayText` | `NonEmptyTrimmedString` | Text shown in the editor (defaults to page title, user can override) |
| `resolved` | `boolean` | Whether the target page exists in the vault |

### Node Type

```ts
static getType(): string {
  return "wiki_link"
}
```

### DOM and Decoration

- `createDOM()`: Returns an inline `<span>` element. The span carries CSS classes for styling:
  - Resolved link: `class="wiki_link wiki_link--resolved"` -- blue underlined text with subtle `oklch(0.95 0.02 250)` background.
  - Unresolved link: `class="wiki_link wiki_link--unresolved"` -- amber dashed underline (`border-bottom: 1px dashed oklch(0.75 0.15 70)`), no background fill.
- `decorate()`: Returns a React component that wraps the span content and provides interactive behavior (hover card, click navigation, context menu).
- `updateDOM()`: Returns `false` (the decorator component handles updates).

### Serialization with Schema Validation

```ts
/**
 * JSON export with schema-first validation on the boundary.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // Export: Lexical node -> validated JSON
 * exportJSON(): SerializedWikiLinkNode {
 *   const raw = {
 *     ...super.exportJSON(),
 *     type: "wiki_link",
 *     targetSlug: this.__targetSlug,
 *     displayText: this.__displayText,
 *     resolved: this.__resolved,
 *   }
 *   return S.decodeUnknownSync(SerializedWikiLink)(raw)
 * }
 *
 * // Import: validated JSON -> Lexical node
 * static importJSON(json: SerializedWikiLinkNode): WikiLinkNode {
 *   const data = S.decodeUnknownSync(SerializedWikiLink)(json)
 *   return $createWikiLinkNode(data.targetSlug, data.displayText, data.resolved)
 * }
 * ```
 *
 * @category serialization
 * @since 0.0.0
 */
```

### Visual Treatment

**Resolved links** render as inline blue-underlined spans. The visual weight is intentionally subtle: a thin underline plus a barely-visible background tint. This matches Obsidian's resolved link style and avoids the heavier look of traditional hyperlinks.

**Unresolved links** render with a dashed amber/orange underline. No background. The dashed style signals "this target does not exist yet" without being distracting. Clicking an unresolved link offers to create the target page.

### Interactions

| Action | Behavior |
|--------|----------|
| **Hover** | Shows a `HoverCard` (from `@beep/ui`) containing: page title, excerpt (first 120 characters of body), last updated timestamp, backlink count |
| **Click** | Navigate to target page in editor view. If unresolved, prompt to create the page |
| **Ctrl+Click** | Focus the target node in the graph view (pan + zoom + highlight) |
| **Right-click** | Context menu with: Open in editor, Focus in graph, Copy link, Unlink |

### Registration

Add `WikiLinkNode` to the `editorNodes` array at `EditorSurface.tsx:65`:

```ts
const editorNodes = [
  HeadingNode,
  ParagraphNode,
  QuoteNode,
  TextNode,
  WikiLinkNode, // new
]
```

---

## WikiLinkTypeaheadPlugin

A Lexical plugin that triggers a typeahead dropdown when the user types `[[`.

### Trigger Sequence

1. The plugin registers a text-input listener that watches for `[[` followed by zero or more characters.
2. When `[[` is detected, the plugin enters typeahead mode and renders a dropdown anchored to the cursor position.
3. As the user types additional characters (e.g., `[[arch`), the plugin filters results in real-time.

### Search Backend

The typeahead calls `PagesGroup.searchPages` -- the endpoint already exists at `packages/editor/protocol/src/index.ts:159`. This returns page summaries with title, slug, and excerpt.

For unified mode (Phase 3+), the typeahead also searches `RepoSymbolStore.searchSymbols()` for `[[code:...]]` links. The prefix `code:` switches the search target from vault pages to code entities.

### Result Display

Each result row shows:

| Element | Source |
|---------|--------|
| Page title | `PageSummary.title` |
| Excerpt | First 80 characters of `PageSummary.excerpt` |
| Slug | Shown in muted text below the title |
| Icon | Document icon for pages, code icon for `[[code:...]]` results |

### Selection and Completion

| User action | Result |
|-------------|--------|
| Arrow-select + Enter | Insert `WikiLinkNode` with resolved slug, close brackets, exit typeahead mode |
| Click a result | Same as arrow-select + Enter |
| Type `]]` without selecting | Complete with whatever text is between brackets as an unresolved `WikiLinkNode` |
| Escape | Cancel typeahead, leave raw text `[[` in editor |
| Type with no matches | Show "Create page" action at bottom of dropdown |

The "Create page" action inserts an unresolved `WikiLinkNode` and queues a page creation intent. On next save, the vault persistence layer creates the target page with default frontmatter.

### UI Component

The typeahead dropdown uses the shadcn `Command` component (cmdk) from `@beep/ui`. This is already available in the component library. The `Command` component provides keyboard navigation, filtering, and grouping out of the box.

```
+----------------------------------+
| [[arch                           |
+----------------------------------+
|  Architecture Decisions          |
|     architecture-decisions       |
|  Architecture Overview           |
|     architecture-overview        |
|  --------------------------------|
|  + Create "arch" page            |
+----------------------------------+
```

---

## Backlink Detection and Display

Backlinks are already computed server-side. The `EditorPageResource.backlinks` field returns `PageSummary[]` -- an array of pages that contain `[[wiki_link]]` references to the current page. No new server-side work is needed for basic backlink display.

### Display Locations

**1. Detail panel**: When a page is open in the editor, the workspace detail panel (right zone) shows a "Backlinks" section listing all pages that link to the current page. Each entry shows page title, excerpt, and the specific sentence containing the link.

**2. Bottom of editor**: A collapsible "Backlinks" section below the editor content area, similar to Obsidian's linked mentions pane. This is always visible when editing a page and collapses to a single "N backlinks" summary line.

### BacklinkDisplayPlugin

A new Lexical plugin that renders the in-editor backlinks section.

Responsibilities:
- Fetch backlinks for the current page slug on mount and on page navigation.
- Render a collapsible panel below the editor content with backlink entries.
- Each entry shows: linking page title (clickable, navigates to that page), the paragraph containing the link (with the link text highlighted), and last updated timestamp.
- Collapse state persists across page navigations (stored in `Atom.make`).

The plugin does not modify the Lexical editor state. It renders outside the `ContentEditable` area but inside the editor surface layout.

### Backlink state atom

```ts
/**
 * Backlink collapse state persisted in local atom.
 *
 * @example
 * ```ts
 * import { Atom } from "effect/unstable/reactivity"
 *
 * const backlinkCollapsed$ = Atom.make(true)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
```

---

## Page Save and GraphEvent Emission

When a page is saved, the editor emits graph events through the `KnowledgeGraph` facade, which delegates to `EventLog.write`.

### Emission Sequence

1. **Diff wiki_links**: Compare the current page's `[[wiki_link]]` set against the previous save's link set. Use `extractBlockLinks` (from `packages/editor/domain/src/Canonical.ts:389`) on the serialized markdown content.

2. **Emit node event via KnowledgeGraph facade**:
   - First save: the facade calls `EventLog.write` with event tag `"NodeCreated"`, `kind: "page"`, `domain: "general"`, `certainty: 1.0`, `actor: "user:local"`.
   - Subsequent saves: the facade calls `EventLog.write` with event tag `"NodeUpdated"` and a patch containing changed fields (title, body digest, tags).

3. **Emit edge events for new links**: For each `[[wiki_link]]` that did not exist in the previous save, the facade calls `EventLog.write` with event tag `"EdgeCreated"`, `kind: "wiki_link"`, `source` = current page node ID, `target` = linked page node ID, `certainty: 1.0`.

4. **Emit edge events for removed links**: For each `[[wiki_link]]` that existed in the previous save but not the current save, the facade calls `EventLog.write` with event tag `"EdgeRemoved"` and the corresponding edge ID and `reason: "link removed from page"`.

### Page entity as Model.Class

```ts
/**
 * Page entity modeled with `Model.Class` for multi-variant schemas.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 * import * as S from "effect/Schema"
 *
 * // NOTE: Simplified illustration of the page-save pipeline.
 * // The canonical Page entity (01-data-model.md § Page Entity) uses
 * // DomainModel.make with $I identity, optional keys, and different
 * // field set (aliases, outboundLinks, excerpt). Refer to that
 * // definition for persistence-layer field truth.
 * class Page extends Model.Class<Page>($I`Page`)({
 *   id: Model.Generated(PageId),
 *   slug: PageSlug,
 *   title: S.NonEmptyTrimmedString,
 *   bodyDigest: S.String,
 *   tags: Model.JsonFromString(S.Array(S.String)),
 *   domain: KnowledgeDomain,
 *   certainty: CertaintyTier,
 *   createdAt: Model.DateTimeInsertFromDate,
 *   updatedAt: Model.DateTimeUpdateFromDate,
 * }) {}
 *
 * // Page         -- select variant (full entity)
 * // Page.insert  -- insert variant (id auto-generated)
 * // Page.update  -- update variant (partial fields)
 * // Page.json    -- JSON API variant
 * ```
 *
 * @category model
 * @since 0.0.0
 */
```

> **Cross-reference**: The canonical `Page` entity is defined in 01-data-model.md § Page Entity using `DomainModel.make`. The example here is a simplified illustration of the page-save pipeline.

### Save mutation via runtime.fn

```ts
/**
 * Page save as an Effect mutation exposed via runtime.fn.
 *
 * @example
 * ```ts
 * import { Atom } from "effect/unstable/reactivity"
 * import { Reactivity } from "effect/unstable/reactivity"
 * import { Effect } from "effect"
 *
 * const savePage = runtime.fn(
 *   (page: PageSaveInput) =>
 *     Effect.gen(function*() {
 *       const graph = yield* KnowledgeGraph
 *       const reactivity = yield* Reactivity
 *       return yield* reactivity.mutation(
 *         ["graph:nodes", "graph:edges"],
 *         graph.savePage(page),
 *       )
 *     }),
 * )
 * ```
 *
 * @category mutations
 * @since 0.0.0
 */
```

### Provenance

Page-save events carry `actor: "user:local"` and `source: "vault"`. Provenance is `Option.none()` for user-authored content -- the actor field is sufficient attribution.

### Graph Visibility

After these events are written to the `EventLog`, the `Reactivity` service invalidates the registered keys (`graph:nodes`, `graph:edges`). Any atom subscribed to those keys automatically re-queries. If the graph view is open, Cytoscape reflects the changes in real-time: new document nodes appear, wiki_link edges form or dissolve.

---

## Progressive Editor Port Strategy from beep-effect4

The beep-effect4 editor has 54 plugins and 30 node types. Porting everything at once would be high-risk and block delivery. Instead, port in phases aligned with the knowledge workspace implementation phases.

### Phase 2a: Core (ships with Phase 2)

| Plugin / Node | Purpose |
|---------------|---------|
| `WikiLinkNode` | **New** -- the core deliverable of this spec |
| `WikiLinkTypeaheadPlugin` | **New** -- typeahead for `[[` links |
| `BacklinkDisplayPlugin` | **New** -- in-editor backlinks pane |
| `RichTextPlugin` | Already present in current surface |
| `HistoryPlugin` | Already present in current surface |
| `MarkdownShortcutPlugin` | Port from beep-effect4 -- enables `#`, `>`, `-`, `1.` shortcuts |
| `ListPlugin` + `ListNode` | Port from beep-effect4 -- ordered and unordered lists |
| `LinkPlugin` + `AutoLinkPlugin` | Port from beep-effect4 -- standard URL links |
| Basic toolbar | Extend current `BlockTypeToolbar` with heading levels, lists, links |

This set is independently shippable. A user can create pages, write rich text, insert wiki_links, and see backlinks.

### Phase 2b: Rich Content

| Plugin / Node | Purpose |
|---------------|---------|
| `ImagePlugin` + `ImageNode` | Inline and block images |
| `ExcalidrawPlugin` + `ExcalidrawNode` | Embedded Excalidraw diagrams |
| `CodeHighlightPlugin` + `CodeNode` | Syntax-highlighted code blocks |
| `CollapsiblePlugin` + `CollapsibleContainerNode` | Collapsible sections |
| `HorizontalRulePlugin` + `HorizontalRuleNode` | Horizontal dividers |
| `TablePlugin` + `TableNode` | Basic tables |
| `EquationPlugin` + `EquationNode` | LaTeX equation rendering |
| `DraggableBlockPlugin` | Drag-and-drop block reordering |

This set extends the editor from "functional note-taking" to "rich document authoring." Each plugin is optional and can be omitted if not needed.

### Phase 2c: Collaboration (future, aligns with Phase 4+)

| Plugin / Node | Purpose |
|---------------|---------|
| `CollaborationPlugin` | Real-time co-editing via Yjs provider |
| `CommentPlugin` + `MarkNode` | Inline comments and annotations |
| `AiAssistantPlugin` | AI-assisted writing (completion, rewriting, summarization) |
| `SpeechToTextPlugin` | Voice dictation |
| `FloatingTextFormatToolbarPlugin` | Selection-anchored formatting toolbar |

This set is out of scope for the current knowledge workspace spec. Noted here so the architecture does not preclude it.

### Port Guidelines

- Each ported plugin must be registered in the `editorNodes` array and mounted as a child of the `LexicalComposer`.
- Ported plugins must not carry beep-effect4 dependencies (Liveblocks, Next.js router, etc.). Strip framework-specific bindings and rewire to the beep-effect service layer.
- Test each plugin in isolation before composing. The beep-effect4 codebase has per-plugin test fixtures that can be adapted.

---

## Markdown Serialization for WikiLinkNode

wiki_links must round-trip through markdown. This is required because vault pages are persisted as `.md` files with YAML frontmatter.

### Export

`WikiLinkNode` serializes to markdown as:

- Standard page link: `[[target-slug]]` or `[[target-slug|Display Text]]` (pipe syntax when display text differs from slug)
- Code entity link: `[[code:SymbolName]]` or `[[code:SymbolName|Display Text]]`

### Import

On markdown import, a regex matches `[[...]]` patterns and creates `WikiLinkNode` instances:

```
/\[\[(?:(code):)?([^\]|]+)(?:\|([^\]]+))?\]\]/g
```

Capture groups:
1. Optional `code` prefix (for code entity links)
2. Target slug or symbol name
3. Optional display text (after `|`)

### MarkdownTransformer

Add a custom `MarkdownTransformer` to the transformer array, following beep-effect4's `PLAYGROUND_TRANSFORMERS` pattern:

```ts
const WIKI_LINK_TRANSFORMER: TextMatchTransformer = {
  type: "text-match",
  importRegExp: /\[\[(?:(code):)?([^\]|]+)(?:\|([^\]]+))?\]\]/,
  regExpEnd: /\]\]/,
  replace: (textNode, match) => {
    const prefix = match[1]
    const slug = match[2]
    const display = match[3] ?? slug
    const wikiLinkNode = $createWikiLinkNode(
      prefix ? `${prefix}:${slug}` : slug,
      display,
      false, // resolved status determined after insertion
    )
    textNode.replace(wikiLinkNode)
  },
  export: (node) => {
    if (!$isWikiLinkNode(node)) return null
    const slug = node.__targetSlug
    const display = node.__displayText
    return slug === display ? `[[${slug}]]` : `[[${slug}|${display}]]`
  },
}
```

This transformer is added to the array passed to `MarkdownShortcutPlugin` and used by the vault persistence layer during save/load.

### Resolution After Import with Schema Validation

When a markdown file is loaded and `WikiLinkNode` instances are created via the import regex, the `resolved` field defaults to `false`. A post-import pass queries the vault page index to resolve each link and update `resolved` to `true` where the target exists. This avoids blocking markdown import on async resolution.

```ts
/**
 * Post-import link resolution using schema-validated lookup.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Effect } from "effect"
 *
 * const resolveLinks = (links: ReadonlyArray<string>) =>
 *   Effect.gen(function*() {
 *     const graph = yield* KnowledgeGraph
 *     const resolved = yield* graph.resolvePageSlugs(links)
 *     return S.decodeUnknownSync(
 *       S.Array(S.Struct({
 *         slug: S.NonEmptyTrimmedString,
 *         exists: S.Boolean,
 *       }))
 *     )(resolved)
 *   })
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
```

---

## Integration Points Summary

| Component | Integrates With | Mechanism |
|-----------|----------------|-----------|
| `WikiLinkNode` | `EditorSurface.tsx` | Registered in `editorNodes` array |
| `WikiLinkTypeaheadPlugin` | `PagesGroup.searchPages` | RPC call on keystroke |
| `WikiLinkTypeaheadPlugin` | `RepoSymbolStore.searchSymbols` | RPC call for `[[code:...]]` (Phase 3) |
| `BacklinkDisplayPlugin` | `EditorPageResource.backlinks` | Read on page load |
| Page save flow | `EventLog.write` via `KnowledgeGraph` facade | Emit graph events on save |
| Page save flow | `extractBlockLinks` | Parse `[[...]]` from markdown |
| Markdown serialization | Vault `.md` files | Custom `MarkdownTransformer` |
| Hover card | `@beep/ui` `HoverCard` | Decorator component renders hover |
| Typeahead dropdown | `@beep/ui` `Command` (cmdk) | Typeahead UI component |
| Graph navigation | Cytoscape canvas | Ctrl+click focuses node in graph |
| Link resolution | `KnowledgeGraph.resolvePageSlugs` | Schema-validated slug lookup |
| Page entity | `Model.Class` | Multi-variant schema for persistence |
