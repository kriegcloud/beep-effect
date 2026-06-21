# Reference: Design References & Prior Art

Read-only synthesis (2026-06-20) of external references and POCs that inform the
feature-flagged chat input. These live OUTSIDE the main repo (local machine).

## 1. lobehub clones — `~/YeeBois/research/chat_interface/lobehub/`

Repos: `chat-plugin-sdk/`, `chat-plugin-search-engine/`, `lobe-assets/`,
`lobe-chat-agents/`, `lobe-chat-plugins/`, `lobe-editor/` (the `@lobehub/editor`
package), `lobehub/` (full LobeChat Next.js app), `lobe-tts/`.

`@lobehub/editor` source: `lobe-editor/`. The chat-input demo
(`editor.lobehub.com/~demos/src-react-chat-input-demo-demos`) =
`lobe-editor/src/react/ChatInput/demos/index.tsx` (composes `ChatInput`,
`InputEditor`, `ActionToolbar`, `TypoToolbar`).

Architecture: fully Lexical-based. A `Kernel` class
(`src/editor-kernel/kernel.ts`) wraps a Lexical `LexicalEditor` and is the hub for
plugin/decorator/service/data-source registration:

- `registerPlugin(PluginClass, config?)` / `registerPlugins([...])` — class-based
  registry keyed by static `pluginName`. Plugins subclass `KernelPlugin extends
  EventEmitter` and track cleanup (`clears: Array<() => void>`).
- `registerService(IServiceID, service)` — typed branded service IDs; plugins
  fetch collaborators via `requireService`.
- `registerDataSource(DataSource)` — pluggable serialization (`"json"`, `"text"`,
  `"markdown"`).
- `registerDecorator(name, fn)`, `registerNodeTransform(...)`.

**Feature-flag pattern:** consumers compose by registering only the plugins they
want. The `<Editor>` React component takes `plugins?: EditorPlugin[]` (constructor
or `[Constructor, config]` tuples). A "chat subset" = pass fewer plugins. No
global toggle — plugin inclusion *is* the flag. `Editor.withProps(PluginClass,
extraProps)` packages a plugin+config pair.

Plugin inventory (`src/plugins/`): auto-complete, block, code, codeblock,
codemirror-block, common, content-blocks, file, hr, image, inode, link,
link-highlight, list, litexml, markdown, math, mention, slash, table, toolbar,
upload, virtual-block.

Chat-input feature locations:

- Shell `src/react/ChatInput/ChatInput.tsx` — resizable (`re-resizable`,
  `enable={{ top:true }}`); props `minHeight/maxHeight/defaultHeight/height/
  resize/showResizeHandle/fullscreen/onSizeChange`; slots `header/children/footer/
  slashMenuRef`.
- Action bar `src/react/ChatInputActionBar/` + `ChatInputActions/` — left/right
  layout; items overflow into a `collapse` group; `divider`/`collapse`/
  `alwaysDisplay`/`wrapper` types.
- Send button `src/react/SendButton/` — `generating/onSend/onStop/shape/size` +
  dropdown menu; send vs stop vs dropdown states modeled explicitly.
- Format toolbar `demos/TypoToolbar.tsx` — bold/italic/underline/strike,
  bullet/number/check, blockquote, link, math, inline code, codeblock + language;
  reads `useEditorState(editor)` (e.g. `editorState.isBold`) and dispatches
  (`editorState.bold()`); hotkeys via `getHotkeyById(HotkeyEnum.Bold)`.
- Action toolbar `demos/ActionToolbar.tsx` — format toggle, web search, file
  attach, library, options, history, voice/mic, token-counter badge.
- Slash `src/plugins/slash/` via `<Editor slashOption>` — trigger char (default
  `/`), items array, fuzzy search (fuse.js), `renderComp` override,
  `getPopupContainer` / `slashMenuRef` portal target.
- Mentions `src/plugins/mention/` via `<Editor mentionOption>` — same
  items/renderComp/searchKeys/trigger pattern; `markdownWriter(mention)=>string`;
  `onSelect` → `INSERT_MENTION_COMMAND`; custom `MentionNode`.
- Upload `src/plugins/upload/` — `IUploadService.registerUpload(handler,
  priority)` (0/1/2); handlers `(file, from, range) => Promise<boolean>`;
  drag-drop wired through it.
