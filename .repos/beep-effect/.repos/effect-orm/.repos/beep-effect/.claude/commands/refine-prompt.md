# Prompt Refinement Pipeline

Refine a user prompt into a production-quality specification using structured prompt engineering and iterative review.

## Input Format

The user provides a prompt with a `PROMPT_NAME` identifier:

```
PROMPT_NAME: <kebab-case-name>
<raw prompt content>
```

## Workflow

### Phase 1: Initialization

1. **Parse the input** to extract:
   - `PROMPT_NAME` - the identifier (e.g., `mock-s3-simulation`)
   - Raw prompt content - everything after the PROMPT_NAME line

2. **Create the spec directory**: `.specs/<prompt-name>/`

3. **Save the original prompt** to `.specs/<prompt-name>/<prompt-name>.original.md`

4. **Present to user**:
   - Show the parsed PROMPT_NAME
   - Show the spec directory that will be created
   - Show the original prompt content

**🔒 AUTHORIZATION GATE**: Request user approval to proceed to exploration phase

### Phase 2: Exploration

Launch parallel sub-agents to gather context:

#### 2.1 Codebase Explorer
Use the `Explore` agent (subagent_type=Explore) to:
- Find files referenced in the prompt (e.g., `@scratchpad/index.ts` → `scratchpad/index.ts`)
- Identify relevant packages based on keywords
- Discover related patterns in the codebase

#### 2.2 AGENTS.md Collector
Use the `Explore` agent to:
- Find all `AGENTS.md` files in packages mentioned in the prompt
- Extract relevant guidelines and constraints
- Identify package-specific patterns

#### 2.3 Effect Researcher
Use the `effect-researcher` agent (subagent_type=effect-researcher) to:
- Research Effect patterns relevant to the prompt
- Consult Effect documentation via MCP tools
- Identify idiomatic approaches for the task

**Present exploration results** to user:
- Files discovered and their relevance
- Package guidelines collected
- Effect patterns identified

**🔒 AUTHORIZATION GATE**: Request user approval to proceed to refinement

### Phase 3: Initial Refinement

Using the exploration results, create the refined prompt following the **COSTAR+CRISPE hybrid structure**:

```markdown
---
name: <prompt-name>
version: 1
created: <ISO timestamp>
iterations: 0
---

# <Prompt Name> - Refined Prompt

## Context
[Situational details from exploration - codebase structure, relevant files, existing patterns]

## Objective
[Clear, specific task statement derived from original prompt with measurable outcomes]

## Role
[The persona/expertise the agent should embody for this task]

## Constraints
[Repository standards from AGENTS.md, Effect idioms, forbidden patterns, required patterns]

## Resources
[Specific files to read, documentation to consult, tools to use]

## Output Specification
[Exact format, structure, and deliverables expected]

## Examples
[Few-shot examples demonstrating expected input/output if applicable]

## Verification Checklist
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] ...

---

## Metadata

### Research Sources
- Files: [list of files explored]
- Documentation: [Effect docs referenced]
- Packages: [AGENTS.md files consulted]

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
```

**Save** to `.specs/<prompt-name>/<prompt-name>.prompt.md`

**Present** the initial refined prompt to user

**🔒 AUTHORIZATION GATE**: Request user approval to proceed to review loop

### Phase 4: Review Loop (Max 3 Iterations)

For each iteration (until no significant issues OR max 3 reached):

#### 4.1 Critic Phase
Spawn a critic sub-agent to evaluate the refined prompt against:

**Prompt Engineering Checklist**:
- [ ] Context is specific and actionable (not vague)
- [ ] Objective has clear success criteria
- [ ] Role matches the task complexity
- [ ] Constraints are explicit (not implied)
- [ ] Resources are specific file paths (not "relevant files")
- [ ] Output format is precisely specified
- [ ] Examples demonstrate edge cases
- [ ] Verification checklist is comprehensive

**Repository Alignment Checklist**:
- [ ] Effect-first patterns emphasized
- [ ] Forbidden patterns explicitly listed (async/await, native Array methods, etc.)
- [ ] Import conventions specified
- [ ] Error handling approach defined
- [ ] Package boundaries respected

**Clarity Checklist**:
- [ ] No ambiguous pronouns ("it", "this", "that")
- [ ] No assumed knowledge (all context explicit)
- [ ] No conflicting instructions
- [ ] Actionable steps, not abstract goals

The critic produces a structured report:
```markdown
## Critic Report - Iteration N

### Issues Found
1. [SEVERITY: HIGH/MEDIUM/LOW] Description of issue
   - Location: Section X
   - Problem: What's wrong
   - Suggestion: How to fix

### Opportunities for Improvement
1. Description of opportunity
   - Benefit: Why this helps
   - Suggestion: What to add/change

### Verdict
- [ ] PASS - No significant issues, ready for finalization
- [ ] NEEDS_FIXES - Issues found, proceed to fixer
```

#### 4.2 Fixer Phase (if NEEDS_FIXES)
Spawn a fixer sub-agent to:
- Apply all HIGH severity fixes
- Apply MEDIUM severity fixes where beneficial
- Consider LOW severity and opportunities
- Update the iteration count in frontmatter
- Add entry to Refinement History table

**Present** the critic report and fixes applied to user

**Continue loop** or proceed to finalization if PASS or max iterations reached

### Phase 5: Finalization

1. **Final prompt** is at `.specs/<prompt-name>/<prompt-name>.prompt.md`

2. **Present summary**:
   - Total iterations performed
   - Key improvements made
   - Final verification checklist status
   - Path to the refined prompt file

3. **Suggest next steps**:
   - "Use this prompt with: `cat .specs/<prompt-name>/<prompt-name>.prompt.md`"
   - "Or copy the prompt content to use directly"

---

## Critical Rules

1. **NEVER skip authorization gates** - Each gate requires explicit user approval
2. **NEVER modify the original** - `.original.md` is immutable after creation
3. **ALWAYS use parallel agents** where possible (exploration phase)
4. **ALWAYS preserve exploration context** in the refined prompt's Metadata section
5. **ALWAYS increment version** on each refinement iteration
6. **NEVER exceed 3 review iterations** - diminishing returns beyond this

## Error Handling

- If PROMPT_NAME is missing: Ask user to provide it
- If exploration finds no relevant files: Proceed with general best practices, note the gap
- If a sub-agent fails: Report the failure, continue with available information
- If user rejects at any gate: Ask what changes they want before proceeding

---

## Example Invocation

```
/refine-prompt PROMPT_NAME: mock-s3-simulation
I want to create a simulation of uploading a file to s3 using the `createMockS3Layer` in @scratchpad/index.ts using `@effect/platform`.
```

This will:
1. Create `.specs/mock-s3-simulation/`
2. Save original to `.specs/mock-s3-simulation/mock-s3-simulation.original.md`
3. Explore codebase for `scratchpad/index.ts`, `@effect/platform` patterns
4. Generate refined prompt at `.specs/mock-s3-simulation/mock-s3-simulation.prompt.md`
5. Review and iterate up to 3 times
6. Present final refined prompt
