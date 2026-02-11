# Master Orchestration: Lexical Schemas Spec

**Status: PENDING** | **Complexity: High (46)**

This document provides the complete orchestration plan for replacing `S.Unknown` in the Document model with proper Effect Schema validation for Lexical editor serialized state.

---

## Approach Overview

Hybrid validation strategy with three layers:

1. **Domain Envelope** (packages/documents/domain): Structural tree validation without node type specifics
2. **Application Union** (apps/todox/src/app/lexical/schema/): Full discriminated union on node type field
3. **Server Validation** (packages/documents/server): Optional headless Lexical round-trip

---

## Phase Dependency Graph

```
P1: Domain Envelope + Document Model Update
├── WI-1: Create envelope schemas (SerializedLexicalNodeEnvelope, etc.)
├── WI-2: Update Document model contentRich field
├── WI-3: Export from domain barrel file
├── WI-4: Domain envelope tests
└── Quality gates (check + lint)

P2: Application-Layer Discriminated Union
├── WI-5: Create base node types (SerializedElementNode, SerializedTextNode)
├── WI-6: Create all node type schemas (30+ types)
├── WI-7: Create SerializedLexicalNodeUnion
├── WI-8: Application schema tests
└── Quality gates (check + lint)

P3: Integration + Server Validation
├── WI-9: Full-stack persistence/loading test
├── WI-10: Optional headless Lexical validation service
└── Quality gates (check + test)
```

### Phase Dependencies

- **P1 and P2 can partially overlap**: Domain envelope is independent of application schemas, but P2's discriminated union should reference domain concepts where beneficial
- **P3 depends on both P1 and P2**: Integration tests require both layers to be complete

---

## Agent Delegation Matrix

### Phase 1: Domain Envelope

| Agent | Type | Tasks | Parallelizable |
|-------|------|-------|----------------|
| domain-schemas | effect-code-writer | WI-1 (envelope schemas), WI-2 (model update), WI-3 (barrel export) | No (sequential) |
| domain-tests | test-writer | WI-4 (domain envelope tests) | After domain-schemas |
| verifier | package-error-fixer | Quality gates (check + lint) | After domain-tests |

**Execution Pattern**: Sequential within phase (schemas → tests → verification)

### Phase 2: Application Schemas

| Agent | Type | Tasks | Parallelizable |
|-------|------|-------|----------------|
| app-schemas | effect-code-writer | WI-5 (base types), WI-6 (node schemas), WI-7 (union) | No (sequential) |
| app-tests | test-writer | WI-8 (application tests) | After app-schemas |
| verifier | package-error-fixer | Quality gates (check + lint) | After app-tests |

**Execution Pattern**: Sequential within phase (schemas → tests → verification)

### Phase 3: Integration

| Agent | Type | Tasks | Parallelizable |
|-------|------|-------|----------------|
| integration-tests | test-writer | WI-9 (full-stack test) | No |
| server-validation | effect-code-writer | WI-10 (headless service) | After WI-9 |
| verifier | package-error-fixer | Quality gates (check + test) | After all work |

**Execution Pattern**: Sequential (integration test validates approach before adding server validation)

---

## Work Item Specifications

### WI-1: Domain Envelope Schemas

**File**: `packages/documents/domain/src/value-objects/SerializedEditorState.ts`

**Required Schemas**:
- `SerializedLexicalNodeEnvelope`: Base node (type, version, $)
- `SerializedTextNodeEnvelope`: Text node fields (text, format bitmask, detail, mode, style)
- `SerializedElementNodeEnvelope`: Element node fields (children, direction, format, indent, textFormat, textStyle)
- `SerializedRootNodeEnvelope`: Root node (element node with type="root")
- `SerializedEditorStateEnvelope`: Top-level (root field)

**Key Pattern**: Use `S.suspend(() => Schema)` for recursive children

**Critical Constraint**: MUST NOT import from `lexical` or `@lexical/*` packages

**Reference**: See `AGENT_PROMPTS.md` domain-schemas section for complete implementation pattern

### WI-2: Update Document Model

