# Deep Research — Accessible, Feature-Flagged Lexical Chat Composer

Cited, adversarially-verified report (2026-06-20). Method: 5 search angles → 18
sources fetched → 85 claims → 25 verified (3-vote adversarial; 2/3 refutes kills)
→ 24 confirmed, 1 refuted → 13 after synthesis. Generated via the repo
`deep-research` workflow (100 agents).

## Executive summary

For a reusable, Effect-/schema-first Lexical chat composer the verified evidence
converges on a clear architecture:

- **UX/a11y:** model slash (`/`) and `@`-mention typeaheads as **WAI-ARIA
  comboboxes** — the editor textbox carries `role=combobox` + `aria-controls`, the
  popup is `role=listbox` with `role=option` items, **DOM focus stays in the
  editor** while the active option is tracked via **`aria-activedescendant`**
  (never rove DOM focus into options). Required keys: **Down/Up/Enter/Escape**.
  **IME safety:** gate Enter-to-send on the `compositionstart→update→end`
  lifecycle (or `KeyboardEvent.isComposing`).
- **Lexical already ships this exact mechanism:** `LexicalTypeaheadMenuPlugin` is
  the official trigger-character primitive for **both** slash and mentions;
  keyboard handling is delegated to the shared `LexicalMenu` (arrow cycling +
  Enter/Tab select); `useBasicTypeaheadTriggerMatch` is the canonical trigger
  wiring.
- **Architecture:** `@lexical/react`'s documented model is **component
  composition** — plugins are plain React components nested in `LexicalComposer`,
  enabled/disabled by mounting/unmounting, with custom nodes registered up front
  in `initialConfig.nodes`; commands/listeners registered inside `useEffect`
  returning the `registerCommand`/`registerListener` cleanup. This is sufficient
  for a subset-of-plugins composer. `@lobehub/editor` demonstrates a heavier
  kernel/plugin-registry + DI alternative (`registerPlugin` + `withProps`).
- **Recommendation:** keep the generic mechanism (`LexicalComposer` +
  `LexicalTypeaheadMenuPlugin` + a feature-flag config schema selecting which
  plugins/nodes mount) in the **foundation** package; inject product-specific
  option items via props/`options` arrays (the `withProps` idea, minus the
  kernel); use `@lexical/headless` (`createHeadlessEditor`) for DOM-free
  serialization. assistant-ui's Radix-style primitives (Thread/Message/Composer/
  ActionBar) are the reference for the surrounding chat surface.

The existing `packages/foundation/ui-system/editor/src/composer.tsx` already
implements the schema-first + component-composition base — these recommendations
**build on it, not replace it.**

## Verified findings

### A11y / typeahead

1. **Typeaheads are WAI-ARIA comboboxes** (high, 3-0). Editor input =
   `role=combobox` + `aria-controls`→popup; popup = `role=listbox`; items =
   `role=option`. DOM focus stays on the input; active option via
   `aria-activedescendant` set on the **textbox** (not the listbox). Sources:
   W3C APG combobox + listbox, sarahmhigley.com/writing/activedescendant, MDN.
2. **Required keyboard contract** (high, 3-0): Down/Up move+select, Enter accepts
   (closes popup, inserts value), Escape closes + returns focus. Home/End/Alt
   optional. `LexicalMenu` implements this out of the box (+ Tab-to-select). W3C APG.
3. **Enter-to-send must be IME-gated** (high, 3-0): suppress submit while a
   composition session is active; detect via `compositionstart→update→end` or
   `KeyboardEvent.isComposing`. Practically: in the Enter handler, early-return if
   `event.isComposing`. MDN composition events, W3C UI Events.

### Lexical mechanism

4. **`LexicalTypeaheadMenuPlugin` is the canonical primitive** for trigger-char
   typeaheads and underlies BOTH slash and mention (high, 3-0). Props expose a
   reusable, consumer-injected surface: `options` array (TOption), `triggerFn`,
   `onQueryChange`, `onSelectOption(option, textNode, closeMenu, matchingString)`,
   `menuRenderFn`, `onOpen/onClose`, `commandPriority` (default
   `COMMAND_PRIORITY_LOW`), `preselectFirstItem` (default true). **The `options`
   array is the app's injection point.** lexical.dev/docs/react/plugins + source.
