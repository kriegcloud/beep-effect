# P4 Tooling Agent-Effectiveness Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/tooling/tool/cli/test/agent-effectiveness-command.test.ts`
  from the `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving report values from existing
  `@beep/repo-ai-metrics` source schemas:
  - `AgentEffectivenessDoctorReport`;
  - `AgentEffectivenessAnnotationCheckReport`;
  - `AgentEffectivenessPhoenixSyncResult`;
  - `AgentEffectivenessPromptBundle`.
- Proved generated values encode through `S.fromJsonString(...)`, decode back
  through the command-test decoders, and re-encode to the same JSON boundary.
- Kept exact CLI fixtures for offline Phoenix, annotation checks, prompt
  bundles, and dry-run sync behavior.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 8 tracked files.

## Review Notes

This pilot validates the same schema-owned JSON boundary used by the production
agent-effectiveness renderers in
`packages/tooling/library/ai-metrics/src/agent-effectiveness.ts`, where the
report serializers are implemented with
`S.encodeUnknownEffect(S.fromJsonString(...))`.

The generated law intentionally skips `AgentEffectivenessDatasetBundle` for this
first tooling slice. Its schema includes broad `S.Unknown` dataset payload
records, and the derived arbitrary can produce very large nested JSON. A future
source-schema arbitrary annotation can bound those payloads without weakening
the production schema or inventing a parallel test-only schema.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, schema arbitrary annotations, and using generated
data to exercise schema encode/decode laws.

## Verification

```sh
cd packages/tooling/tool/cli && bun run beep:test -- agent-effectiveness-command.test.ts
cd packages/tooling/tool/cli && bun run check
cd packages/tooling/tool/cli && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
