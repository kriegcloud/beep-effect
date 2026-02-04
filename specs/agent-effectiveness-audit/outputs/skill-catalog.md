# Skill Catalog

> Complete inventory of all skills in the beep-effect monorepo.

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Skills** | 45 |
| **With SKILL.md** | 45 (100%) |
| **With Frontmatter** | 38/45 (84%) |
| **With Triggers Documented** | 41/45 (91%) |
| **Symlinked to .agents** | 9 (20%) |

---

## Skills by Category

### Effect Core Patterns (8 skills)

| Skill | Path | Triggers | Description |
|-------|------|----------|-------------|
| domain-modeling | `.claude/skills/domain-modeling/` | "domain model", "entity", "tagged struct" | Schema.TaggedStruct-based ADTs |
| domain-predicates | `.claude/skills/domain-predicates/` | "predicates", "typeclass", "orders" | Typeclass-based predicates |
| error-handling | `.claude/skills/error-handling/` | "error handling", "tagged error", "catchTag" | Data.TaggedError patterns |
| layer-design | `.claude/skills/layer-design/` | "layer", "dependency injection" | Layer composition |
| pattern-matching | `.claude/skills/pattern-matching/` | "match", "discriminated union" | Match.typeTags patterns |
| platform-layers | `.claude/skills/platform-layers/` | "platform layer", "runtime" | Platform-specific layers |
| schema-composition | `.claude/skills/schema-composition/` | "schema", "validation", "transform" | Schema composition |
| typeclass-design | `.claude/skills/typeclass-design/` | "typeclass", "dual api" | Curried signatures |

### Effect AI Suite (5 skills)

| Skill | Path | Triggers | Description |
|-------|------|----------|-------------|
| effect-ai-language-model | `.claude/skills/effect-ai-language-model/` | "language model", "text generation" | LLM interactions |
| effect-ai-prompt | `.claude/skills/effect-ai-prompt/` | "prompt building", "messages" | Prompt construction |
| effect-ai-provider | `.claude/skills/effect-ai-provider/` | "ai provider", "anthropic", "openai" | Provider configuration |
| effect-ai-streaming | `.claude/skills/effect-ai-streaming/` | "streaming", "delta" | Streaming responses |
| effect-ai-tool | `.claude/skills/effect-ai-tool/` | "ai tool", "toolkit" | Tool definitions |

### Platform Abstractions (5 skills)

| Skill | Path | Triggers | Description |
|-------|------|----------|-------------|
| cli | `.claude/skills/cli/` | "cli", "command line" | @effect/cli usage |
| command-executor | `.claude/skills/command-executor/` | "command", "process spawn" | Process management |
| filesystem | `.claude/skills/filesystem/` | "filesystem", "file io" | Cross-platform I/O |
| path | `.claude/skills/path/` | "path operations" | Path manipulation |
| platform-abstraction | `.claude/skills/platform-abstraction/` | "platform", "cross-platform" | Runtime abstraction |

### React/Frontend (4 skills)

| Skill | Path | Triggers | Description |
|-------|------|----------|-------------|
| atom-state | `.claude/skills/atom-state/` | "atom", "reactive state" | Effect Atom state |
| react-composition | `.claude/skills/react-composition/` | "react component", "composition" | Composable React |
| react-vm | `.claude/skills/react-vm/` | "view model", "vm pattern" | VM pattern |
| the-vm-standard | `.claude/skills/the-vm-standard/` | "vm covenant" | VM architecture laws |

### Authentication (3 skills)

| Skill | Path | Triggers | Description | Notes |
|-------|------|----------|-------------|-------|
| Better Auth Best Practices | `.claude/skills/Better Auth Best Practices/` | "better auth" | Auth integration | **Redundant** |
| Create Auth Skill | `.claude/skills/Create Auth Skill/` | "create auth" | Auth service creation | **Redundant** |
| better-auth-best-practices | `.claude/skills/better-auth-best-practices/` | "auth" | Auth skill | **Symlink** |

### Development Workflow (6 skills)

