# Reference: Implementation Surface

Read-only synthesis (2026-06-20) of the code this packet will change. Paths are
repo-relative to the repository root.

## 1. Desktop chat app — `apps/professional-desktop`

Key files:

- `src/main.tsx` — React entry. Mounts `AppThemeProvider` + `ProfessionalAtomProvider`
  then `App`. Imports `@beep/ui/styles/globals.css` and
  `{ AppThemeProvider, ThemeMode } from "@beep/ui/themes"`. **Hardcodes
  `defaultMode={ThemeMode.Enum.light}`** — no dark mode, no toggle.
- `src/App.tsx` — transport detection (IPC vs HTTP sidecar) → renders `<ChatApp />`.
- `src/chat/ui/ChatApp.tsx` — `Sidebar` + `Thread` + `Composer` in a `flex h-screen` shell.
- `src/chat/ui/Composer.tsx` — wraps `EditorComposer` from `@beep/editor/composer`.
- `src/chat/ui/Sidebar.tsx` — thread list + "New thread".
- `src/chat/ui/Thread.tsx`, `MessageView.tsx`, `StreamingBlocks.tsx` — timeline,
  read-only render via `EditorViewer`, in-flight streaming render.
- `src/runtime/ProfessionalAtomProvider.tsx`, `ProfessionalAtomRuntime.ts` —
  Effect Atom `RegistryProvider` (30s idle TTL) + `useAtomMount` bootstrap.

State is **Effect Atom** (`@effect/atom-react`), not React state. Key atoms from
`@beep/agents-client/Chat.atoms`: `selectedThreadAtom`, `threadsAtoms(workspaceId)`,
`threadTimelineAtoms(threadId)`, `draftAtoms(threadId)` (persisted unsent draft),
`editTargetAtom`, `runTurnAtom` (dispatches `SendTurnRequest` / `EditTurnRequest`),
`streamingTurnAtom`, `chatProtocolLayerAtom`, `reportDecodeFailureAtom`.

Composer flow: `EditorComposer.onSerializedChange` → mirror into a `useRef` and
`draftAtoms` via `editorStateToDocument`. Submit (**Ctrl+Enter only** today, or
"Send" button) → `editorStateToDocument(latest.current.value)` →
`runTurnAtom(SendTurnRequest.make({ threadId, content }))` (or `EditTurnRequest`).
Composer is remounted with a new `key` on `threadId`/`editTarget` change.

Theming today: app uses `@beep/ui` theme system but hardcoded to `light`; no
toggle. `useThemeMode()` (with `toggleMode`) exists in `@beep/ui/themes` and is
used in `oip-web` but not here. The `.dark` CSS vars are fully defined in
`globals.css`; dark works as soon as a toggle flips the class.

Composer gaps vs lobehub-style input: no plain-Enter-send, no slash, no mentions,
no attachments, no formatting toolbar, no char/token count, send button sits
outside the composer border.

## 2. UI system — `packages/foundation/ui-system/ui` (`@beep/ui`)

Two stacked libraries: **MUI** (`@mui/material/styles`, `CssBaseline`,
`useColorScheme`, `InitColorSchemeScript`) is the theme authority (emits CSS
vars); **Tailwind/shadcn** components consume those vars via `globals.css`.

`src/themes/`:

- `theme-provider.tsx` — `AppThemeProvider` (wraps `MuiThemeProvider` +
  `CssBaseline enableColorScheme`). Props: `defaultMode?: ThemeMode` (default
  `"system"`), `storageManager?` (pass `null` to disable persistence; used in
  Storybook), `theme?: Theme` (defaults to prebuilt `theme`). Also
  `AppThemeInitScript`.
- `ThemeMode` — schema literal `"light" | "dark" | "system"` (`.is.*`, `.Enum.*`).
- `ResolvedThemeMode` — `"light" | "dark"`. `resolveThemeMode(mode, systemMode)`.
- `useThemeMode()` → `{ mode, resolvedMode, setMode, toggleMode }` (over MUI
  `useColorScheme`). **Canonical toggle hook — exists, just unused in desktop.**
