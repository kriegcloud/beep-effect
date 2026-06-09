# P4 RDF Class-Local Statics Pilot

Date: 2026-06-08

## Completed

- Added class-local derived decoders to RDF schema classes that already own the
  data contracts:
  - `NamedNode.decodeUnknownResult`;
  - `Literal.decodeUnknownResult`;
  - `SemanticSchemaMetadata.decodeUnknownResult`.
- Replaced private top-level decoder constants in RDF construction helpers with
  the class statics.
- Added RDF tests proving the static decoders produce the same schema class
  values used by the existing construction helpers.

## Why This Matters

This gives the packet a second concrete class-local helper example outside the
OIP app surface. Agents opening `@beep/rdf` schema classes can now discover the
canonical decoder on the class itself instead of re-creating
`S.decodeUnknownResult(...)` or hunting for nearby constants.

The change keeps the existing helper API intact. The migration only moves
schema-owned behavior closer to the schema class and gives future waves a
low-risk pattern for repeated decode, encode, arbitrary, and equivalence
plumbing.

## Verification

```sh
cd packages/foundation/modeling/rdf && bun run check
cd packages/foundation/modeling/rdf && bun run test
cd packages/foundation/modeling/rdf && bun run lint
bun run beep yeet verify --plan --json
```
