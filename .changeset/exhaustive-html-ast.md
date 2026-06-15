---
"@beep/html": minor
"@beep/identity": patch
---

Add `@beep/html`: a complete, schema-first Effect-Schema AST of the WHATWG HTML specification. Every element (113 conforming + 29 obsolete) is modeled as an `S.TaggedClass` whose `_tag` is its tag name, combined into the `HtmlNode` discriminated union via `S.toTaggedUnion("_tag")`. Generated from vendored, version-pinned W3C webref + WHATWG data via `scripts/generate.ts` (using `SchemaRepresentation.toCodeDocument`), with global/ARIA/event-handler attribute overlays and an `ELEMENT_META` table.

Register the `$HtmlId` identity composer in `@beep/identity` for the new package.