**File**: `packages/documents/domain/src/entities/document/document.model.ts`

**Change**: Line 25
```typescript
// Before
contentRich: BS.FieldOptionOmittable(S.Unknown),

// After
contentRich: BS.FieldOptionOmittable(SerializedEditorStateEnvelope),
```

**Import**: Add `import { SerializedEditorStateEnvelope } from "../../value-objects/SerializedEditorState.js";`

### WI-3: Barrel Export

**File**: `packages/documents/domain/src/value-objects/index.ts`

**Change**: Export all new schemas
```typescript
export * from "./SerializedEditorState.js";
```

### WI-4: Domain Envelope Tests

**File**: `packages/documents/domain/test/value-objects/SerializedEditorState.test.ts`

**Test Cases**:
- Valid Lexical JSON passes validation
- Missing root fails validation
- Invalid direction fails validation
- Invalid format fails validation
- Recursive children validation works
- Empty children array valid
- Text node format bitmask valid

**Reference**: See `AGENT_PROMPTS.md` domain-tests section for complete test implementations

### WI-5: Application Base Node Types

**File**: `apps/todox/src/app/lexical/schema/schemas.ts`

**Add**:
- `SerializedElementNode`: Extends `SerializedLexicalNode` with children, direction, format, indent, textFormat, textStyle
- `SerializedTextNode`: Extends `SerializedLexicalNode` with text, format bitmask, detail, mode, style

**Pattern**: Use `.extend` syntax matching `SerializedImageNode` pattern

### WI-6: Application Node Type Schemas

**File**: `apps/todox/src/app/lexical/schema/node-types.schema.ts` (NEW)

**Node Types to Implement** (30+):

**Block Elements** (extend SerializedElementNode):
- SerializedRootNode (type: "root")
- SerializedHeadingNode (type: "heading", tag: h1-h6)
- SerializedQuoteNode (type: "quote")
- SerializedCodeNode (type: "code", language: string | null | undefined)
- SerializedParagraphNode (type: "paragraph")

**List Elements** (extend SerializedElementNode):
- SerializedListNode (type: "list", listType, start, tag)
- SerializedListItemNode (type: "listitem", checked, value)

**Table Elements** (extend SerializedElementNode):
- SerializedTableNode (type: "table", colWidths, rowStriping)
- SerializedTableRowNode (type: "tablerow", height)
- SerializedTableCellNode (type: "tablecell", colSpan, rowSpan, headerState, width, backgroundColor)

**Inline Elements** (extend SerializedElementNode):
- SerializedLinkNode (type: "link", url, rel, target, title)
- SerializedAutoLinkNode (type: "autolink", extends LinkNode, isUnlinked)
- SerializedMarkNode (type: "mark", ids)

**Text Variations** (extend SerializedTextNode):
- SerializedCodeHighlightNode (type: "code-highlight", highlightType)
- SerializedTabNode (type: "tab")

**Leaf Nodes** (extend SerializedLexicalNode):
- SerializedLineBreakNode (type: "linebreak")
- SerializedHorizontalRuleNode (type: "horizontalrule")

**Media/Special** (varies):
- SerializedImageNode (already exists in nodes.schema.ts)
- Plus: ExcalidrawNode, TweetNode, YouTubeNode, FigmaNode, EquationNode, PollNode, StickyNode, PageBreakNode, DateTimeNode, OverflowNode, AutocompleteNode, LayoutContainerNode, LayoutItemNode, CollapsibleContainerNode, CollapsibleContentNode, CollapsibleTitleNode, HashtagNode, MentionNode, EmojiNode, KeywordNode

**Reference**: `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts` for complete type definitions

### WI-7: Discriminated Union

**File**: `apps/todox/src/app/lexical/schema/node-types.schema.ts`

**Create**: `SerializedLexicalNodeUnion` using `S.Union` with all node type schemas

**Pattern**:
```typescript
export const SerializedLexicalNodeUnion = S.Union(
  SerializedRootNode,
  SerializedHeadingNode,
  // ... all 30+ node types
).annotations({
  identifier: "SerializedLexicalNodeUnion",
  description: "Discriminated union of all Lexical node types",
});
```

