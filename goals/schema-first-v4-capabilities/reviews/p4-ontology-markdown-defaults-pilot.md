# P4 Ontology Markdown Defaults Pilot

Date: 2026-06-08

## Completed

- Moved the ontology Markdown projection `linkMode` default from
  `normalizeOptions(...)` fallback logic into
  `OntologyMarkdownProjectionOptions` with `S.withConstructorDefault(...)`.
- Changed the projection helper input type to the schema class constructor input
  so callers can still pass either no options or `{}` while the decoded
  projection options carry the defaulted `linkMode`.
- Kept `OntologyMarkdownProjectionOptions` private to the module. The public
  package surface remains `projectMarkdown(...)` / `Ont.toMarkdown(...)`, so
  this pilot does not create a public API migration just to test a schema
  default.
- Strengthened the public ontology test to prove omitted options and empty
  options both render through the same portable-link path.

## Why This Matters

This is the first Wave 4 defaults remediation. It demonstrates the safe default
migration shape for an internal options object:

- the options schema owns the default;
- the helper constructs through the schema class instead of restating fallback
  literals in function code;
- the public call shape stays stable;
- tests assert behavior at the public boundary.

The Effect v4 source confirms this is a constructor default, not a decoding
default: `withConstructorDefault` applies during `make` / `makeEffect`, while
wire-decoding defaults require the `withDecodingDefault*` family. That
distinction matters for projection helpers where the input is application code,
not an external encoded payload boundary.

## Verification

```sh
cd packages/foundation/modeling/ontology && bun run check
cd packages/foundation/modeling/ontology && bun run test
cd packages/foundation/modeling/ontology && bun run lint
```
