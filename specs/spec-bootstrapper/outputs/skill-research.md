# Skill and Agent Creation Patterns Research Report

## Executive Summary

The beep-effect monorepo uses a sophisticated dual-track system for AI agent orchestration:

1. **Skills** (`.claude/skills/`) - Single-session, reference-style knowledge aids for specific technical domains (Effect imports, patterns, constraints)
2. **Agents** (`.claude/agents/`) - Multi-purpose, autonomous workers with defined capabilities and tool access for complex tasks (research, code review, documentation writing)

Key findings:
- Skills require minimal frontmatter (just `paths:` metadata) and serve as reference documents
- Agents require detailed YAML frontmatter with capability definitions, tool lists, and phase mapping
- The `.claude/agents-manifest.yaml` registry acts as the canonical source for agent selection logic
- Agents follow a capability model (read-only, write-reports, write-files) with clear tier stratification
- Skills nest content either directly in `.md` file or in subdirectories with `SKILL.md` entry point
- New spec-creation skill should follow established patterns: Skill.md in subdirectory with supporting templates

---

## 1. Skill File Format

### Structure Overview

Skills in `.claude/skills/` follow a simple, minimal format:

```yaml
---
paths:  # Optional: file patterns this skill applies to
  - "**/*.ts"
  - "**/*.tsx"
---

# [Skill Title]

## When to Use

[Conditions for applying this skill]

## [Main Content Sections]

[Detailed patterns, examples, templates]
```

### Minimal Frontmatter
- **`paths`** (optional) - Glob patterns indicating file types this skill targets
- No other metadata required for simple skills
- Frontmatter separators: `---` (YAML delimiters)

### Examples from Codebase

#### Simple Skill: `effect-imports.md`
- 127 lines of reference content
- Covers import conventions, aliases, PascalCase constructors
- Includes reference tables and complete examples
- No subdirectory needed

#### Simple Skill: `forbidden-patterns.md`
- 148 lines of patterns to avoid
- Shows forbidden vs. required approaches
- Four major sections: native arrays, strings, dates, type checks

#### Complex Skill: `prompt-refinement/`
- **Directory structure** with `SKILL.md` entry point
- Supporting files: `COSTAR_CRISPE_FORMAT.md`, `CRITIC_CHECKLIST.md`, `EFFECT_CONSTRAINTS.md`
- `SKILL.md` acts as primary skill definition (173 lines)
- Additional templates guide execution through 5-phase workflow

### Directory-Based Skill Pattern

When a skill is complex and requires templates or multiple support files:

```
.claude/skills/[skill-name]/
├── SKILL.md                    # Primary entry point (frontmatter + guidance)
├── COSTAR_CRISPE_FORMAT.md     # Template for structured refinement
├── CRITIC_CHECKLIST.md         # Evaluation criteria
├── EFFECT_CONSTRAINTS.md       # Repository-specific constraints
└── PROMPT_TEMPLATE.md          # Reusable prompt structure
```

---

## 2. Agent Definition Format

### Complete YAML Frontmatter (From `.claude/agents/doc-writer.md`)

```yaml
---
name: doc-writer
description: |
  Documentation writer agent for JSDoc, README, and AGENTS.md following repository standards. This agent:
  1. Analyzes existing documentation gaps in a package
  2. Writes JSDoc comments with @example, @category, and @since tags
  3. Creates or updates README.md files following the established template
  4. Creates or updates AGENTS.md files with architectural guidance
  5. Ensures all examples follow Effect patterns (Effect.gen, namespace imports)
  6. Validates documentation compliance with docgen requirements

model: sonnet
---
```

### Agent Manifest Registration (`.claude/agents-manifest.yaml`)

```yaml
agents:
  doc-writer:
    tier: 4
    capability: write-files          # read-only | write-reports | write-files
    output_type: documentation       # none | reports | documentation | code | tests
    description: "Documentation writer - creates/modifies README, AGENTS.md, JSDoc"
    tools:
      - Glob
      - Grep
      - Read
      - Write
      - Edit
    phases: [0, 3]                  # Which spec phases this agent fits
    triggers:
      - "write documentation"
      - "create readme"
      - "add jsdoc"
      - "create agents.md"
      - "document package"
    use_when: "Need to create or update documentation files"
    do_not_use_when: "Code changes or test generation"
```

### Capability Model

**Three discrete capability levels:**

1. **read-only** - Agent explores, analyzes, reports findings to orchestrator but produces NO persistent artifacts
   - Tools: `[Glob, Grep, Read]` only
   - Examples: `codebase-researcher`, `mcp-researcher`, `web-researcher`
   - Output: Informs orchestrator via conversation (no files)

2. **write-reports** - Agent produces markdown reports in `outputs/` directory
   - Tools: `[Glob, Grep, Read] + Write/Edit`
   - Examples: `code-reviewer`, `reflector`, `spec-reviewer`
   - Output path: `outputs/*.md`

3. **write-files** - Agent creates or modifies source code, tests, documentation
   - Tools: Full access including `Edit`, `Bash`
   - Examples: `doc-writer`, `test-writer`, `code-observability-writer`
   - Output: Directly modifies files in codebase

### Tier Stratification (from manifest)

