# Spec Bootstrapper Synthesis Report

> Master synthesis of CLI and skill research findings.

---

## Executive Summary

The spec-bootstrapper project will deliver an integrated toolset:

1. **CLI Command** (`bun run beep bootstrap-spec`) - Automated spec folder creation
2. **Claude Skill** (`/new-spec`) - Interactive guidance layer that invokes the CLI command

The skill provides context gathering and validation, then executes the CLI for actual file generation. This architecture eliminates manual spec scaffolding and ensures consistency with META_SPEC_TEMPLATE patterns.

---

## Integrated Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPEC BOOTSTRAPPER SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────┐                               │
│   │      Claude Skill            │                               │
│   │       /new-spec              │                               │
│   │  • Context gathering         │                               │
│   │  • Input validation          │                               │
│   │  • Complexity guidance       │                               │
│   └──────────────┬───────────────┘                               │
│                  │ invokes                                        │
│                  ▼                                                │
│   ┌─────────────────────────────┐                                │
│   │      CLI Command             │                                │
│   │     bootstrap-spec           │                                │
│   │  • Schema validation         │                                │
│   │  • File generation           │                                │
│   │  • Template rendering        │                                │
│   └──────────────┬──────────────┘                                │
│                  │                                                │
│                  ▼                                                │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  Shared Components                       │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │  • Template definitions (README, REFLECTION_LOG, etc.)  │   │
│   │  • Complexity levels (simple, medium, complex)          │   │
│   │  • Validation schemas (SpecName, SpecDescription)       │   │
│   │  • Phase-agent mapping from manifest                    │   │
│   └──────────────┬──────────────────────────────────────────┘   │
│                  │                                                │
│                  ▼                                                │
│   ┌────────────────────┐    ┌───────────────────────────────┐   │
│   │    File System     │    │    SPEC_CREATION_GUIDE.md     │   │
│   │    specs/[name]/   │    │    META_SPEC_TEMPLATE.md      │   │
│   └────────────────────┘    └───────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deliverables Matrix

| Deliverable | Location | Purpose |
|-------------|----------|---------|
| CLI Command | `tooling/cli/src/commands/bootstrap-spec/` | Automated file creation |
| Claude Skill | `.claude/skills/spec-bootstrapper/SKILL.md` | Interactive guidance |
| Templates | `.claude/skills/spec-bootstrapper/templates/` | Reusable file templates |
| CLI Docs | `tooling/cli/CLAUDE.md` (updated) | Command documentation |
| Spec Guide | `specs/SPEC_CREATION_GUIDE.md` (updated) | Reference to new tool |

---

## Implementation Plan

### Phase 1: CLI Command (Priority: High)

**Files to Create:**

1. **`schemas.ts`** - Validation schemas
   - SpecName: kebab-case, 3-50 chars, not reserved
   - SpecDescription: non-empty, max 200 chars
   - BootstrapSpecInput: validated input class

2. **`errors.ts`** - Tagged error classes
   - InvalidSpecNameError
   - SpecExistsError
   - FileWriteError

3. **`utils/template.ts`** - Template system
   - SpecContext interface with case variants
   - createSpecContext() builder
   - Handlebars template strings

4. **`utils/file-generator.ts`** - Generation logic
   - GenerationPlan interface
   - createPlan() - complexity-aware
   - previewPlan() - dry-run formatting
   - executePlan() - file writing

5. **`handler.ts`** - Command orchestration
   - Input validation
   - Existence checking
   - Plan creation/execution

6. **`index.ts`** - Command definition
   - Options: --name, --description, --dry-run, --complexity
   - Service layer composition
   - Command.make() factory

**CLI Options:**

| Option | Short | Required | Default | Description |
|--------|-------|----------|---------|-------------|
| --name | -n | Yes | - | Spec name in kebab-case |
| --description | -d | Yes | - | Brief description |
| --purpose | -p | No | (derived) | Purpose statement |
| --problem | - | No | (derived) | Problem being solved |
| --scope | -s | No | (derived) | Scope boundaries |
| --dry-run | - | No | false | Preview without creating |
| --complexity | -c | No | medium | simple/medium/complex |

### Phase 2: Claude Skill (Priority: High)

**Files to Create:**

