# P5 Orchestrator Prompt

Copy and paste this entire prompt to start a new session for Phase 5.

---

## Context

You are executing **Phase 5 (Examples & Validation)** of the `ai-friendliness-10-of-10` spec.

**Spec Location**: `specs/ai-friendliness-10-of-10/`
**Handoff Document**: `specs/ai-friendliness-10-of-10/handoffs/HANDOFF_P5.md`

## Previous Phases Complete

| Phase | Output | Status |
|-------|--------|--------|
| P0 | Discovery & baseline | ✅ |
| P1 | 62 ai-context.md files | ✅ |
| P2 | 63 error catalog patterns | ✅ |
| P3 | 6 onboarding documents + skill | ✅ |
| P4 | 5 self-healing patterns | ✅ |

## Your Mission

Add worked examples to all abstract rules and validate the spec achieves 10/10 AI-friendliness.

## Deliverables

| Deliverable | File | Description |
|-------------|------|-------------|
| Code standards examples | `.claude/rules/code-standards.md` | Add TypeScript examples for formal notation |
| Meta-thinking examples | `.claude/rules/meta-thinking.md` | Add Effect code examples |
| Behavioral examples | `.claude/rules/behavioral.md` | Add critical thinking examples |
| General examples | `.claude/rules/general.md` | Add architecture boundary examples |
| Final validation | `specs/.../README.md` | Update completion status |
| Reflection entry | `specs/.../REFLECTION_LOG.md` | Document P5 learnings |

## Critical Principle

**Keep examples concise** - Each example should be ≤10 lines, showing clear before/after or concrete application.

## Rules Needing Examples

### Priority 1: `code-standards.md`

Formal notation patterns without examples:

```
nested-loops        → pipe(∘)
conditionals        → Match.typeTags(ADT) ∨ $match
domain-types        := Schema.TaggedStruct
imports             := ∀ X → import * as X from "effect/X"
{Date.now, random}  → {Clock, Random}
```

### Priority 2: `meta-thinking.md`

Effect equivalences without examples:

```
a |> f |> g |> h  ≡  pipe(a, f, g, h)
f ∘ g ∘ h         ≡  flow(f, g, h)
dual :: (self, that) ↔ (that)(self)
∥(a, b, c)        ≡  Effect.all([a, b, c], { concurrency: "unbounded" })
```

### Priority 3: `behavioral.md` & `general.md`

- Critical thinking patterns need concrete dialogue examples
- Architecture boundaries need valid/invalid import examples

## Execution Options

### Option A: 4 Parallel Agents (Recommended)

```
Agent 1: doc-writer → code-standards.md examples
Agent 2: doc-writer → meta-thinking.md examples
Agent 3: doc-writer → behavioral.md + general.md examples
Agent 4: spec-reviewer → validation checklist
```

### Option B: Sequential

Process each file one at a time, then validate.

## Example Format

Add examples directly below each formal pattern:

```markdown
## Style

```
nested-loops        → pipe(∘)
```

**Example:**
```typescript
// BEFORE: Nested loops
for (const user of users) {
  for (const order of user.orders) {
    total += order.amount;
  }
}

// AFTER: Effect pipe composition
const total = pipe(
  users,
  A.flatMap(u => u.orders),
  A.reduce(0, (acc, o) => acc + o.amount)
)
```
```

## Validation Checklist

After adding examples, verify:

- [ ] All formal notation patterns have examples
- [ ] Examples use namespace imports (`import * as X`)
- [ ] Examples use PascalCase Schema constructors
- [ ] Examples are ≤10 lines each
- [ ] No ambiguous patterns remain
- [ ] Final score components verified

## Success Criteria

| Metric | Target |
|--------|--------|
| Rules with examples | ≥95% |
| Ambiguous patterns | 0 |
| Final AI-friendliness score | 10/10 |

## Reference Files

```bash
# Read the full handoff
cat specs/ai-friendliness-10-of-10/handoffs/HANDOFF_P5.md

# Read the gap analysis from P0
cat specs/ai-friendliness-10-of-10/outputs/rules-without-examples.md

# Read rules to enhance
cat .claude/rules/code-standards.md
cat .claude/rules/meta-thinking.md
cat .claude/rules/behavioral.md
cat .claude/rules/general.md
```

## After Completion

1. Update `REFLECTION_LOG.md` with P5 entry
2. Update spec `README.md` with completion status
3. Verify all success criteria met
4. Spec is complete!

---

**Start by reading the handoff document, then spawn agents to add examples in parallel.**