- **Tier 1 (Foundation)**: `reflector`, `codebase-researcher`
- **Tier 2 (Research)**: `mcp-researcher`, `web-researcher`, `effect-researcher`
- **Tier 3 (Quality)**: `code-reviewer`, `architecture-pattern-enforcer`, `spec-reviewer`
- **Tier 4 (Writers)**: `doc-writer`, `test-writer`, `code-observability-writer`

---

## 3. Settings and Registration Files

### `.claude/settings.json` - Tool Permissions

```json
{
  "permissions": {
    "allow": [
      "Bash(bun:*)",
      "Bash(git:*)",
      "Bash(turbo:*)",
      "Bash(biome:*)",
      "Bash(tsc:*)",
      "Bash(npx:*)",
      "Bash(docker:*)",
      "Bash(docker-compose:*)",
      "Read",
      "Write",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(rm -rf /*)",
      "Bash(git push --force origin main)",
      "Bash(git push --force origin master)"
    ]
  }
}
```

### `.claude/agents-manifest.yaml` - Agent Registry

**Structure**: Single YAML file with three main sections:

1. **capabilities** - Define capability levels and their properties
2. **agents** - Full agent definitions with metadata
3. **selection_rules** - Logic for orchestrators to choose appropriate agents

---

## 4. Command Integration & Invocation

### Skill vs Command Invocation

From CLAUDE.md:
> **Skills vs Specs**: `.claude/skills/` for single-session, `specs/` for multi-session orchestration

**Skills** are invoked in different ways depending on context:
- **Implicit reference** during session: "Use the effect-imports skill when..."
- **Direct invocation** (proposed for new skill): `/new-spec` command in user interface
- **Context injection** into agent prompts: Relevant skills auto-included based on context

### Agent Invocation

Agents are launched by **orchestrators** (higher-level agents or human prompts) using:
- Task tool calls
- Skill tool with `skill: "agent-name"` parameter
- Phase-based selection from manifest

---

## 5. Spec-Specific Patterns

### Spec Directory Structure (from `specs/agents/`)

```
specs/[spec-name]/
├── README.md               # Entry point (100-150 lines)
├── REFLECTION_LOG.md      # Cumulative learnings
├── outputs/               # Phase artifacts
│   ├── research-findings.md
│   ├── agent-design.md
│   ├── [phase-specific-outputs].md
│   └── ...
├── templates/             # Optional reusable templates
│   └── *.md
└── handoffs/              # Optional handoff documents
    └── *.md
```

### META_SPEC_TEMPLATE Pattern

Referenced in `specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md`:
- Provides standard structure for complex specs
- Includes phase-by-phase breakdown
- Success criteria checklist
- Reflection log guidance

---

## 6. Content Recommendations for Spec-Bootstrapper Skill

### What the Skill Should Cover

1. **When to Use** - "When creating a new specification for a complex task or feature"
2. **Quick Start** - Basic invocation showing spec name parameter
3. **Workflow Overview** - 5-7 phase steps with authorization gates
4. **Input Format** - How users provide spec name and description
5. **Phase Breakdown**:
   - **Phase 1: Initialization** - Parse input, create directories
   - **Phase 2: Template Selection** - Choose template (complex vs simple)
   - **Phase 3: Structure Generation** - Create README, REFLECTION_LOG, outputs
   - **Phase 4: Template Population** - Fill initial content with spec context
   - **Phase 5: Agent Suggestions** - Recommend agents for each phase

6. **Output Checklist** - Files created, verification steps
7. **Next Steps** - How to proceed with Phase 1 research

---

## 7. Example Skill Draft: `/new-spec` Skill

### Recommended File Structure

```
.claude/skills/spec-bootstrapper/
├── SKILL.md                          # Primary skill definition
├── SPEC_TEMPLATE.md                  # Default README template
├── REFLECTION_LOG_TEMPLATE.md        # Initial reflection log
├── PHASE_GUIDE.md                    # Phase execution guide
└── AGENT_RECOMMENDATIONS.md          # Which agents to use per phase
```

### Integration Points

**With CLI System**
- Integration point: `tooling/cli/src/commands/bootstrap-spec/`
- Could invoke skill programmatically or provide shell command alternative
- Register in CLI available commands listing

**With Spec Workflow**
- Produces initial README following META_SPEC_TEMPLATE pattern
- Integrates with phase-agent mapping from manifest
- REFLECTION_LOG compatible with existing spec system

**With Agent Selection**
- Suggests relevant agents for each phase based on manifest
- References SPEC_CREATION_GUIDE agent-phase matrix
- Provides trigger keywords for orchestrator matching

---

## Summary of Key Patterns

1. **Simple vs Complex Skills**:
   - Simple (reference): Single `.md` file with frontmatter
   - Complex (workflow): Directory with `SKILL.md` + supporting templates

2. **Recommended Pattern for Spec-Bootstrapper**: **Complex skill in directory**
   - `SKILL.md` - Workflow phases and guidance
   - `SPEC_TEMPLATE.md` - README template to populate
   - `REFLECTION_LOG_TEMPLATE.md` - Initial reflection log
   - `PHASE_GUIDE.md` - Agent selection guidance

3. **No Registration Required in Manifest**: Skills don't need manifest entries; agents do

4. **Authorization Gates**: Complex skills use multi-phase workflows with user approval between gates
