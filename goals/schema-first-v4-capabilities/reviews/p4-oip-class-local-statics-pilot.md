# P4 OIP Class-Local Statics Pilot

Date: 2026-06-08

## Completed

- Added class-local derived decoders to OIP schema classes that already owned
  the data contract:
  - `OipSiteContent.decodeUnknownResult`;
  - `OipSiteContent.decodeUnknownEffect`;
  - `ContactSubmission.decodeUnknownEffect`;
  - `ContactSubmissionFormPayload.decodeUnknownResult`;
  - `ContactSubmissionFormPayload.decodeUnknownEffect`.
- Preserved existing compatibility exports by delegating them to the class
  statics:
  - `decodeOipSiteContentResult`;
  - `decodeOipSiteContent`;
  - `decodeContactSubmission`.
- Updated the OIP web test suite to prove the class-local helpers and
  compatibility exports agree.

## Why This Matters

The static helper pattern keeps schema behavior colocated with the schema class.
When an agent opens a schema class, it can discover the canonical decoder
without searching for nearby helper constants or recreating `S.decodeUnknown*`
at each call site.

This is intentionally small. The pilot proves the preferred direction without
forcing all existing compatibility exports to disappear at once. Future waves
can migrate repeated encode, arbitrary, and equivalence helpers the same way
when the schema class is the obvious owner.

## Verification

```sh
cd apps/oip-web && bun run check
cd apps/oip-web && bun run test
cd apps/oip-web && bun run lint
bun run beep yeet verify --plan --json
```

