# Lexical Schemas Spec

**Status: PENDING** | **Complexity: High (46)**

> Replace `S.Unknown` in `@beep/documents-domain` Document model with proper Effect Schema validation for Lexical editor serialized state. Implement a hybrid approach: structural envelope schema at the domain layer + full discriminated union schemas at the application layer.

---

## Problem Statement

`packages/documents/domain/src/entities/document/document.model.ts` line 25 defines:

```typescript
contentRich: BS.FieldOptionOmittable(S.Unknown),
```

This means any JSON blob is accepted as valid document content. When a Lexical editor serializes its state via `editor.getEditorState().toJSON()`, the resulting `SerializedEditorState` has a well-defined recursive tree structure. No existing npm package, Zod schema, or Effect Schema exists for validating this structure.

---

## Research Findings

### Lexical Serialization Format (v0.40.0)

`SerializedEditorState` is a recursive tree:
```
{ root: SerializedRootNode }
  -> SerializedRootNode = SerializedElementNode
    -> children: SerializedLexicalNode[]  (recursive)
```

**Base type**: `SerializedLexicalNode = { type: string, version: number, $?: Record<string, unknown> }`

**Element nodes** (have children): `+ { children, direction, format, indent, textFormat?, textStyle? }`

**Text nodes**: `+ { text, format (bitmask), detail, mode, style }`

### Node Types in PlaygroundNodes.ts (~30 types)

| Category | Nodes |
|----------|-------|
| **Block** | HeadingNode, QuoteNode, CodeNode, ParagraphNode |
| **List** | ListNode, ListItemNode |
| **Table** | TableNode, TableRowNode, TableCellNode |
| **Inline** | LinkNode, AutoLinkNode, HashtagNode, MentionNode, EmojiNode |
| **Text** | CodeHighlightNode, KeywordNode |
| **Media** | ImageNode, ExcalidrawNode, TweetNode, YouTubeNode, FigmaNode |
| **Layout** | LayoutContainerNode, LayoutItemNode, CollapsibleContainerNode, CollapsibleContentNode, CollapsibleTitleNode |
| **Other** | EquationNode, PollNode, StickyNode, MarkNode, PageBreakNode, HorizontalRuleNode, DateTimeNode, OverflowNode, AutocompleteNode |

### Key Findings

- **No existing validation libraries**: No npm packages exist for Lexical serialization validation
- **Lexical recommends Effect**: Official NodeState docs list Effect alongside Zod/ArkType/Valibot
- **Lexical `parseEditorState` is unsafe**: No structural validation, crashes on unregistered node types
- **Payload CMS**: Uses TypeScript types only, delegates to `parseEditorState`
- **Community consensus**: Store as JSONB, validate at application boundary

---

## Approach: Hybrid (Domain Envelope + Application Union)

### Layer 1: Domain Envelope (packages/documents/domain)

A structural schema that validates the *shape* without knowing every node type:

```typescript
// Validates: { root: { type: "root", children: [...nodes], ... } }
// Each node: { type: string, version: number, children?: [...nodes] }
const SerializedEditorState = S.Struct({
  root: S.suspend(() => SerializedElementNode)
})
```

This replaces `S.Unknown` with a schema that guarantees the tree structure is valid, direction/format fields are correct types, and text nodes have valid format bitmasks.

### Layer 2: Discriminated Union (apps/todox/src/app/lexical/schema)

Full per-node-type validation using `S.Union` with discriminator on `type` field. Each registered node type gets its own schema with specific field validation.

### Layer 3: Server Validation (packages/documents/server)

Optional `@lexical/headless` round-trip validation for defense-in-depth.

---

## Success Criteria

### Phase 1: Domain Envelope Schema
- [ ] `contentRich` in Document model uses `SerializedEditorState` instead of `S.Unknown`
- [ ] Recursive tree validation via `S.suspend`
- [ ] Base node, element node, and text node schemas defined
- [ ] `bun run check --filter=@beep/documents-domain` passes
- [ ] `bun run check --filter=@beep/documents-tables` passes (downstream)

### Phase 2: Application Node Schemas
- [ ] All 30+ PlaygroundNodes have corresponding serialization schemas
- [ ] Discriminated union on `type` field for node dispatch
- [ ] Existing `SerializedImageNode` integrated into union
- [ ] `bun run check --filter=@beep/todox` passes
- [ ] Unit tests for schema encode/decode round-trips

