# @beep/lexical-schema

Schema-first models of Lexical's serialized editor state with Md ↔ Lexical
codecs over the canonical `@beep/md` AST.

- **Zero runtime `lexical` imports.** The schemas import only `effect` (plus
  beep foundation packages); `lexical` and `@lexical/*` are devDependencies
  used type-only by the dtslint conformance tests (`dtslint/Lexical.tst.ts`).
- **The schema owns the persisted contract.** Lexical ships minor-breaking
  releases monthly; persisted state must decode through this package, never
  couple to a raw Lexical release's serialization.
- **Nullish wire values decode to `O.Option` at the schema boundary** —
  downstream logic matches Options instead of null-checking. The encoded side
  keeps the exact Lexical wire shape (round-trip fidelity is non-negotiable;
  see `test/Lexical.model.test.ts`).

## v1 node scope

md-core: `paragraph`, `heading`, `code`, `list`/`listitem`, `quote`, `link`,
`text`/`tab`/`linebreak` (+ inline marks via the text format bitmask), plus
the package-owned `artifact-ref` block. Mention and slash-command are composer
affordances, not persisted blocks. Tables, attachments, and proposal blocks
are named follow-ons.

## Lossiness profile (locked)

The codec profile was locked after running the Md ↔ Lexical lossiness check
(`test/Lexical.codec.test.ts`).

### Round-trips losslessly (Md → Lexical → Md is identity)

| Md | Lexical |
| --- | --- |
| `P` | `paragraph` |
| `H1`–`H6` | `heading` (`h1`–`h6`) |
| `Pre` (`value`, `language`) | `code` (text/tab/linebreak lines) |
| `Ul` / `Ol` | `list` (`bullet`/`ul`, `number`/`ol`) |
| `TaskList`/`TaskItem` | `list` (`check`) + `listitem.checked` |
| `BlockQuote` with a single `P` | `quote` |
| `Strong` / `Em` / `Del` / `Code` (inline) | text format bits 1 / 2 / 4 / 16 |
| `A` | `link` |
| `Br` | `linebreak` |
| `P` wrapping one `A` with an `artifact://<id>` href | `artifact-ref` |

### Normalizations (Md → Lexical → Md converges; the second pass is identity)

- Inline mark nesting canonicalizes to `Strong > Em > Del` (outer → inner):
  the bitmask is orderless, so `Em(Strong(x))` round-trips as `Strong(Em(x))`.
- `BlockQuote` with multiple blocks flattens to one linebreak-separated
  paragraph inside the quote.

### Dropped on Lexical → Md (no markdown equivalent)

- Element alignment (`format` token), `indent`, `direction`.
- Text format bits without an Md mark: underline (8), subscript (32),
  superscript (64), highlight (128), casing bits.
- Inline styles (`style`, `textStyle`), `textFormat`, `detail`, `mode`,
  NodeState (`$`).
- Nested lists flatten into the parent list level (Md list items hold inline
  content only).

### Degraded on Md → Lexical (documented, deterministic)

- `RawMarkdown` / `RawHtml` → plain text runs.
- `Img` → `link` (alt text as the link text, so the destination survives).
- `Hr` → a literal `---` paragraph.
- Bare `Li` outside a list → paragraph.

## Modules

- `Lexical.model` — vocabularies, node classes, the `LexicalNode` tagged
  union, the `SerializedEditorState` envelope, `EditorStateFromJson`, and
  plain-text projection.
- `Lexical.codec` — `documentToEditorState` / `blockToLexical` (Md → Lexical,
  validating `Effect`s) and `editorStateToDocument` / `nodeToBlocks`
  (Lexical → Md, pure).

## Usage

```ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { Document, P, Text } from "@beep/md/Md.model";
import { SerializedEditorState, documentToEditorState } from "@beep/lexical-schema";

const document = Document.make({ children: [P.make({ children: [Text.make({ value: "Hello" })] })] });
const state = Effect.runSync(documentToEditorState(document));
const wire = S.encodeSync(SerializedEditorState)(state); // exact Lexical wire shape
```

## Development

```bash
bun run check      # tsgo type check
bun run test       # vitest
bun run dtslint    # tstyche conformance vs lexical types
bun run lint:fix   # biome
```

Unit tests stay outside `test/integration`; tests and dtslint files import
package source through `@beep/lexical-schema` or other `@beep/*` aliases. Use
relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
