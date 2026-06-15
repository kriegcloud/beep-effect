# Pandoc AST Fixture Provenance

These fixtures are committed wire-shape fixtures for `@beep/pandoc-ast`; normal
package tests must not require a local `pandoc` executable.

- `green-core.pandoc.json` mirrors the Pandoc JSON shape produced from a small
  Markdown-origin document that stays inside the v1 Md-core compatibility
  profile.
- `gap-docx-styles.pandoc.json` is a hand-minimized DOCX-origin stand-in that
  preserves the relevant Pandoc constructs seen in Word conversions: custom
  style `Div`/`Span` wrappers, notes, math, and tables.

When the later fixture pipeline goal lands, these fixtures should either be
replaced by generated fixtures with recorded command provenance or kept as
small invariant smoke fixtures beside generated samples.
