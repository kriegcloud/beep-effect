# Vendored data sources

This package's HTML AST is **generated** (see `scripts/generate.ts`) from the
authoritative, machine-readable sources below. All files here are vendored,
version-pinned snapshots — the generator reads only these, never the network.

> Counts drift: W3C webref `ed` data regenerates every ~6h. Pin a commit, do not
> track `main` live. To refresh, re-run the download with a new pinned commit and
> re-run `bun run generate`.

## `webref/dfns-html.json`
- **Source:** `https://raw.githubusercontent.com/w3c/webref/<commit>/ed/dfns/html.json`
- **Pinned commit:** `99e9e5eccbfc924203bda66a2328eade5cc08e7b` (reffy-bot, 2026-06-15)
- **License:** MIT (W3C webref / reffy)
- **Drives:** element list (142, incl. obsolete), per-element attributes
  (`type:"element-attr"`, `for`-linked to owning elements), attribute value
  enumerations (`type:"attr-value"` / `"enum-value"`, incl. all 22 `input[type]`).
- **Conformance:** an element is treated as non-conforming (WHATWG §16.2) when its
  `href` resolves to `obsolete.html` (29 elements).

## `webref/elements-html.json`
- **Source:** `https://raw.githubusercontent.com/w3c/webref/<commit>/ed/elements/html.json`
- **Pinned commit:** `99e9e5eccbfc924203bda66a2328eade5cc08e7b` (2026-06-15)
- **License:** MIT
- **Drives:** element → DOM interface mapping (113 conforming elements). Obsolete
  element interfaces are supplied by a hand-authored override
  (`overrides/obsolete-interfaces.json`).

## `whatwg/content-model.json`
- **Source:** parsed once from the non-normative "List of elements" table at
  `https://html.spec.whatwg.org/multipage/indices.html`
- **Fetched:** 2026-06-15 (WHATWG Living Standard — no commit pin available)
- **License:** CC-BY-4.0 (WHATWG HTML Standard)
- **Drives:** content categories (advisory `Flow`/`Phrasing`/… sub-unions) and the
  content-model `children` keywords. NOTE: the index is non-normative and the exact
  permitted-children model is not cleanly machine-readable; categories here are
  advisory only. The serialization **void** set is a reviewed override, not derived
  from this file's `empty` content-model column.

See `NOTICE` for required attribution.