5. **`useBasicTypeaheadTriggerMatch`** is the canonical single-char trigger helper
   (high, 2-1): builds a `TriggerFn` from char + minLength/maxLength + punctuation
   class + `allowWhitespace`, regex `(^|\s|\()([trigger]((?:[validChars]){0,max}))$`.
   Defaults `minLength=1, maxLength=75, allowWhitespace=false`. **Caveat:** for
   multi-word mentions (e.g. "Mr. Smith") the playground hand-rolls a custom
   `AtSignMentionsRegex` — supply a custom `triggerFn` when names contain
   spaces/punctuation. Source + API docs.
6. **Lexical delegates menu keyboard nav to `LexicalMenu`** (high, 3-0): the
   typeahead plugin registers zero KEY_* commands; `LexicalMenu` registers
   ARROW_DOWN/UP, ENTER, ESCAPE, TAB at `commandPriority`; arrows cycle
   `selectedIndex` with wraparound; Enter/Tab call
   `selectOptionAndCleanUp(options[selectedIndex])`; Enter guards Shift+Enter. A
   reusable composer gets the APG keyboard contract for free; register competing
   commands at higher priority if needed. facebook/lexical source.

### Architecture

7. **`@lexical/react` = component composition** (high, 3-0): `LexicalComposer`
   wraps APIs so editor + plugins compose as JSX children; plugins are plain React
   components using `useLexicalComposerContext` (no registry); a feature is
   enabled by mounting/unmounting its component. **Directly supports a
   configurable opt-in subset.** This is exactly what the current `composer.tsx`
   does. **Recommendation:** drive a feature-flag config schema that conditionally
   mounts plugin components — lowest-complexity path. lexical.dev getting-started/
   plugins/create_plugin + source.
8. **Custom-node plugins need nodes registered up front** in `initialConfig.nodes`
   (high, 2-1): a feature-flagged composer must pair each plugin flag with its
   node-dependency set and register the **union** of required nodes up front;
   dynamic per-plugin node registration can crash on paste/restore (maintainer
   zurfyx). The existing `nodes.ts`/`editorNodes` already does this statically.
   **Caveat:** the newer `@lexical/extension` API co-locates nodes with extensions
   and supports dynamic enable/disable via signals (cleaner modern alternative).
   lexical.dev + facebook/lexical discussions #2053, #2745.
9. **Register commands/listeners in `useEffect` returning the cleanup** (high,
   3-0): every `register*` returns its teardown; return it directly (deps
   `[editor, ...]`); `mergeRegister` combines multiple teardowns. The canonical
   leak-free pattern; required across enable/disable cycles. lexical.dev
   create_plugin/commands/listeners.
10. **`@lexical/headless` for DOM-free serialization** (high, 3-0):
    `createHeadlessEditor({ nodes, onError })` returns a real editor exposing
    `update()`, `registerNodeTransform()`, `registerUpdateListener()` — suitable
    for schema-first server-side encode/decode/validation. Already used in the
    repo (`editor/test/editor-nodes.test.ts`). **Caveat:** DOM helpers like
    `$generateHtmlFromNodes` still need a JSDOM `document`. **Recommendation:**
    keep serialization schema-first (`@beep/lexical-schema`
    `SerializedEditorState`) + use `createHeadlessEditor` for server-side
    validation. lexical.dev/docs/packages/lexical-headless + source.
11. **Kernel/plugin-registry alternative (lobe-editor)** (medium, mixed 3-0/2-1):
    a framework-agnostic kernel (plugin interface, DI service container, command/
    node systems, data sources) + React bindings; `registerPlugin(Constructor,
    config?)`; consumer enables a subset via a `plugins` array; per-plugin config
    injected via `Editor.withProps(Plugin, { ...config })` (returns a
    `[plugin, props]` tuple). **Assessment:** the kernel adds real complexity (DI,
    lifecycle), justified mainly for framework-agnostic reuse or runtime plugin
    management. **For an Effect-first React-only composer, prefer the lighter
    `@lexical/react` composition + feature-flag schema + props/options injection
    (the `withProps` idea, minus the kernel).** github.com/lobehub/lobe-editor.
