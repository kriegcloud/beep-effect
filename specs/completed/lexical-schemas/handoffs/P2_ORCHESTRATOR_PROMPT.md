# Phase 2 Orchestrator Prompt — Lexical Schemas: Integration & Server Validation

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the `lexical-schemas` spec. Phase 1 successfully created domain envelope schemas and application-layer discriminated union schemas (37 node types). Your job is to verify full-stack persistence and optionally add headless Lexical validation.

**Read the full handoff first**: `specs/pending/lexical-schemas/handoffs/HANDOFF_P2.md`

### Learnings from Phase 1 (MUST READ)

These gotchas will affect your work:
1. **Element format is polymorphic**: `S.Union(S.Literal("", "left", ...), S.Number)` — both string and number in serialized data
2. **Cascading type changes**: Schema updates propagate through tables, RPC, and server layers
3. **@beep/todox path alias**: Use relative imports within `apps/todox/src/` for Bun test compatibility
4. **JSONB column typing**: Drizzle columns need `.$type<Schema.Encoded>()` for type alignment

### Execution Model

This phase is smaller than Phase 1. You may use a swarm or execute sequentially depending on complexity.

#### Work Items

1. **"Full-stack persistence round-trip test"** — Integration test verifying editor state survives: serialize -> RPC encode -> DB insert -> DB select -> RPC decode. Focus on JSONB fidelity (null values, numeric formats, `$` NodeState, optional fields).

2. **"Optional headless Lexical validation service"** — Create `LexicalValidation` service in `packages/documents/server/` using `@lexical/headless` to parse serialized state. Register all PlaygroundNodes. Must be optional (not blocking document save).

3. **"Document create/update integration verification"** — Verify DocumentRepo insert/find works with typed `contentRich`. Test empty content (field is optional via `BS.FieldOptionOmittable`).

4. **"RPC error handling for invalid content"** — Verify malformed Lexical JSON returns a clear ParseError at RPC boundary, not a 500.

### Orchestrator Constraints

Follow the same constraints as Phase 1:
- Delegate implementation to agents (effect-code-writer, test-writer, package-error-fixer)
- Read AGENT_PROMPTS.md for prompt templates if needed
- Coordinate, don't implement

### Key Files

| File | Purpose |
|------|---------|
| `packages/documents/domain/src/value-objects/SerializedEditorState.ts` | Domain envelope schemas (from P1) |
| `packages/documents/domain/src/entities/document/document.model.ts` | Document model with typed contentRich |
| `packages/documents/domain/src/entities/document/document.rpc.ts` | RPC schemas (updated in P1) |
| `packages/documents/tables/src/tables/document.table.ts` | Drizzle table (typed in P1) |
| `packages/documents/server/src/` | Server repos and services |
| `apps/todox/src/app/lexical/schema/node-types.schema.ts` | 37 node type schemas |

### Verification

```bash
bun run check --filter=@beep/documents-server
bun run test --filter=@beep/documents-server
bun run test --filter=@beep/documents-domain
bun run test --filter=@beep/todox
```

### Phase Completion Protocol (MANDATORY)

1. All work items implemented and verified
2. `REFLECTION_LOG.md` updated with Phase 2 learnings
3. If Phase 3 work remains, create `HANDOFF_P3.md` and `P3_ORCHESTRATOR_PROMPT.md`
4. Learnings relevant to future phases incorporated into handoff

### Success Criteria

- [ ] Full-stack round-trip test passes (JSONB fidelity confirmed)
- [ ] Headless Lexical validation service created (optional layer)
- [ ] Document create/update works with typed contentRich
- [ ] Invalid content returns clear error at RPC boundary
- [ ] All quality gates pass (check, lint, test)
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