- `theme.ts` — `themeOptions` with `cssVariables: { colorSchemeSelector: "class" }`,
  `colorSchemes: colors`, `shape.borderRadius: 8`, components, typography, shadows.
  `createAppTheme(overrides) = createTheme(themeOptions, overrides)` (deep merge);
  `theme = createAppTheme()`.
- `colors.ts` — MUI light/dark `colorSchemes` (current default is achromatic).
- `styles/globals.css` — shadcn-style oklch tokens at `:root` (light) and `.dark`,
  mapped into Tailwind `@theme inline`. `@custom-variant dark (&:is(.dark *))`.

`OrbBackground` — `src/components/orb-background.tsx`. Props: `tone` (`"green"` |
emerald | teal | sky | violet | amber | rose; default green hue 138),
`intensity` (subtle | medium | vivid), `animated`. Builds radial gradients from
HSL; `mix-blend-screen` on dark. **This is the repo equivalent of trustgraph's
glow background — reuse it.**

App theming setup: import `globals.css` → wrap with `<AppThemeProvider
defaultMode=... theme=...>` → use `useThemeMode()` to toggle.

## 3. Editor — `@beep/editor` + `@beep/lexical-schema`

`@beep/editor` (`packages/foundation/ui-system/editor/src/`): `composer.tsx`
(`EditorComposer`), `viewer.tsx` (`EditorViewer`), `nodes.ts` (`editorNodes`),
`theme.ts` (re-exports `editorTheme`), `artifact-ref-node.tsx`,
`mermaid-code-decorator-plugin.tsx`, `mermaid-view.tsx`, `youtube-*.tsx`,
`index.ts`.

`EditorComposer` plugins wired today: `RichTextPlugin`, `HistoryPlugin`,
`ListPlugin`, `CheckListPlugin`, `LinkPlugin`, `MarkdownShortcutPlugin`
(`TRANSFORMERS`), `OnChangePlugin` (schema-decoded). **Missing:** slash /
`LexicalTypeaheadMenuPlugin`, mentions, toolbar, `AutoLinkPlugin`,
`DraggableBlockPlugin`, table plugin, `CodeHighlightPlugin`, attachment plugin.

**No feature-flag architecture.** `EditorComposerProps` = `{ className?,
initialState?, onSerializedChange?, placeholder? }`. Plugin list is hardcoded. To
add slash/toolbar/mentions, extend with opt-in feature flags or a plugin slot.

Stories: `stories/editor-composer.stories.tsx` (`Empty`, `WithInitialState`),
`stories/editor-viewer.stories.tsx` (`AssistantTurn`).

**Placeholder/cursor bug** — placeholder rendered by `ContentEditable` at
`packages/foundation/ui-system/ui/src/components/editor/editor-ui/content-editable.tsx`:
absolute `<div>` with `px-8 py-[18px]`. The desktop `Composer.tsx` passes
`className="relative block min-h-12 focus:outline-none"` (no top padding), so the
empty-editor cursor sits at `top:0` while the placeholder text is offset 18px down
→ cursor appears above the placeholder. Lexical hides the placeholder only when
non-empty (not on focus). Fix: match top padding on the contenteditable, or align
`placeholderClassName` to zero padding, or hide the placeholder on focus via an
update-listener plugin.

`@beep/lexical-schema` (`packages/foundation/modeling/lexical`) — pure schema, no
runtime `lexical`. Owns `SerializedEditorState`, `EditorStateFromJson`,
`LexicalNode` tagged union (text/paragraph/heading/quote/list/listitem/link/code/
table/.../artifact-ref/youtube), `documentToEditorState` / `editorStateToDocument`
codecs, `ARTIFACT_URI_PREFIX`, `nodeToPlainText`. Composer is "over the v1
vocabulary": only states passing `SerializedEditorState` are emitted/accepted.
**Mentions are ephemeral → do not add node types here.**

## Cross-cutting gaps for this packet

- Desktop: dark-mode toggle (infra ready), plain-Enter-send, slash, mentions,
  attachments, formatting toolbar, char count.
- `@beep/editor`: feature-flag config; slash/mention/toolbar/attachment infra;
  placeholder fix.
- `@beep/lexical-schema`: no changes (mentions ephemeral; attachments out-of-band).
