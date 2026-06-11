# P4 Repo Configs NextModels Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated
  `packages/tooling/policy-pack/repo-configs/test/NextModels.schema.test.ts`
  from the `SFV4-arbitrary-tests` advisory inventory.
- Added a property test deriving Next.js route predicate values from the source
  `RouteHas` schema with `S.toArbitrary(RouteHas)`.
- Decoded every generated predicate through the existing `decodeRouteHas`
  boundary and asserted the decoded value is preserved.
- Kept exact fixtures for public route config shapes, file-size suffix parsing,
  invalid discriminators, logging options, and Sass options.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 22 tracked files.

## Finding

This is a good low-risk test-only pilot because the existing fixtures still
cover representative Next.js config payloads, while the new property proves
every generated discriminator/payload combination accepted by `RouteHas` also
survives the production decode boundary. It demonstrates the intended migration
style: derive test data from existing source schemas instead of defining a
weaker test-only generator.

## Verification

```sh
cd packages/tooling/policy-pack/repo-configs && bun run beep:test -- NextModels.schema.test.ts
cd packages/tooling/policy-pack/repo-configs && bun run check
cd packages/tooling/policy-pack/repo-configs && bun run lint
bun run beep lint schema-first
```
