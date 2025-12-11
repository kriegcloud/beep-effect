# Research Orchestration Skill

Deploy parallel research sub-agents to gather comprehensive intelligence for complex tasks, then compile findings into a production-ready prompt file for implementation.

## When to Use This Skill

Invoke this skill when:
- User needs comprehensive research before implementing a complex feature
- User wants to understand a topic from multiple angles (codebase, docs, web)
- User mentions wanting a "research phase" or "gather context" before coding
- User asks to "understand", "analyze", or "investigate" a technical topic
- User wants to create a detailed implementation plan with supporting research
- Task requires coordinating multiple research dimensions (architecture, patterns, conventions)

## Two-Level Indirection Pattern

This skill implements a **meta-orchestration** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│  Level 1: Research Orchestration (this skill)              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Deploy parallel research agents                     │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │   │
│  │  │ A1  │ │ A2  │ │ A3  │ │ A4  │ │ A5  │ │ A6  │   │   │
│  │  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘   │   │
│  │     │       │       │       │       │       │       │   │
│  │     └───────┴───────┴───┬───┴───────┴───────┘       │   │
│  │                         ▼                           │   │
│  │              Compile Research Findings              │   │
│  │                         │                           │   │
│  │                         ▼                           │   │
│  │              Generate PROMPT FILE                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Level 2: Implementation (separate session)                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  New Claude instance reads PROMPT FILE               │   │
│  │  Executes implementation with full context           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Input Format

User provides a task description with optional focus areas:

```
RESEARCH_TASK: <kebab-case-name>
<description of what needs to be researched/implemented>

FOCUS_AREAS: (optional)
- area 1
- area 2
```

## Workflow Overview

| Phase | Name | Key Actions |
|-------|------|-------------|
| 1 | Initialization | Parse input, identify research dimensions |
| 2 | Agent Deployment | Deploy 4-8 parallel research agents |
| 3 | Synthesis | Collect findings, identify patterns |
| 4 | Compilation | Generate implementation prompt file |
| 5 | Finalization | Present prompt, suggest next steps |

## Phase 1: Initialization

1. **Parse the input** to extract:
   - `RESEARCH_TASK` - the task identifier
   - Task description - what needs to be researched
   - Focus areas - specific dimensions to investigate (optional)

2. **Identify research dimensions** based on task:
   - Codebase patterns (existing implementations)
   - Package conventions (AGENTS.md guidelines)
   - Effect patterns (idiomatic approaches)
   - Architecture patterns (hexagonal, layered, etc.)
   - External documentation (libraries, APIs)
   - Similar implementations (web search)

3. **Create output directory**: `.claude/prompts/`

4. **Present research plan** to user:
   - Show identified dimensions
   - Show proposed agents to deploy
   - Estimate parallel vs sequential work

**AUTHORIZATION GATE**: Request user approval for agent deployment

## Phase 2: Agent Deployment

Deploy research agents **in parallel** using the Task tool:

> **Reference**: See `AGENT_DEPLOYMENT.md` for agent configurations and strategies.

### Standard Agent Set (adjust based on task)

| Agent | Subagent Type | Focus |
|-------|---------------|-------|
| Codebase Auditor | `Explore` | Find existing patterns, file structure |
| AGENTS.md Scanner | `Explore` | Collect package guidelines |
| Effect Researcher | `effect-researcher` | Effect-specific patterns |
| Architecture Analyst | `Explore` | Identify architectural patterns |
| Documentation Fetcher | `general-purpose` | External docs via WebFetch |
| Pattern Researcher | `general-purpose` | Web search for best practices |

### Deployment Rules

1. **Launch all agents in a single message** with multiple Task tool calls
2. **Use `run_in_background: true`** for all agents
3. **Specify thoroughness**: "very thorough" for complex tasks
4. **Include clear deliverables** in each agent prompt

### Agent Prompt Template

