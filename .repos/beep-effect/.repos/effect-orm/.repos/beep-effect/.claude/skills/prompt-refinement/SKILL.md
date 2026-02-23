# Prompt Refinement Skill

Refine raw prompts into production-quality specifications using structured prompt engineering, parallel research agents, and iterative critic-fixer review loops.

## When to Use This Skill

Invoke this skill when:
- User wants to refine a rough prompt idea into a detailed specification
- User provides a `PROMPT_NAME:` identifier with raw content
- User asks to "improve", "refine", or "structure" a prompt
- User wants to create a specification for a coding task
- User mentions wanting a "prompt file" or "spec" for later use

## Input Format

The user provides a prompt with a `PROMPT_NAME` identifier:

```
PROMPT_NAME: <kebab-case-name>
<raw prompt content>
```

## Workflow Overview

This skill operates in 5 phases with **authorization gates** between each:

| Phase | Name | Key Actions |
|-------|------|-------------|
| 1 | Initialization | Parse input, create `.specs/` directory, save original |
| 2 | Exploration | Deploy parallel research agents (codebase, AGENTS.md, Effect) |
| 3 | Refinement | Generate COSTAR+CRISPE structured prompt |
| 4 | Review Loop | Critic-fixer iterations (max 3) |
| 5 | Finalization | Present final prompt, suggest next steps |

## Phase 1: Initialization

1. **Parse the input** to extract:
   - `PROMPT_NAME` - the kebab-case identifier
   - Raw prompt content - everything after the PROMPT_NAME line

2. **Create the spec directory**: `.specs/<prompt-name>/`

3. **Save the original prompt** to `.specs/<prompt-name>/<prompt-name>.original.md`

4. **Present to user**:
   - Show the parsed PROMPT_NAME
   - Show the spec directory that will be created
   - Show the original prompt content

**AUTHORIZATION GATE**: Request user approval to proceed to exploration phase

## Phase 2: Exploration

Launch **parallel** sub-agents to gather context:

### 2.1 Codebase Explorer
Use `subagent_type=Explore` to:
- Find files referenced in the prompt (e.g., `@scratchpad/index.ts` -> `scratchpad/index.ts`)
- Identify relevant packages based on keywords
- Discover related patterns in the codebase

### 2.2 AGENTS.md Collector
Use `subagent_type=Explore` to:
- Find all `AGENTS.md` files in packages mentioned in the prompt
- Extract relevant guidelines and constraints
- Identify package-specific patterns

### 2.3 Effect Researcher
Use `subagent_type=effect-researcher` to:
- Research Effect patterns relevant to the prompt
- Consult Effect documentation via MCP tools
- Identify idiomatic approaches for the task

**Present exploration results** to user:
- Files discovered and their relevance
- Package guidelines collected
- Effect patterns identified

**AUTHORIZATION GATE**: Request user approval to proceed to refinement

## Phase 3: Initial Refinement

Using the exploration results, create the refined prompt following the **COSTAR+CRISPE hybrid structure**.

> **Reference**: See `COSTAR_CRISPE_FORMAT.md` for the complete template structure.

**Save** to `.specs/<prompt-name>/<prompt-name>.prompt.md`

**Present** the initial refined prompt to user

**AUTHORIZATION GATE**: Request user approval to proceed to review loop

## Phase 4: Review Loop (Max 3 Iterations)

For each iteration (until no significant issues OR max 3 reached):

### 4.1 Critic Phase
Spawn a critic sub-agent to evaluate the refined prompt.

> **Reference**: See `CRITIC_CHECKLIST.md` for the complete evaluation criteria.

The critic produces a structured report with:
- Issues found (HIGH/MEDIUM/LOW severity)
- Opportunities for improvement
- Verdict (PASS or NEEDS_FIXES)

### 4.2 Fixer Phase (if NEEDS_FIXES)
Spawn a fixer sub-agent to:
- Apply all HIGH severity fixes
- Apply MEDIUM severity fixes where beneficial
- Consider LOW severity and opportunities
- Update the iteration count in frontmatter
- Add entry to Refinement History table

**Present** the critic report and fixes applied to user

**Continue loop** or proceed to finalization if PASS or max iterations reached

## Phase 5: Finalization

1. **Final prompt** is at `.specs/<prompt-name>/<prompt-name>.prompt.md`

2. **Present summary**:
   - Total iterations performed
   - Key improvements made
   - Final verification checklist status
   - Path to the refined prompt file

3. **Suggest next steps**:
   - "Use this prompt with: `cat .specs/<prompt-name>/<prompt-name>.prompt.md`"
   - "Or copy the prompt content to use directly"

## Critical Rules

1. **NEVER skip authorization gates** - Each gate requires explicit user approval
2. **NEVER modify the original** - `.original.md` is immutable after creation
3. **ALWAYS use parallel agents** where possible (exploration phase)
4. **ALWAYS preserve exploration context** in the refined prompt's Metadata section
5. **ALWAYS increment version** on each refinement iteration
6. **NEVER exceed 3 review iterations** - diminishing returns beyond this

## Error Handling

| Scenario | Action |
|----------|--------|
| PROMPT_NAME missing | Ask user to provide it |
| Exploration finds no files | Proceed with general best practices, note the gap |
| Sub-agent fails | Report the failure, continue with available information |
| User rejects at gate | Ask what changes they want before proceeding |

## Supporting Files

| File | Purpose |
|------|---------|
| `COSTAR_CRISPE_FORMAT.md` | Complete template structure for refined prompts |
| `CRITIC_CHECKLIST.md` | Evaluation criteria for the review loop |
| `EFFECT_CONSTRAINTS.md` | Repository-specific Effect patterns and constraints |

## Example Invocation

```
PROMPT_NAME: mock-s3-simulation
I want to create a simulation of uploading a file to s3 using the `createMockS3Layer` in @scratchpad/index.ts using `@effect/platform`.
```

This will:
1. Create `.specs/mock-s3-simulation/`
2. Save original to `.specs/mock-s3-simulation/mock-s3-simulation.original.md`
3. Explore codebase for `scratchpad/index.ts`, `@effect/platform` patterns
4. Generate refined prompt at `.specs/mock-s3-simulation/mock-s3-simulation.prompt.md`
5. Review and iterate up to 3 times
6. Present final refined prompt