**Update**: `SerializedEditorState` in `schemas.ts` to use `SerializedRootNode` instead of generic `SerializedLexicalNode` for root field

### WI-8: Application Schema Tests

**File**: `apps/todox/src/app/lexical/schema/test/node-types.schema.test.ts`

**Test Cases**:
- Encode/decode round-trips for each node type
- Discriminated union dispatches on type field
- Discriminated union rejects unknown type
- Edge cases (empty children, optional fields, null direction)
- Text format bitmask values

**Reference**: See `AGENT_PROMPTS.md` app-tests section for complete test implementations

### WI-9: Full-Stack Integration Test

**File**: `packages/documents/domain/test/entities/document/document-lexical-content.test.ts`

**Test**: Document model can persist and load Lexical content through full stack (encode → persist → load → decode)

**Success Criteria**: Round-trip validation passes for realistic Lexical content

### WI-10: Optional Server Validation Service

**File**: `packages/documents/server/src/services/LexicalValidationService.ts` (optional)

**Purpose**: Defense-in-depth using `@lexical/headless` to round-trip validate serialized state

**Status**: Defer to P3 based on P1/P2 learnings

---

## Context Budget Protocol

Per `specs/_guide/README.md` context budget guidelines:

### Token Budget by Memory Type

| Memory Type | Token Budget | Content |
|-------------|--------------|---------|
| **Working** | ≤2,000 | Current work items, success criteria, blocking issues |
| **Episodic** | ≤1,000 | Previous phase summaries, key decisions |
| **Semantic** | ≤500 | Tech stack (Effect Schema, Lexical v0.40.0, PascalCase constructors) |
| **Procedural** | Links only | `.claude/rules/effect-patterns.md`, `AGENT_PROMPTS.md` |
| **Total per handoff** | **≤4,000** | Well under degradation threshold |

### Content Placement Strategy

| Document Position | Priority | Content |
|-------------------|----------|---------|
| **First 25%** | Critical | Work item checklist, blocking issues, constraints |
| **Middle 50%** | Supporting | Phase summaries, schema patterns |
| **Last 25%** | Actionable | Verification commands, next steps, reference links |

### Compression Protocol

When handoff content exceeds budget:
1. **Working**: Split "must-have" vs "nice-to-have" (keep must-have)
2. **Episodic**: Compress with extractive summarization (preserve original meaning)
3. **Semantic**: Move to procedural links (reference existing docs)
4. **Procedural**: Convert inline examples to file references (link instead of inline)

---

## Recovery/Rollback Procedures

### Scenario 1: S.suspend Doesn't Work with S.Class

**Symptom**: Type errors when using `S.suspend` inside `S.Class` schema definition

**Rollback**: Use plain `S.Struct` instead of `S.Class` for envelope schemas

**Example**:
```typescript
// If S.Class fails
export const SerializedElementNodeEnvelope = S.Struct({
  type: S.String,
  version: S.Number,
  children: S.Array(S.suspend(() => SerializedLexicalNodeEnvelope)),
  // ... rest of fields
});

// Instead of
export class SerializedElementNodeEnvelope extends S.Class(...)({...}) {}
```

### Scenario 2: Discriminated Union on type Field Doesn't Work

**Symptom**: `S.Union` fails to discriminate on `type` field, causes ambiguous type errors

**Rollback**: Use `S.Union` with manual type guards instead of relying on automatic discrimination

**Example**:
```typescript
// Manual type guard
export const isHeadingNode = (node: SerializedLexicalNode): node is SerializedHeadingNode =>
  node.type === "heading";

// Use in application code
if (isHeadingNode(node)) {
  // TypeScript knows node is SerializedHeadingNode
}
```

### Scenario 3: Downstream Type Errors in documents-tables

**Symptom**: `bun run check --filter=@beep/documents-tables` fails after changing Document model contentRich field

**Investigation**: Check if Drizzle column type definitions are affected by schema change

