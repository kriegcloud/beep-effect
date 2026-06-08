# P4 HttpHeaders Arbitrary Pilot

Date: 2026-06-08

## Completed

- Continued P4 Wave 3 with a third local schema package test:
  `packages/foundation/modeling/schema/test/HttpHeaders.test.ts`.
- Added property coverage for exported cross-origin secure-header option
  schemas:
  - `CrossOriginEmbedderPolicyOption`;
  - `CrossOriginOpenerPolicyOption`;
  - `CrossOriginResourcePolicyOption`.
- Each property derives option values with `S.toArbitrary(SourceOptionSchema)`
  and verifies decoding through the corresponding header schema preserves:
  - the fixed response header name;
  - `false` as a disabled/omitted header value;
  - string options as rendered header values.
- Kept exact fixtures for HSTS, Expect-CT, CSP, directive formatting, sparse
  options, and invalid-input behavior.
- Removed the stale `SFV4-arbitrary-tests` inventory entry for
  `HttpHeaders.test.ts`.

## Finding

The response header schemas are one-way transformations from encoded option
inputs to rendered header objects. The useful source-schema property therefore
starts at the option schemas, not at arbitrary rendered header outputs.

This keeps the property aligned with the public boundary: generated encoded
options flow through the real decoder and prove the same name/value semantics
that static fixtures previously covered only for one or two examples.

## Verification

```sh
cd packages/foundation/modeling/schema && bun run beep:test -- HttpHeaders.test.ts
bun run beep lint schema-first
```

The live schema-first lint baseline after this pilot is:

```text
[schema-first] live_entries=365
[schema-first] tracked_entries=365
[schema-first] missing_entries=0
[schema-first] stale_entries=0
[schema-first] sfv4_arbitrary_tests_advisories=24
```

## Next Steps

- Prefer source encoded/boundary schemas for one-way transformation properties.
- Keep exact fixtures for detailed formatting and invalid-input cases; the
  property should assert the reusable law, not replace compatibility examples.
- Consider CSP and other complex header options separately if they need custom
  arbitrary annotations or narrower source schemas.
