# HANDOFF P1: Schema + Compiler Contract

## Context Budget

Read first:
- `specs/pending/unified-ai-tooling/README.md`
- `specs/pending/unified-ai-tooling/outputs/preliminary-research.md`
- `specs/pending/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
- `specs/pending/unified-ai-tooling/outputs/comprehensive-review.md`
- `specs/pending/unified-ai-tooling/outputs/subtree-synthesis.md`
- `specs/pending/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`

Budget guidance:
- Do not design adapter implementation details yet.
- Focus on canonical schema, normalization, ownership metadata, and compile graph.

## Working Memory

### Phase Goal

Define canonical `.beep/config.yaml` schema and deterministic compiler contract (source model -> normalized model -> target artifacts).

### Deliverables

- `specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md`
- Updated `specs/pending/unified-ai-tooling/outputs/manifest.json` (P1 status)

### Success Criteria

1. Schema includes: instructions, commands, hooks, MCP servers, agents, skills, tool overrides.
2. Merge/precedence rules are explicit.
3. Managed ownership model is explicit:
   - default full-file rewrite
   - sidecar metadata contract for JSON targets
4. AGENTS generation/freshness model is defined for root + every workspace package.
5. Error taxonomy is explicit (schema, transform, IO, secret-resolution, unsupported mapping).
6. State/manifest contract is explicit (hashes, adapter versioning, orphan-cleanup inputs).
7. Adapter capability descriptors are defined at schema-contract level for downstream P2 mapping.
8. P1 output includes `Quality Gate Evidence` with required subsection schema and signoff rows.

### Blocking Issues

- None blocker-level.
- If JetBrains artifact parity needs extension fields, define under `tool_overrides.jetbrains.*` rather than expanding core schema types prematurely.

### Key Constraints

- Canonical namespace is `.beep/`.
- Project-local config only.
- No symlinks.
- Generated files committed (including `.codex/` and `.mcp.json`).
- Linux-only v1.
- One instruction source must support dual outputs (`AGENTS.md`, `CLAUDE.md`).
- Skills are first-class in canonical model.

### Implementation Order

1. Define top-level schema and required/optional keys.
2. Define normalization/defaulting and precedence rules.
3. Define AGENTS scope model (root + every workspace package).
4. Define compile graph and deterministic serialization rules.
5. Define state + sidecar metadata schema and drift/orphan-check contract.
6. Define adapter capability descriptor contract.
7. Define validation/check failure contracts.
8. Define mandatory P1 test checkpoints and TDD evidence contract.

## Verification Steps

```bash
# Validate manifest remains valid JSON
cat specs/pending/unified-ai-tooling/outputs/manifest.json | jq .

# P1 output must carry quality-gate evidence section
rg -n "^## Quality Gate Evidence" specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md

# P1 output must carry all required quality-gate subsections
rg -n "^### (Test Suites Executed|Fixture Sets Used|TDD Evidence|Pass/Fail Summary|Unresolved Risks|Review Signoff)$" specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md

# P1 output must include required review signoff rows
rg -n "Design/Architecture|Security/Secrets" specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md
```

## Known Issues and Gotchas

- Avoid implicit global overlays; v1 is project-only.
- Keep canonical schema portable and stable; isolate vendor-only fields under overrides.
- Do not assume hook/CI rollout now; only define command contracts needed for eventual integration.
- Do not allow implicit lossy drops; canonical contract must leave room for explicit warning/error mapping.