### Phase 3: Integration & Server Validation
- [ ] Document model properly persists/loads Lexical content through full stack
- [ ] Optional headless Lexical validation service in documents-server
- [ ] `bun run test --filter=@beep/documents-domain` passes
- [ ] `bun run test --filter=@beep/todox` passes

---

## Phase Overview

| Phase | Focus | Estimated Sessions | Agent Count |
|-------|-------|--------------------|-------------|
| P1 | Domain envelope schema + Document model update | 1 | 2-3 |
| P2 | Application-layer discriminated union schemas | 1-2 | 3-4 |
| P3 | Integration testing + server validation | 1 | 2-3 |

---

## Phase Completion Protocol

A phase is **NOT complete** until ALL of the following are satisfied:

1. **All phase work items implemented and verified** (quality gates pass)
2. **REFLECTION_LOG.md updated** with phase learnings (what worked, what didn't, patterns discovered)
3. **`handoffs/HANDOFF_P[N+1].md` created** — full context document for the next phase
4. **`handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` created** — copy-paste prompt to start the next phase

Additionally, if reflection reveals learnings relevant to the next phase's tasks, those learnings MUST be incorporated into the next phase's handoff document under a "Learnings from Phase [N]" section. This ensures hard-won knowledge propagates forward rather than being lost between sessions.

**Example**: If Phase 1 discovers that `S.suspend` requires explicit type annotations to work with `S.Class`, this MUST appear in `HANDOFF_P2.md` since Phase 2 builds on those schemas.

---

## Execution Model: Swarm

**This spec MUST be executed using a swarm (team of agents).** The orchestrating instance should use `TeamCreate` to spawn parallel agents for independent work streams.

### Why Swarm?

- **Parallel independent work**: Domain envelope (packages/documents/domain) and application schemas (apps/todox) touch different packages with no blocking dependencies between them
- **High agent diversity**: 5+ specialized agents (effect-code-writer, test-writer, package-error-fixer) needed across phases
- **Cross-package scope**: Changes span 3 packages (documents-domain, documents-tables, todox) requiring isolated verification
- **Phase sizing**: Each phase has 5+ work items benefiting from parallel execution

### When NOT to Use Swarm

- If domain envelope and application schemas develop unexpected coupling (e.g., shared type imports), serialize their execution instead
- If quality gates reveal cascading errors, pause parallel work and fix in dependency order

See `handoffs/P1_ORCHESTRATOR_PROMPT.md` for the copy-paste prompt to start Phase 1.

---

## Quality Commands

```bash
bun run check --filter=@beep/documents-domain
bun run check --filter=@beep/documents-tables
bun run check --filter=@beep/todox
bun run test --filter=@beep/documents-domain
bun run test --filter=@beep/todox
bun run lint:fix --filter=@beep/documents-domain
bun run lint:fix --filter=@beep/todox
```

---

## Reference Files

| File | Purpose |
|------|---------|
| `packages/documents/domain/src/entities/document/document.model.ts` | Document model with `S.Unknown` to replace |
| `apps/todox/src/app/lexical/schema/schemas.ts` | Existing base schemas |
| `apps/todox/src/app/lexical/schema/nodes.schema.ts` | Existing node schemas (ImageNode) |
| `apps/todox/src/app/lexical/schema/errors.ts` | Existing tagged errors |
| `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts` | All registered node types |
| `packages/documents/domain/CLAUDE.md` | Domain package guardrails |
| `.claude/rules/effect-patterns.md` | Schema patterns |

---

## Complexity Calculation

```
Phase Count:       3 phases    x 2 = 6
Agent Diversity:   4 agents    x 3 = 12
Cross-Package:     3 packages  x 4 = 12
External Deps:     1 (lexical) x 3 = 3
Uncertainty:       2 (medium)  x 5 = 10
Research Required: 1 (done)    x 2 = 2
─────────────────────────────────────
Total Score:                      46 -> High Complexity
```

---

## Related Specs

- `specs/completed/lexical-playground-port/` - Ported Lexical playground to todox
- `specs/completed/lexical-utils-effect-refactor/` - Effect patterns for Lexical utils
