# Phase 1 Orchestrator Prompt — Lexical Schemas

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing the `lexical-schemas` spec. Your job is to replace `S.Unknown` in the Document domain model with proper Effect Schema validation for Lexical editor serialized state.

**Read the full handoff first**: `specs/pending/lexical-schemas/handoffs/HANDOFF_P1.md`

### Execution Model: SWARM

You MUST use a swarm to execute this spec. Here is your coordination plan:

#### Step 1: Create Team

```
Use TeamCreate with team_name: "lexical-schemas"
```

#### Step 2: Create Tasks

Create these tasks using TaskCreate:

1. **"Create domain envelope schemas"** — Create `SerializedEditorStateEnvelope` and supporting schemas in `packages/documents/domain/src/value-objects/SerializedEditorState.ts`. These are structural-only schemas that validate tree shape without knowing node types. Use `S.suspend` for recursive children. MUST NOT import from `lexical`. Export from value-objects barrel.

2. **"Update Document model contentRich field"** — Change `packages/documents/domain/src/entities/document/document.model.ts` line 25 from `S.Unknown` to `SerializedEditorStateEnvelope`. Blocked by task 1.

3. **"Create application-layer node type schemas"** — In `apps/todox/src/app/lexical/schema/`, extend existing `SerializedLexicalNode` with `SerializedElementNode` (children, direction, format, indent) and `SerializedTextNode` (text, format bitmask, detail, mode, style). Then create schemas for all ~30 node types from PlaygroundNodes.ts. Create a discriminated union `SerializedLexicalNodeUnion` on the `type` field.

4. **"Write domain envelope tests"** — Create tests in `packages/documents/domain/test/` validating that realistic Lexical JSON passes envelope validation and malformed structures fail. Use `@beep/testkit`. Blocked by task 1.

5. **"Write application schema tests"** — Create tests in `apps/todox/src/app/lexical/schema/` or appropriate test directory for encode/decode round-trips on each node type. Use `@beep/testkit`. Blocked by task 3.

6. **"Run verification gates"** — Run `bun run check` and `bun run lint:fix` for `@beep/documents-domain`, `@beep/documents-tables`, and `@beep/todox`. Blocked by tasks 2, 3.

#### Step 3: Spawn Agents

Spawn these teammates using the Task tool with `team_name: "lexical-schemas"`:

- **"domain-schemas"** (subagent_type: `effect-code-writer`) — Assign tasks 1, 2, 4. This agent creates the domain envelope schemas, updates the Document model, and writes domain tests.

- **"app-schemas"** (subagent_type: `effect-code-writer`) — Assign task 3, 5. This agent creates the application-layer discriminated union schemas and writes application tests. Can work in parallel with domain-schemas since they touch different packages.

- **"verifier"** (subagent_type: `package-error-fixer`) — Assign task 6. Runs after both schema agents complete. Fixes any type/lint errors.

#### Step 4: Coordinate

- Tasks 1 and 3 are independent — agents work in parallel
- Task 2 depends on task 1 (same agent handles both sequentially)
- Tasks 4, 5 depend on tasks 1, 3 respectively
- Task 6 depends on tasks 2, 3 (gates run last)

### Orchestrator Constraints

As orchestrator, you coordinate — you do NOT implement. Follow these rules strictly:

**You MUST NOT:**
- Read more than 3 files directly (delegate broad exploration to agents)
- Perform sequential Glob/Read/Grep searches (delegate to codebase-researcher)
- Write or edit source code files (delegate to effect-code-writer)
- Write test files (delegate to test-writer)
- Fix type or lint errors (delegate to package-error-fixer)

**You SHOULD:**
- Create team and tasks via TeamCreate/TaskCreate
- Spawn and coordinate agent teammates
- Synthesize agent outputs and monitor progress
- Create handoff documents (HANDOFF_P2.md, P2_ORCHESTRATOR_PROMPT.md)
- Update REFLECTION_LOG.md with phase learnings
- Read AGENT_PROMPTS.md (`specs/pending/lexical-schemas/AGENT_PROMPTS.md`) for detailed agent prompts

### Critical Patterns

**Domain envelope (NO lexical imports):**
```typescript
import * as S from "effect/Schema";

const SerializedLexicalNodeEnvelope: S.Schema<...> = S.Struct({
  type: S.String,
  version: S.Number,
}).pipe(S.extend(S.Struct({
  // Optional NodeState
  state: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { as: "Option" })
    .pipe(S.fromKey("$")),
})));

// Element node adds recursive children
const SerializedElementNodeEnvelope = S.Struct({
  ...SerializedLexicalNodeEnvelope.fields,
  children: S.Array(S.suspend(() => SerializedLexicalNodeEnvelope)),
  direction: S.NullOr(S.Literal("ltr", "rtl")),
  format: S.Union(S.Literal("", "left", "start", "center", "right", "end", "justify"), S.Number),
  indent: S.Number,
});
```

**Application discriminated union:**
```typescript
// Each node type discriminated by `type` field
const SerializedHeadingNode = SerializedElementNode.extend(...)({
  type: S.Literal("heading"),
  tag: S.Literal("h1", "h2", "h3", "h4", "h5", "h6"),
});
```

**Testing with @beep/testkit:**
```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";

effect("validates valid editor state", () =>
  Effect.gen(function* () {
    const valid = { root: { type: "root", version: 1, children: [], direction: null, format: "", indent: 0 } };
    const result = yield* S.decodeUnknown(SerializedEditorStateEnvelope)(valid);
    strictEqual(result.root.type, "root");
  })
);
```

### Reference Files

- `specs/pending/lexical-schemas/handoffs/HANDOFF_P1.md` — Full context with type reference
- `specs/pending/lexical-schemas/README.md` — Spec overview
- `packages/documents/domain/src/entities/document/document.model.ts` — Target file
- `apps/todox/src/app/lexical/schema/schemas.ts` — Existing base schemas
- `apps/todox/src/app/lexical/schema/nodes.schema.ts` — Existing node pattern
- `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts` — All node types
- `.claude/rules/effect-patterns.md` — Required patterns

### Verification

After all agents complete:
```bash
bun run check --filter=@beep/documents-domain
bun run check --filter=@beep/documents-tables
bun run check --filter=@beep/todox
bun run lint:fix --filter=@beep/documents-domain
bun run lint:fix --filter=@beep/todox
```

### Phase Completion Protocol (MANDATORY)

A phase is **NOT complete** until ALL of the following are done:

1. All success criteria below are met
2. `REFLECTION_LOG.md` is updated with Phase 1 learnings (what worked, what didn't, patterns discovered, gotchas)
3. `handoffs/HANDOFF_P2.md` is created with full context for Phase 2
4. `handoffs/P2_ORCHESTRATOR_PROMPT.md` is created as a copy-paste prompt to start Phase 2

If reflection reveals learnings relevant to Phase 2 tasks (e.g., `S.suspend` behavior, discriminated union gotchas, recursive schema patterns), those learnings MUST be incorporated into `HANDOFF_P2.md` under a "Learnings from Phase 1" section.

### Success Criteria

- [ ] `contentRich` uses `SerializedEditorStateEnvelope` instead of `S.Unknown`
- [ ] Domain schemas validate recursive tree structure without lexical dependency
- [ ] Application schemas cover all 30+ PlaygroundNodes node types
- [ ] Discriminated union dispatches on `type` field
- [ ] All quality gates pass (check, lint)
- [ ] Tests exist for both domain and application schemas
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created with full context for next phase
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created as copy-paste prompt for next phase
- [ ] Learnings relevant to Phase 2 incorporated into `HANDOFF_P2.md`
