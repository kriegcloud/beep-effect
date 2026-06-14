# @beep/editor

React editor kit on Lexical (0.45 + `@lexical/react`) for schema-first rich
text: a read-only viewer and composer primitives over the
`@beep/lexical-schema` v1 vocabulary, reusing the `@beep/ui` editor substrate
(theme, content-editable).

## Surface

- `EditorViewer` — read-only renderer for a schema-decoded
  `SerializedEditorState` (the schema → viewer side of the rich-text
  pipeline).
- `EditorComposer` — editable surface wired with history, lists, check lists,
  links, and markdown shortcuts; `onSerializedChange` emits schema-decoded
  states (out-of-schema states are logged and skipped).
- `editorNodes` — node registration matching the schema v1 union, including
  the runtime `ArtifactRefNode` decorator. `CodeHighlightNode` is
  intentionally not registered so code blocks keep plain text/tab/linebreak
  children — exactly the wire profile the schema persists.
- `editorTheme` — re-export of the `@beep/ui` Lexical theme.
- `ArtifactRefNode` / `$createArtifactRefNode` / `$isArtifactRefNode` — the
  runtime artifact-ref block, pinned to the schema's encoded contract.

## Usage

```tsx
import { EditorViewer } from "@beep/editor";
import { documentToEditorState } from "@beep/lexical-schema";
import { Document, P, Text } from "@beep/md/Md.model";
import * as Effect from "effect/Effect";

const turn = Document.make({ children: [P.make({ children: [Text.make({ value: "Hello" })] })] });
const state = Effect.runSync(documentToEditorState(turn));

export const Message = () => <EditorViewer state={state} />;
```

Stories live in `stories/` and render through the `apps/storybook` host.

## Development

```bash
bun run check      # tsgo + test tsconfig
bun run test       # vitest (headless lexical round-trip)
bun run lint:fix   # biome
```

Unit tests stay outside `test/integration`; tests import package source
through `@beep/editor` or other `@beep/*` aliases. Use relative imports only
for local helpers, fixtures, and snapshots.

## License

MIT