```
Research [DIMENSION] for [TASK_NAME]:

Context: [Brief task description]

Your mission:
1. [Specific research goal 1]
2. [Specific research goal 2]
3. [Specific research goal 3]

Deliverables:
- List of relevant files/patterns found
- Key insights and recommendations
- Code examples if applicable
- Potential issues or concerns

Focus on: [Specific focus area]
```

**Wait for all agents** to complete using AgentOutputTool

**Present intermediate results** to user:
- Summary of findings from each agent
- Any conflicts or gaps identified
- Proposed synthesis approach

**AUTHORIZATION GATE**: Request user approval to proceed to synthesis

## Phase 3: Synthesis

Analyze and combine findings from all agents:

### 3.1 Pattern Identification
- Common patterns across findings
- Contradictions to resolve
- Gaps to acknowledge

### 3.2 Constraint Extraction
- Forbidden patterns (from AGENTS.md, Effect idioms)
- Required patterns (from codebase conventions)
- Package boundaries

### 3.3 Resource Compilation
- Specific files to reference
- Documentation links
- Example implementations

### 3.4 Risk Assessment
- Potential pitfalls identified
- Edge cases to consider
- Dependencies to manage

**Present synthesis** to user:
- Consolidated insights
- Proposed implementation approach
- Key decisions to highlight

**AUTHORIZATION GATE**: Request user approval to generate prompt file

## Phase 4: Compilation

Generate the implementation prompt file:

> **Reference**: See `PROMPT_TEMPLATE.md` for the complete template structure.

### Output Location
`.claude/prompts/<research-task>-orchestration.md`

### Prompt File Structure

```markdown
---
task: <research-task>
generated: <ISO timestamp>
research_agents: <count>
synthesis_confidence: high|medium|low
---

# <Task Name> - Implementation Prompt

## Mission
[Clear implementation objective derived from research]

## Context from Research
[Synthesized findings organized by dimension]

## Implementation Strategy
[Step-by-step approach based on research]

## Constraints & Conventions
[All forbidden/required patterns]

## Resources
[Files, docs, examples to reference]

## Verification Checklist
[Success criteria derived from research]

---

## Research Appendix

### Agent Summaries
[Key findings from each agent]

### Files Discovered
[Categorized list of relevant files]

### External Resources
[Links to documentation, articles]
```

**Save** the prompt file

**Present** the generated prompt to user

## Phase 5: Finalization

1. **Present summary**:
   - Number of agents deployed
   - Key findings synthesized
   - Prompt file location

2. **Suggest next steps**:
   - "Start a new session and paste this prompt"
   - "Or use: `cat .claude/prompts/<task>-orchestration.md`"
   - "The implementation agent will have full context"

3. **Optional**: Ask if user wants to proceed with implementation in current session

## Critical Rules

1. **ALWAYS deploy agents in parallel** - Never sequential unless dependencies exist
2. **ALWAYS use background agents** - `run_in_background: true`
3. **NEVER skip synthesis** - Raw findings need consolidation
4. **ALWAYS preserve research sources** - Include in appendix
5. **NEVER generate implementation prompt without research** - Research first
6. **ALWAYS respect authorization gates** - User approval required

## Error Handling

| Scenario | Action |
|----------|--------|
| Agent fails | Note failure, continue with other agents |
| No relevant files found | Broaden search, note gap in prompt |
| Conflicting findings | Present conflict to user, ask for guidance |
| Web search blocked | Use cached knowledge, note limitation |

## Example Invocation

```
RESEARCH_TASK: runtime-server-refactoring
I need to refactor the runtime server package to follow hexagonal architecture with proper Effect Layer composition. The current structure mixes concerns.

FOCUS_AREAS:
- Effect Layer composition patterns
- Hexagonal/ports-adapters architecture
- Current runtime/server package structure
- Effect RPC patterns
```

This will:
1. Deploy 6 parallel agents researching each dimension
2. Synthesize findings into coherent strategy
3. Generate `.claude/prompts/runtime-server-refactoring-orchestration.md`
4. Present prompt for use in implementation session