**Rollback**: If Drizzle tables don't support Effect Schema types directly, may need transformation layer between domain model and persistence

**Example**:
```typescript
// If direct persistence fails, use encode/decode
const persistDocument = (doc: Document) =>
  Effect.gen(function* () {
    const encoded = yield* S.encode(Document)(doc);
    yield* db.insert(documentTable).values(encoded);
  });
```

### Scenario 4: 30+ Node Types Too Complex for Single Phase

**Symptom**: P2 work items exceed phase sizing constraints (7+ work items, 2+ sessions)

**Resolution**: Split P2 into sub-phases:
- **P2a**: Base types + core block elements (5 types)
- **P2b**: List + table elements (5 types)
- **P2c**: Inline + text variations (5 types)
- **P2d**: Media + special elements (remaining types)
- **P2e**: Discriminated union + integration

Each sub-phase creates handoff documents for the next sub-phase.

---

## Cross-Phase Dependencies

| Artifact | Created In | Consumed By | Purpose |
|----------|-----------|-------------|---------|
| SerializedEditorStateEnvelope | P1 (WI-1) | P2 (WI-5), P3 (WI-9) | Domain envelope schema |
| Updated Document model | P1 (WI-2) | P3 (WI-9) | Domain entity with typed contentRich |
| SerializedElementNode | P2 (WI-5) | P2 (WI-6) | Base type for element nodes |
| SerializedTextNode | P2 (WI-5) | P2 (WI-6) | Base type for text nodes |
| SerializedLexicalNodeUnion | P2 (WI-7) | P3 (WI-9, WI-10) | Full discriminated union |
| Domain envelope tests | P1 (WI-4) | P3 (regression) | Regression suite |
| Application schema tests | P2 (WI-8) | P3 (regression) | Regression suite |

### Artifact Handoff Protocol

When an artifact from Phase N is consumed in Phase N+1:
1. **Reference by absolute import path** (never relative paths)
2. **Include artifact location in handoff document** (file path + export name)
3. **Document artifact constraints** (e.g., "MUST NOT import from lexical package")
4. **Verify artifact exists before consuming** (run check command for producing package)

---

## Phase Completion Checklist Template

Each phase MUST complete ALL of the following before transitioning:

### Work Items
- [ ] All work items implemented per specification
- [ ] Code follows Effect patterns from `.claude/rules/effect-patterns.md`
- [ ] PascalCase constructors used (S.Struct, S.String, NOT s.struct, s.string)
- [ ] Namespace imports used (import * as S from "effect/Schema")

### Quality Gates
- [ ] `bun run check --filter=[PACKAGE]` passes for all affected packages
- [ ] `bun run test --filter=[PACKAGE]` passes for all affected packages
- [ ] `bun run lint:fix --filter=[PACKAGE]` passes for all affected packages

### Documentation
- [ ] `REFLECTION_LOG.md` updated with phase learnings
- [ ] Learnings section identifies: what worked, what didn't, patterns discovered
- [ ] Anti-patterns or gotchas documented for next phase