| Skill | Path | Triggers | Description |
|-------|------|----------|-------------|
| agentation | `.claude/skills/agentation/` | "visual feedback" | Toolbar integration |
| session-handoff | `.claude/skills/session-handoff/` | "handoff", "session transfer" | Session continuity |
| skill-creator | `.claude/skills/skill-creator/` | "create skill" | Skill authoring |
| skill-judge | `.claude/skills/skill-judge/` | "evaluate skill" | Skill quality |
| spec-driven-development | `.claude/skills/spec-driven-development/` | "spec workflow" | Spec process |
| subagent-driven-development | `.claude/skills/subagent-driven-development/` | "subagent", "parallel tasks" | Task execution |

### Other (14 skills)

| Skill | Path | Triggers | Description |
|-------|------|----------|-------------|
| ai-context-writer | `.claude/skills/ai-context-writer/` | "ai context", "module docs" | Context files |
| context-witness | `.claude/skills/context-witness/` | "dependency injection" | DI patterns |
| discovery-kit | `.claude/skills/discovery-kit/` | "discovery" | Module discovery |
| effect-concurrency-testing | `.claude/skills/effect-concurrency-testing/` | "concurrency test" | Concurrent tests |
| humanizer | `.claude/skills/humanizer/` | "humanize" | AI text cleanup |
| legal-review | `.claude/skills/legal-review/` | "legal review" | Compliance review |
| parallel-explore | `.claude/skills/parallel-explore/` | "parallel explore" | Parallel research |
| prompt-refinement | `.claude/skills/prompt-refinement/` | "refine prompt" | Prompt improvement |
| reflect | `.claude/skills/reflect/` | "reflect", "learnings" | Self-improvement |
| research-orchestration | `.claude/skills/research-orchestration/` | "research" | Research sub-agents |
| service-implementation | `.claude/skills/service-implementation/` | "service" | Service patterns |
| turborepo | `.claude/skills/turborepo/` | "turbo", "monorepo" | Build system |
| wide-events | `.claude/skills/wide-events/` | "observability" | Telemetry design |
| writing-laws | `.claude/skills/writing-laws/` | "laws", "covenants" | Legal-style rules |

---

## Issues Identified

### Naming Inconsistencies (2 skills)

| Directory | Issue | Recommendation |
|-----------|-------|----------------|
| `Better Auth Best Practices` | Spaces + Title Case | Rename to `better-auth-best-practices` |
| `Create Auth Skill` | Spaces + Title Case | Rename to `create-auth-skill` |

### Missing Frontmatter (7 skills)

- cli
- discovery-kit
- filesystem
- path
- platform-layers
- prompt-refinement
- research-orchestration

### Redundant Skills (3 auth-related)

1. **Better Auth Best Practices** (505 lines) - Direct
2. **Create Auth Skill** (771 lines) - Direct
3. **better-auth-best-practices** (166 lines) - Symlink

**Recommendation**: Consolidate into single `better-auth` skill.

### Symlinked Skills (9 total)

```
agentation
better-auth-best-practices
humanizer
reflect
session-handoff
skill-creator
skill-judge
subagent-driven-development
turborepo
```

**Source**: `.agents/skills/`

**Question**: Is this a compatibility layer or canonical source?

---

## Size Distribution

| Tier | Count | Examples |
|------|-------|----------|
| **Comprehensive** (800+ lines) | 10 | domain-modeling, platform-abstraction, schema-composition |
| **Substantial** (400-800 lines) | 11 | atom-state, command-executor, effect-ai-prompt |
| **Moderate** (200-400 lines) | 14 | cli, context-witness, legal-review |
| **Brief** (<200 lines) | 8 | agentation, wide-events, prompt-refinement |

---

## Recommendations

### Priority 1: Cleanup
1. Rename directories to kebab-case (2 skills)
2. Consolidate auth skills (3 → 1)
3. Add frontmatter to 7 skills

### Priority 2: Documentation
1. Document symlink strategy
2. Add "When to Use" sections
3. Create SKILLS.md index

### Priority 3: Quality
1. Run linter on frontmatter
2. Add discovery validation
3. Score skills on quality rubric (P1)

---

*Generated by Explore agent during P0 baseline measurement*
