# P4 ACP Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/drivers/acp/test/agent.test.ts` and
  `packages/drivers/acp/test/protocol.test.ts` from the
  `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving JSON-RPC envelopes from the existing test
  schemas:
  - initialize responses;
  - session cancel notifications;
  - request-permission responses.
- Proved generated JSON-RPC values encode through `S.fromJsonString(...)`,
  decode back through the command-test decoders, and re-encode to the same JSON
  boundary.
- Kept exact in-memory stdio, protocol interruption, child process, and agent
  request/notification fixtures.
- Refreshed `standards/schema-first.inventory.jsonc`; the paired
  architecture-lab pilot brought live arbitrary-test advisories to 0 tracked
  files.

## Review Notes

The generated law intentionally avoids request schemas with
`headers: S.Array(S.Unknown)`. Existing exact fixtures cover those concrete
header arrays, while generated `S.Unknown` can include much broader data than
the JSON-RPC protocol actually sends in these tests. The notification and
response envelopes are the right bounded JSON-safe surface for this pilot.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, schema arbitrary annotations, and using generated
data to exercise schema encode/decode laws.

## Verification

```sh
cd packages/drivers/acp && bun run beep:test -- agent.test.ts protocol.test.ts
cd packages/drivers/acp && bun run check
cd packages/drivers/acp && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