12. **Chat-surface primitives = assistant-ui Radix-style** (high, 3-0):
    Thread/Message/Composer/ThreadList/ActionBar unstyled+accessible primitives the
    consumer composes and styles — reinforces "generic mechanism in foundation,
    product specifics injected by app" at the surface level. github.com/assistant-ui.
13. **Unified combobox grouping (Slack)** (medium, 2-1): the correct grouping is a
    single combobox/Select connecting input+list, not two sibling components.
    **Note:** the related justification "screen readers can only focus one
    component at a time" was **REFUTED 0-3** — do not cite it. slack.engineering.

## Refuted

- ❌ "Screen readers can only maintain focus on one component at a time" (0-3) —
  not the rationale for `aria-activedescendant`. (slack.engineering)

## Open questions (NOT answered by surviving verified claims — resolve in P1 from
the lobehub source + lexical-playground + the Chrome feature-map)

1. **Enter-to-send vs Shift/Cmd+Enter newline conventions** and send/stop button
   state machines (idle/typing/streaming/stop) — no surviving verified claims.
   (Decision is locked for us: plain-Enter-sends, configurable; but accessible
   name/role of the send-vs-stop toggle needs a design pass.)
2. **Drag-drop / paste file & image attachments** (Lexical `DRAG_DROP_PASTE`
   command, accepted MIME types, clipboard image extraction, decorator preview
   nodes, accessible upload/error states) — in scope, no verified claims. Resolve
   from lexical-playground `DragDropPasteExtension`/`ImagesExtension` + lobehub
   `upload`/`image`/`file` plugins (see `references/design-references.md`).
3. **Auto-grow textarea (min/max + resize handle), placeholder-only-when-empty +
   cursor alignment, live char/token counting** (incl. `aria-live` cadence) — no
   verified claims. The placeholder/cursor bug fix is part of this packet; resolve
   the rest from the lobehub `ChatInput` shell + playground.
4. **Adopt `@lexical/extension` (signal-based dynamic enable/disable) vs
   `LexicalComposer` + hand-rolled feature-flag mounting?** Worth evaluating as a
   cleaner foundation (stable since ~v0.36.1, Sep 2025), but only tangentially
   verified — treat as an evaluation item, not a committed direction.

## Caveats

- **Lexical evolves fast.** The classic `LexicalComposer` + `initialConfig.nodes`
  path (current `@beep/editor`) is fully supported and mainstream; the newer
  `@lexical/extension` API is a cleaner-but-newer alternative worth evaluating.
- **`aria-activedescendant` has real-world AT gaps** (mobile screen readers ignore
  it; VoiceOver/Safari + NVDA browse-vs-forms edge cases) — plan **manual AT
  testing**, don't assume the APG pattern is uniformly honored.
- Source-quality: the Slack claim is a single engineering blog; the lobe-editor
  kernel claim was split 2-1 and its "dual-architecture" framing conflates the
  plugin registry with the service container — treat the kernel as informative,
  not a verified recommendation.

## Primary sources (selected)

- Lexical: `lexical.dev/docs/react/plugins`, `/react/create_plugin`,
  `/getting-started/react`, `/packages/lexical-headless`, `/concepts/{commands,
  listeners,editor-state}`, `/extensions/intro`; `facebook/lexical`
  `LexicalTypeaheadMenuPlugin.tsx`, `shared/LexicalMenu.tsx`, `LexicalComposer.tsx`,
  discussions #2053/#2745.
- A11y: W3C WAI-ARIA APG combobox + listbox patterns; MDN composition events; W3C
  UI Events; sarahmhigley.com/writing/activedescendant.
- Reference apps: `github.com/lobehub/lobe-editor`, `github.com/assistant-ui/assistant-ui`,
  slack.engineering "How to fail at accessibility".

Stats: 5 angles · 18 sources · 85 claims → 25 verified → 24 confirmed / 1 killed →
13 synthesized.
