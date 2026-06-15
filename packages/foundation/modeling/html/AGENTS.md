# @beep/html Agent Guide

## Purpose & Fit
- Exhaustive, schema-first AST of the WHATWG HTML specification (effect/Schema).

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| `Html.model` | `HtmlNode`, `HtmlChildren`, one `TaggedClass` per element (`Div`, `Span`, `Input`, `Marquee`, …), `Fragment`, `Document`, category sub-unions (`Flow`, `Phrasing`, …) | GENERATED. `HtmlNode = S.Union([...]).pipe(S.toTaggedUnion("_tag"))`; `_tag` = tag name |
| `Html.nodes` | `Text`, `Comment`, `Doctype` | hand-authored leaf nodes (`#text`/`#comment`/`#doctype`) |
| `Html.attributes` | `GlobalAttributes`, value enums (`Dir`, `InputMode`, …) | hand-authored global-attribute overlay |
| `Html.meta` | `ELEMENT_META`, `HtmlElementMeta` | GENERATED metadata (interface, conformance, void/raw-text, categories) |

## Generation
- `Html.model.ts` / `Html.meta.ts` are GENERATED — edit `scripts/generate.ts`, then `bun run generate` (reads pinned `data/`; see `data/SOURCES.md`).
- Restricted-name element classes get an `Element` suffix (`<s>`→`SElement`, `<object>`→`ObjectElement`).

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/html` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { Div, HtmlNode, Img, Text } from "@beep/html"
import * as S from "effect/Schema"

const tree = Div.make({ id: "root", children: [Img.make({ src: "x.png" }), Text.make({ value: "hi" })] })
const decoded = S.decodeUnknownSync(HtmlNode)({ _tag: "span", children: [] })
```

## Verifications
- `bunx turbo run test --filter=@beep/html`
- `bunx turbo run test:integration --filter=@beep/html`
- `bunx turbo run lint --filter=@beep/html`
- `bunx turbo run check --filter=@beep/html`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