1. **`SKILL.md`** - Primary skill definition
   - When to use guidance
   - Input format specification
   - 5-phase workflow with gates
   - Error handling

2. **`templates/README.template.md`** - README template
   - Handlebars variables
   - Standard sections

3. **`templates/REFLECTION_LOG.template.md`** - Reflection log template
   - Protocol structure
   - Entry template

4. **`PHASE_GUIDE.md`** - Phase-agent mapping
   - Discovery agents
   - Evaluation agents
   - Synthesis agents

5. **`AGENT_RECOMMENDATIONS.md`** - Agent selection guide
   - Per-phase recommendations
   - Trigger keywords

### Phase 3: Integration (Priority: Medium)

1. Update `tooling/cli/src/index.ts` - Register command
2. Update `tooling/cli/CLAUDE.md` - Document command
3. Update `specs/SPEC_CREATION_GUIDE.md` - Reference new tool
4. Update `specs/README.md` - Add spec-bootstrapper entry

### Phase 4: Testing & Documentation (Priority: Medium)

1. Test CLI with various inputs
2. Test skill workflow
3. Validate generated structure
4. Update documentation

---

## Complexity Levels

### Simple Spec
```
specs/[name]/
├── README.md
└── REFLECTION_LOG.md
```

Use case: Quick experiments, single-session tasks

### Medium Spec (Default)
```
specs/[name]/
├── README.md
├── REFLECTION_LOG.md
├── QUICK_START.md
└── outputs/
```

Use case: Multi-phase tasks, moderate complexity

### Complex Spec
```
specs/[name]/
├── README.md
├── QUICK_START.md
├── MASTER_ORCHESTRATION.md
├── AGENT_PROMPTS.md
├── RUBRICS.md
├── REFLECTION_LOG.md
├── templates/
├── outputs/
└── handoffs/
```

Use case: Major features, multi-session orchestration

### Complexity Selection Guide

| Criteria | Simple | Medium | Complex |
|----------|--------|--------|---------|
| Estimated sessions | 1 | 2-3 | 4+ |
| Files to modify | < 5 | 5-15 | 15+ |
| Cross-package impact | None | Some | Significant |
| Agent coordination | Single | Sequential | Parallel |
| Example use cases | Bug fix doc, small utility | Feature implementation | System redesign |

**Decision Flow:**
1. Single session, few files? → Simple
2. Multi-session, moderate scope? → Medium
3. Multiple agents, complex orchestration? → Complex

---

## Template Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{specName}}` | my-feature | kebab-case name |
| `{{specDescription}}` | Feature desc | User-provided description |
| `{{purpose}}` | Automate X | Purpose statement for README |
| `{{problemStatement}}` | Currently Y is manual | Problem being solved |
| `{{scope}}` | Covers A, B, C | Scope boundaries |
| `{{complexity}}` | medium | Complexity level |
| `{{createdAt}}` | 2026-01-11T00:00:00Z | ISO timestamp for audit trail |

> **Note**: Case variants (`{{SpecName}}`, `{{SPEC_NAME}}`, `{{spec_name}}`) can be derived at runtime using Handlebars helpers if needed.

---

## Success Criteria

### CLI Command
- [ ] Creates valid spec folder structure
- [ ] Validates input correctly
- [ ] Supports all three complexity levels
- [ ] Dry-run mode works
- [ ] Error messages are helpful
- [ ] Follows Effect patterns

### Claude Skill
- [ ] Clear when-to-use guidance
- [ ] 5-phase workflow with gates
- [ ] References existing documentation
- [ ] Provides agent recommendations
- [ ] Integrates with CLI command

### Integration
- [ ] CLI registered in beep command
- [ ] CLAUDE.md updated
- [ ] SPEC_CREATION_GUIDE.md updated
- [ ] Generated specs pass structure validation

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Template syntax errors | Validate templates during build |
| Overwriting existing specs | Check existence before creation |
| Inconsistent complexity options | Enumerate valid options in schema |
| Missing dependencies | Test in clean environment |

---

## Timeline (Priority-Based)

1. **Immediate**: Schema, errors, templates (foundation)
2. **Short-term**: Handler, command, file generator (core)
3. **Medium-term**: Skill files, integration updates (enhancement)
4. **Ongoing**: Testing, documentation, refinement (quality)
