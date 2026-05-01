# @beep/schema Boundary Audit

This ledger supports the first-pass move of `@beep/schema` to
`packages/foundation/modeling/schema`.

## Decision

Move the package as `foundation/modeling` to preserve public imports and keep
schema-first domain modeling legal for shared/domain consumers. Do not split the
package during the topology migration unless a concrete quality failure blocks
the move.

## Allow

These surfaces are directly aligned with modeling:

- schema primitives and literal domains
- `LiteralKit`
- model helpers such as `Model` and `DomainModel`
- `TaggedErrorClass` and tagged error helpers
- `SchemaUtils`
- typed arrays
- text, path, URL, and validation schemas
- HTTP header/value schemas

## Defer

These surfaces are broad or capability-adjacent and should be revisited after
the package lands in foundation:

- codec modules such as JSONC, YAML, TOML, XML, CSV, and JSONL
- crypto/hash and blockchain-adjacent schemas
- SQL and sqlite helper modules
- CUID generation services
- DOM and person/location convenience schema groups

## Block

No blocking item was found for the topology move. The package already declares
its observed core workspace dependencies.

## Follow-Up

- Decide whether codec and SQL helper surfaces should remain in
  `foundation/modeling/schema` or move behind capability-oriented subpackages.
- Add package-level boundary enforcement once the new topology is stable.
