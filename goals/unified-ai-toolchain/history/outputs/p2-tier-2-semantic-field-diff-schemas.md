# P2 Tier-2 Semantic-Field-Diff Schemas

## Status

Complete.

## Implementation

The package records the full V1 agent/domain matrix in `V1_SCHEMA_COVERAGE`.
Every cell across Claude Code, Codex, Grok Build, JetBrains AI Assistant, and
Junie has one of:

- `supported`
- `na`
- `unknown_schema`

Documentation-backed shared schemas include:

- `AgentInstructionDocument`
- `AgentSkillFrontmatter`
- `AgentCommandMetadata`
- `AgentPluginManifestMetadata`
- `UnknownNativeSchemaCell`

The package keeps the known closed-source gaps explicit:

- Grok Build native hook payload schema is `unknown_schema`
- Grok Build native plugin manifest schema is `unknown_schema`
- Grok-native MCP shape is `unknown_schema`
- JetBrains AI Assistant skills, hooks, and repo-committed plugins are `na`
- Junie hooks and plugin manifests are `na`
- Codex user-authored command files are `na`

## Evidence

- `bun run --cwd packages/tooling/library/ai-sync test`
  - asserts at least one `unknown_schema` cell
  - asserts at least one `na` cell
  - asserts declined transform evidence exists for unsupported unknown cells
- `bun run --cwd packages/tooling/library/ai-sync check`
  - typechecks all schema models and generated exports

## Notes

No local agent, IDE, npm package, or JetBrains plugin introspection was used to
invent undocumented native shapes. V1 preserves `unknown_schema` until upstream
docs or an explicit future introspection phase provides evidence.