- Enter behavior — `<Editor onPressEnter>`; plain Enter sends, modifier inserts
  newline.
- Headless — `kernel.initHeadlessEditor()` (`@lexical/headless`) for server-side
  serialization with the same plugin/data-source system.

## 2. effect-lexical-chat POC — `~/YeeBois/projects/effect-lexical-chat`

The closest prior art (Tauri + Vite/React + Bun sidecar, full Effect v4). Port
these patterns:

- `shared/lexical-schema.ts` — full Lexical node tree as `S.Class` hierarchies
  (`BaseNode`/`TextBase`/`ElementNode`, `S.tag(type)`), `S.suspend` for recursive
  `children`, `LexicalNode = S.Union([...]).pipe(S.toTaggedUnion("type"))`,
  `SerializedEditorState`, `EditorStateFromJson = S.fromJsonString(...)`,
  `editorStateToPlainText`. (The repo's `@beep/lexical-schema` already embodies
  this — do not duplicate.)
- `shared/assistant-schema.ts` — stratified block→inline model for Anthropic
  structured output; `blockToLexical`/`assistantContentToLexical` lifting codecs;
  per-block semantic validators kept on the decode codec (not the class) to avoid
  killing streams. (Owned downstream; reference only.)
- `src/atoms.ts` — `AtomRpc.Service`, `Atom.family(key => Atom.make(...))` for
  per-conversation thread/draft/scroll; `ChatClient.runtime.fn<Input>()()` for
  streaming with `Atom.Interrupt`, toast error propagation, reactivity
  invalidation; `Atom.kvs({ runtime, key, schema, defaultValue })` over
  `KeyValueStore.layerStorage(() => globalThis.localStorage)` for drafts.
- `src/components/Composer.tsx` — **`composerBindingsAtom =
  Atom.family((editor: LexicalEditor) => Atom.make(get => ...))`** — all imperative
  Lexical wiring lives in a reactive atom keyed by the editor;
  `get.addFinalizer(editor.registerCommand(...))` for cleanup;
  `get.subscribe(activeConversationAtom, ...)` restores drafts. **No `useEffect`.**
- `src/components/MessageView.tsx` — shared `messageNodes` list across composer +
  viewer for clean round-trips.

Deployed instance is a live behavioral/visual reference; aligns with the
trustgraph green-workbench theme.

## 3. Lexical playground — `~/YeeBois/dev/text_editor_ui/lexical/packages/lexical-playground`

The full plugin superset (`src/plugins/`). Chat-input-relevant subset:
`MarkdownShortcutsExtension`, `ComponentPickerPlugin` (slash),
`MentionsExtension`, `ImagesExtension`, `DragDropPasteExtension`,
`EquationsExtension`, `CodeHighlightExtension`, `AutoLinkExtension`,
`EmojiPickerPlugin`, `SpeechToTextPlugin`, `FloatingTextFormatToolbarPlugin`,
`MaxLengthPlugin`, `TabFocusExtension`. Document-editor tail (out of scope):
Tables, Excalidraw, Figma, Twitter, Pages, Layout, Collapsible, Review,
DraggableBlock, Poll, PullQuote, TOC, Versions.

## 4. Product vision (prose-to-proof) — why a rich composer matters

`docs/product/prose-to-proof.md` + `docs/PROSE_TO_PROOF_VISION.md`: a local-first,
provenance-grounded knowledge workbench for a solo IP attorney — prose →
source-span-grounded candidate claims → attorney approval → permanent knowledge
graph where every fact links back to its justifying words. The chat surface is the
primary entry point: a rich composer (slash for knowledge-workflow actions later,
mentions for entities/prior-art, file attach for document drop, markdown
authoring) is the boundary where prose becomes structured input — not decorative.

## Reuse decisions

- Take from lobehub (as *reference*, not dependency): the Kernel plugin-registry
  shape for feature-flagged composition; `ChatInput`/`ActionBar`/`SendButton`
  layout; slash/mention `renderComp` + `getPopupContainer`; priority
  `IUploadService`.
- Take from effect-lexical-chat (port): `Atom.family` keyed by `LexicalEditor`;
  draft `Atom.kvs`; streaming `runtime.fn` with interrupt + toast.
- Foundation owns the mechanism; product slash items + mention sources are
  injected by the app. **No `@lobehub/editor` dependency.**
