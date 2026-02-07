# Specifications

Multi-phase specification library for complex features.

## Layout

- `specs/pending/`: In-progress, planned, or not-yet-finished specs
- `specs/completed/`: Fully finished specs
- `specs/archived/`: Deferred/paused specs (not complete, intentionally parked)
- `specs/_guide/`: Shared spec workflow docs/templates
- `specs/agents/`: Agent-specific specification artifacts

## Quick Start

| Action | Resource |
|--------|----------|
| Create new spec | `bun run repo-cli bootstrap-spec -n <name> -d "Description"` |
| Learn workflow | [`_guide/README.md`](_guide/README.md) |
| Handoff format | [`_guide/HANDOFF_STANDARDS.md`](_guide/HANDOFF_STANDARDS.md) |
| Pattern library | [`_guide/PATTERN_REGISTRY.md`](_guide/PATTERN_REGISTRY.md) |
| Status policy | [`SPEC_STATUS_POLICY.md`](SPEC_STATUS_POLICY.md) |

## Status Operations

```bash
# Check for pending specs that declare complete/archived status
bun run spec:status:check

# Move a spec between status folders
bun run spec:move -- <spec-name> pending|completed|archived
```

## Pending Specs

| Spec |
|------|
| [agent-config-optimization](completed/agent-config-optimization/) |
| [agent-context-optimization](completed/agent-context-optimization/) |
| [agent-effectiveness-audit](completed/agent-effectiveness-audit/) |
| [agent-infrastructure-rationalization](completed/agent-infrastructure-rationalization/) |
| [agents-md-audit](pending/agents-md-audit/) |
| [better-auth-client-wrappers](completed/better-auth-client-wrappers/) |
| [codex-claude-parity](pending/codex-claude-parity/) |
| [codex-parity-validation-s1](pending/codex-parity-validation-s1/) |
| [cursor-claude-parity](completed/cursor-claude-parity/) |
| [deprecated-code-cleanup](pending/deprecated-code-cleanup/) |
| [e2e-testkit-migration](pending/e2e-testkit-migration/) |
| [html-sanitize-schema-test-parity](pending/html-sanitize-schema-test-parity/) |
| [iam-client-entity-alignment](completed/iam-client-entity-alignment/) |
| [iam-client-schema-consistency-inventory](completed/iam-client-schema-consistency-inventory/) |
| [knowledge-architecture-foundation](completed/knowledge-architecture-foundation/) |
| [knowledge-batch-machine-refactor](pending/knowledge-batch-machine-refactor/) |
| [knowledge-code-quality-audit](completed/knowledge-code-quality-audit/) |
| [knowledge-entity-resolution-v2](completed/knowledge-entity-resolution-v2/) |
| [knowledge-graph-integration](completed/knowledge-graph-integration/) |
| [knowledge-graph-poc-demo](completed/knowledge-graph-poc-demo/) |
| [knowledge-graphrag-plus](completed/knowledge-graphrag-plus/) |
| [knowledge-ontology-comparison](pending/knowledge-ontology-comparison/) |
| [knowledge-rdf-foundation](completed/knowledge-rdf-foundation/) |
| [knowledge-reasoning-engine](completed/knowledge-reasoning-engine/) |
| [knowledge-repo-sqlschema-refactor](completed/knowledge-repo-sqlschema-refactor/) |
| [knowledge-sparql-integration](completed/knowledge-sparql-integration/) |
| [knowledge-workflow-durability](../apps/todox/src/liveblocks-ai-editor/models/knowledge-workflow-durability/) |
| [lexical-editor-ai-features](pending/lexical-editor-ai-features/) |
| [lexical-effect-alignment](pending/lexical-effect-alignment/) |
| [liveblocks-lexical-ai-integration](pending/liveblocks-lexical-ai-integration/) |
| [naming-conventions-refactor](pending/naming-conventions-refactor/) |
| [rls-implementation](completed/rls-implementation/) |
| [sanitize-html-schema](pending/sanitize-html-schema/) |
| [tagged-values-kit](completed/tagged-values-kit/) |
| [todox-design](pending/todox-design/) |
| [tsconfig-sync-completion](pending/tsconfig-sync-completion/) |
| [vitest-testkit-parity](pending/vitest-testkit-parity/) |
| [zero-email-port](archived/zero-email-port/) |

## Completed Specs

| Spec |
|------|
| [ai-friendliness-10-of-10](completed/ai-friendliness-10-of-10/) |
| [artifact-file-cleanup](completed/artifact-file-cleanup/) |
| [integration-architecture-migration](completed/integration-architecture-migration/) |
| [knowledge-effect-workflow-migration](completed/knowledge-effect-workflow-migration/) |
| [lexical-playground-port](completed/lexical-playground-port/) |
| [lexical-utils-effect-refactor](completed/lexical-utils-effect-refactor/) |
| [orgtable-auto-rls](completed/orgtable-auto-rls/) |
| [repo-cli-verify-commands](completed/repo-cli-verify-commands/) |
| [scripts-to-cli-migration](completed/scripts-to-cli-migration/) |
| [spec-creation-improvements](completed/spec-creation-improvements/) |

## Archived Specs

| Spec |
|------|
| [tsconfig-sync-command](archived/tsconfig-sync-command/) |