### Handoff
- [ ] `handoffs/HANDOFF_P[N+1].md` created (full context document)
- [ ] `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt)
- [ ] Context budget verified (≤4,000 tokens total)
- [ ] Critical learnings from phase [N] incorporated into HANDOFF_P[N+1].md

### Phase-Specific Criteria

**Phase 1**:
- [ ] Domain envelope schemas exist and export from barrel file
- [ ] Document model uses SerializedEditorStateEnvelope
- [ ] documents-tables package still type-checks (no downstream breakage)

**Phase 2**:
- [ ] All 30+ node types have schemas
- [ ] SerializedLexicalNodeUnion created with all types
- [ ] Existing SerializedImageNode integrated into union
- [ ] SerializedEditorState uses typed SerializedRootNode

**Phase 3**:
- [ ] Full-stack persistence test passes
- [ ] Optional headless validation service (if implemented)
- [ ] All regression tests pass

---

## Quality Commands Reference

### Type Checking
```bash
bun run check --filter=@beep/documents-domain
bun run check --filter=@beep/documents-tables
bun run check --filter=@beep/todox
```

### Testing
```bash
bun run test --filter=@beep/documents-domain
bun run test --filter=@beep/todox
```

### Linting
```bash
bun run lint:fix --filter=@beep/documents-domain
bun run lint:fix --filter=@beep/todox
```

### Combined Verification
```bash
# Run all quality gates for all affected packages
bun run check --filter=@beep/documents-domain && \
bun run check --filter=@beep/documents-tables && \
bun run check --filter=@beep/todox && \
bun run test --filter=@beep/documents-domain && \
bun run test --filter=@beep/todox && \
bun run lint:fix --filter=@beep/documents-domain && \
bun run lint:fix --filter=@beep/todox
```

---

## Reference Files

| File | Purpose | Phase |
|------|---------|-------|
| `packages/documents/domain/src/entities/document/document.model.ts` | Document model with S.Unknown to replace | P1 |
| `packages/documents/domain/src/value-objects/index.ts` | Barrel file for exports | P1 |
| `apps/todox/src/app/lexical/schema/schemas.ts` | Existing base schemas | P2 |
| `apps/todox/src/app/lexical/schema/nodes.schema.ts` | Existing SerializedImageNode pattern | P2 |
| `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts` | All registered node types | P2 |
| `.claude/rules/effect-patterns.md` | Effect Schema patterns, testing patterns | All |
| `.claude/rules/code-standards.md` | Style standards | All |
| `specs/pending/lexical-schemas/AGENT_PROMPTS.md` | Detailed agent prompts | All |
| `specs/pending/lexical-schemas/handoffs/HANDOFF_P1.md` | Phase 1 context document | P1 |

---

## Execution Model

**This spec MUST be executed using a swarm (team of agents).**

### Agent Spawning Protocol

Use `TeamCreate` to spawn agents for each work stream:

**Phase 1**:
1. Spawn `domain-schemas` agent with prompt from AGENT_PROMPTS.md
2. After domain-schemas completes, spawn `domain-tests` agent
3. After domain-tests completes, spawn `verifier` agent

**Phase 2**:
1. Spawn `app-schemas` agent with prompt from AGENT_PROMPTS.md
2. After app-schemas completes, spawn `app-tests` agent
3. After app-tests completes, spawn `verifier` agent

**Phase 3**:
1. Spawn `integration-tests` agent
2. Optionally spawn `server-validation` agent
3. After all work completes, spawn `verifier` agent

### Coordination Protocol

Orchestrator responsibilities:
- Spawn agents via TeamCreate
- Monitor agent progress
- Synthesize outputs
- Create handoff documents
- Update REFLECTION_LOG.md

Orchestrator MUST NOT:
- Directly implement schemas (delegate to effect-code-writer)
- Directly implement tests (delegate to test-writer)
- Directly fix errors (delegate to package-error-fixer)
- Read more than 3 files for quick context

---

## Success Criteria

Specification is complete when:

1. **All phases complete** with checklists verified
2. **All quality gates pass** for affected packages
3. **Document model** uses `SerializedEditorStateEnvelope` instead of `S.Unknown`
4. **Discriminated union** exists for all 30+ node types
5. **Tests pass** for both domain and application layers
6. **Integration test** validates full-stack persistence
7. **REFLECTION_LOG.md** contains learnings from all phases
8. **No S.Unknown** remains in Lexical-related schemas

---

## Related Documentation

- `specs/pending/lexical-schemas/README.md` - Spec overview
- `specs/pending/lexical-schemas/AGENT_PROMPTS.md` - Agent prompts
- `specs/pending/lexical-schemas/QUICK_START.md` - 5-minute getting started
- `specs/_guide/README.md` - Spec creation guide
- `specs/_guide/HANDOFF_STANDARDS.md` - Handoff requirements
- `.claude/rules/effect-patterns.md` - Effect patterns
- `.claude/rules/code-standards.md` - Code standards
- `documentation/patterns/database-patterns.md` - Verification cascading behavior
