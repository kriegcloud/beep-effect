# Brief

<!--
Stage 3. The shaped pitch (Shape Up anatomy). Fat-marker fidelity: concrete
enough to evaluate and decompose, rough enough to leave design latitude to
the implementing goal packets. The exploration is shaped when the human says
this file matches the picture in their head.
-->

## Problem

The repo has a credible rich-text spine for chat/editor use:
`@beep/md <-> @beep/lexical-schema <-> @beep/editor`. That spine was not
designed to prove DOCX round-tripping.

Before building a document editor, a Tauri import/export surface, or
patent-specific document semantics, we need to know whether the current
portable AST can survive a DOCX/Pandoc interchange loop. The immediate problem
is not "make Word in Beep." It is "model the interchange AST, map it to the
current AST, and make every loss explicit."

## Appetite

One focused foundation goal packet.

The appetite is a pure, deterministic compatibility proof. It should not spend
implementation budget on UI, Tauri, binary distribution, live DOCX conversion,
or patent-profile semantics. Those become follow-ons after the matrix says
what is actually representable.

## Solution Sketch

Create a schema-first Pandoc JSON AST mirror as `@beep/pandoc-ast` under
`packages/foundation/modeling/pandoc-ast`.

The first implementation goal should expose pure adapters:

```text
generated-once Pandoc JSON fixture
  -> decode to schema-first PandocAst
  -> pandocToDocument
  -> @beep/md Document + PandocMappingIssue[]

@beep/md Document
  -> documentToPandoc
  -> PandocAst + PandocMappingIssue[]
```

The supported profile should cover the DOCX-core overlap with current
`@beep/md`: paragraphs, headings, inline text, strong/emphasis/delete/code,
links, lists, block quotes, fenced code, horizontal rules, and the document
envelope.

The gap profile should intentionally exercise constructs likely to matter for
Word/DOCX work but not yet cleanly represented in `@beep/md`: `custom-style`
Div/Span/Table attributes, tables, footnotes/endnotes, math, richer image
metadata, and other Pandoc nodes that appear in realistic DOCX imports.
Tables and custom styles are gap-only in the first goal: decode enough of them
to produce stable path-located issues, but do not map them losslessly to
`@beep/md`.

The proof should produce a compatibility report. That report is the decision
surface for future work:

- current `@beep/md` is enough for this construct
- current `@beep/md` can represent it only with deterministic degradation
- current `@beep/md` cannot represent it and needs a future AST decision

## Rabbit Holes

- Full Pandoc AST coverage is too broad for the first proof.
- Pandoc binary packaging is a driver/runtime problem, not a modeling problem.
- The generated-once fixture provenance and pinned Pandoc version must be
  captured when fixtures are created; routine tests should not require Pandoc
  to be installed.
- DOCX layout fidelity is not the same as document AST fidelity.
- `custom-style` is the likely semantic hook for own-export round-tripping, but
  current `@beep/md` may not preserve it.
- Tables, footnotes, math, comments, and tracked changes are each large enough
  to become their own follow-on if v1 tries to solve them fully.
- A richer document AST may be necessary, but this exploration should require
  evidence before creating it.

## No-Gos

- No patent semantics or USPTO profile in the first goal.
- No Word-like editor UI.
- No Tauri sidecar or bundled Pandoc binary in the first goal.
- No real DOCX import/export command in the first goal.
- No arbitrary OOXML parser.
- No tracked-changes/redline model.
- No full Pandoc AST mirror before DOCX-core proof.
- No lossless table or custom-style mapping in the first goal.
- No mutation of current `@beep/md` semantics unless the compatibility matrix
  proves a specific, reviewed need.
