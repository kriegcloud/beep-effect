# Live Chrome Feature-Map — lobehub chat-input demo + references

Captured 2026-06-20 via claude-in-chrome against the **public** lobehub demo
`https://editor.lobehub.com/~demos/src-react-chat-input-demo-demos`. Behavioral
notes only for the deployed `effect-lexical-chat` and trustgraph workbench (no
internal-URL screenshots — public repo). Pairs with `references/design-references.md`
(source-level inventory) and the seed screenshots in `seed/assets/`.

## lobehub demo — observed states & transitions

**Default / empty-with-sample.** The composer sits at the bottom as a single
rich line: "This is a demo environment built with `@lobehub/editor`. Try typing in
some text with `different` formats." — rendering an inline **mention chip**
(`@lobehub/editor`), **bold**, and *italic* runs, proving inline marks + mention
nodes render inline. A right-hand control panel exposes `fullscreen`, `maxHeight`
(320), `minHeight` (32), `resize` (on), `showResizeHandle` — i.e. the composer is a
**resizable, min/max-bounded** container.

**Bottom action bar** (left→right, from the default state + the dark seed
screenshot `seed/assets/Lobehub_editor_chat_interface_experience.png`): format
toggle (`T`), web/globe, attach (paperclip), library/book, options (sliders),
mute/no-mic, mic, history (clock), then a **Send button with a dropdown chevron**
on the right. Send is a distinct control with send/stop/menu states.

**Formatting toolbar (TypoToolbar).** Toggled by the `T` action; the dark seed
screenshot shows the full bar: **Bold, Italic, Underline, Strikethrough**, bullet
list, numbered list, checklist, **blockquote**, **link**, **Σ math**, **inline
code**, **code block**. Each button reflects active state from the current
selection (e.g. bold pressed) and dispatches a format command.

**Slash menu (`/`).** Typing `/` on an empty line opens a command list anchored to
the composer: **Heading 1** (active) · **Heading 2** · **Heading 3** · **Hr** ·
**Table** … — each row = icon + label + a right-aligned **keyword/shortcut**
(`h1`, `h2`, `h3`, `hr`, `table`) used for fuzzy filtering. First item is
highlighted; arrow keys move the active item, Enter selects, Escape closes. This
is the **formatting/insert** command set — exactly the v1 slash scope (product/
knowledge commands are injected later via the same menu infra).

**Mention menu (`@`).** Typing `@` opens the same typeahead shape with a different
**data source** — here a persona/agent list (前端研发专家 / 中英文互译助手 /
学术写作增强专家), first item active. Confirms slash and mention share one menu
mechanism (`LexicalTypeaheadMenuPlugin`-style) differing only by trigger char +
item source + render. In our design the mention is **ephemeral** (serializes to
text/link), so the inserted node need not be a persisted schema node.

**Keyboard / send.** Per the source (`<Editor onPressEnter>`), plain **Enter
sends**; modifier (Shift/Cmd/Ctrl/Alt+Enter) inserts a newline — the convention we
adopt (configurable, default Enter-sends for chat).

## Mapping to our v1 decisions

| lobehub behavior | Our v1 |
| --- | --- |
| Resizable, min/max-height container | Yes (composer UX lane) |
| Fixed format toolbar (toggle) | Yes — fixed toolbar |
| `/` menu = formatting/insert items + keywords | Yes — formatting/insert only; infra for product cmds later |
| `@` menu = typeahead w/ swappable data source | Yes — ephemeral mention, app-injected source |
| Attach / drag-drop via upload service | Yes — capture+send on turn payload (no durable storage v1) |
| Send/stop/dropdown button states | Yes — send/stop states |
| Plain Enter sends, modifier = newline | Yes — configurable, default Enter |
| Math / mic / web-search / library | Out of v1 scope |

## Deployed references (behavioral notes only — no committed screenshots)

- **effect-lexical-chat** (deployed): the running version of
  `~/YeeBois/projects/effect-lexical-chat`. Confirms the Effect-Atom composer
  behavior (draft persistence, streaming turns, edit-as-branch) and aligns with
  the green-workbench theme. Primary behavioral reference for the composer's
  Atom-driven lifecycle (the source patterns are in `references/design-references.md`).
- **trustgraph workbench-ui** (deployed): the visual source of the green
  near-black dark theme + green radial-glow background. Palette captured in
  `palette.md` / `seed/palette.json` (no internal-URL screenshots committed).

## Live-capture note

Slash + mention menus were captured live and render as documented. The format
toolbar and action bar were below the demo's shorter viewport fold during this
pass; they are fully documented from the lobehub source and the dark seed
screenshot rather than re-captured. This is sufficient for P1 design.
