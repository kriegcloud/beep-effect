# P3 Orchestrator Prompt

Copy and paste this prompt to start a new session for Phase 3.

---

## Prompt

You are implementing Phase 3 (Onboarding System) of the ai-friendliness-10-of-10 spec.

### Context from P2

Phase 2 (Error Catalog Population) completed successfully:
- 63 error patterns documented (exceeds 50+ target)
- All 10 categories populated with diagnosis, fix_steps, examples
- YAML validates, patterns are machine-readable

### Your Mission

Create an interactive onboarding system for new agent instances:

| Deliverable | Location | Purpose |
|-------------|----------|---------|
| Entry point | `.claude/onboarding/README.md` | Overview, navigation |
| Effect primer | `.claude/onboarding/effect-primer.md` | Essential Effect patterns |
| First contribution | `.claude/onboarding/first-contribution.md` | Step-by-step guide |
| Common tasks | `.claude/onboarding/common-tasks.md` | Task patterns reference |
| Verification | `.claude/onboarding/verification-checklist.md` | Readiness gates |
| Skill | `.claude/skills/onboarding/SKILL.md` | Interactive checklist |

### Effect Primer Must Cover

1. **Effect type parameters**: `Effect<A, E, R>` meaning
2. **Generator syntax**: `Effect.gen(function* () { yield* })`
3. **Layer system**: How dependencies are provided
4. **Error handling**: TaggedError, catchTag/catchTags
5. **Namespace imports**: REQUIRED `import * as Effect from "effect/Effect"`

Example structure:
```markdown
## Effect.gen - The Primary Pattern

Effect.gen is how you write sequential Effect code:

\`\`\`typescript
const myEffect = Effect.gen(function* () {
  const user = yield* UserService;
  const data = yield* user.getData();
  return data;
});
\`\`\`

Key points:
- `function*` creates a generator
- `yield*` "unwraps" an Effect, providing its success value
- Errors propagate automatically to the error channel
\`\`\`

### First Contribution Must Include

1. **Environment check**: `bun --version`, `bun run check`
2. **Architecture review**: CLAUDE.md, /modules command
3. **Simple task selection**: What qualifies as "simple"
4. **Implementation steps**: Read, modify, verify pattern
5. **Verification commands**: `bun run check`, `bun run test`
6. **Common pitfalls**: Top 5 mistakes to avoid

### Common Tasks Must Cover

| Task | Key Steps |
|------|-----------|
| Add domain field | Schema → Table → _check.ts |
| Create service | Context.Tag → Layer → provide |
| Write test | effect() runner, Layer provision |
| Fix type error | Check EntityIds, Schema types |
| Add package dep | package.json → tsconfig-sync |

### Reference Files

- Onboarding gaps: `specs/ai-friendliness-10-of-10/outputs/onboarding-gaps.md`
- Error patterns: `specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml`
- Effect rules: `.claude/rules/effect-patterns.md`
- Code standards: `.claude/rules/code-standards.md`
- Full handoff: `specs/ai-friendliness-10-of-10/handoffs/HANDOFF_P3.md`

### Execution Pattern

**Option A**: 3-4 parallel agents by document type:

1. **Agent 1**: README.md + effect-primer.md (foundational)
2. **Agent 2**: first-contribution.md + verification-checklist.md (action-oriented)
3. **Agent 3**: common-tasks.md (patterns reference)
4. **Agent 4**: Onboarding skill (interactive)

**Option B**: Single `documentation-expert` agent for all (if context permits)

### Skill Structure

```markdown
---
name: onboarding
description: Interactive onboarding checklist for new agents
---

# Agent Onboarding

Welcome to beep-effect. This checklist ensures you're ready to contribute.

## 1. Environment Check
- [ ] `bun --version` returns 1.3.x+
- [ ] `bun run check` runs (note any pre-existing errors)

## 2. Architecture Understanding
- [ ] Review CLAUDE.md for project overview
- [ ] Run `/modules` to see available modules
- [ ] Understand slice structure: domain → tables → server → client → ui

## 3. Effect Proficiency
Can you explain:
- [ ] What `Effect<A, E, R>` type parameters mean?
- [ ] How to use `Effect.gen(function* () { })`?
- [ ] What `yield*` does in Effect generators?
- [ ] How Layers provide dependencies?

If uncertain, read `.claude/onboarding/effect-primer.md`

## 4. Pattern Awareness
- [ ] Review `.claude/rules/effect-patterns.md` for REQUIRED patterns
- [ ] Note NEVER/ALWAYS rules
- [ ] Understand EntityId requirement for all ID fields

## 5. Ready to Contribute
- [ ] Start with a simple task to verify understanding
- [ ] Run `bun run check` after any changes
- [ ] Request review before large modifications
```

### Quality Gates

```bash
# Verify all files exist
ls .claude/onboarding/
# Expected: 5 markdown files

# Verify skill exists
ls .claude/skills/onboarding/
# Expected: SKILL.md

# Verify Effect examples compile (sample check)
bun tsc --noEmit --strict /dev/stdin <<< "
import * as Effect from 'effect/Effect';
const example = Effect.gen(function* () {
  yield* Effect.succeed(42);
});
"
```

### Success Criteria

- [ ] 5 onboarding markdown files created
- [ ] Effect primer has working code examples
- [ ] First-contribution guide is actionable
- [ ] Onboarding skill provides interactive checklist
- [ ] REFLECTION_LOG.md updated with P3 entry

### After Completion

1. Update `specs/ai-friendliness-10-of-10/REFLECTION_LOG.md` with P3 entry
2. Create `handoffs/HANDOFF_P4.md` for self-healing hooks phase
3. Create `handoffs/P4_ORCHESTRATOR_PROMPT.md`

---

## Agent Delegation Pattern

When spawning documentation agents:

```
Task: Create onboarding documentation for [Document Type]

<contextualization>
Documents: [list of documents to create]
Purpose: [specific purpose of these documents]

Reference material:
- Read: specs/ai-friendliness-10-of-10/outputs/onboarding-gaps.md (friction points to address)
- Read: .claude/rules/effect-patterns.md (patterns to teach)
- Read: specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml (common errors to warn about)

Format guidelines:
- Use Effect namespace imports in all examples
- Include working code snippets
- Keep content actionable, not theoretical
- Target new agents who know TypeScript but not Effect
</contextualization>

Write to: .claude/onboarding/[filename].md
```
