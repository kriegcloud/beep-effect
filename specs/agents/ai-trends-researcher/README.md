# AI Trends Researcher Agent Spec

> Agent specification for orchestrating research, planning, and implementation of the `ai-trends-researcher` agent.

---

## Overview

The `ai-trends-researcher` agent is a specialized web research and synthesis agent that keeps the beep-effect monorepo's AI infrastructure on the bleeding edge. It researches emerging trends, validates best practices, and produces actionable reports that improve other agents in the ecosystem.

---

## Purpose

1. **Research**: Use web search to discover emerging AI trends, frameworks, and best practices
2. **Report Production**: Generate research reports tailored to existing agents
3. **Artifact Creation**: Create Claude Code skills, rules, commands, and agents
4. **Recommendations**: Identify improvement opportunities for agent-related documents
5. **Benchmarking**: Compare repository `.claude/` configuration against latest trends

---

## Target Location

`.claude/agents/ai-trends-researcher.md`

---

## Success Criteria

- [x] Agent definition created with embedded knowledge base
- [x] Comprehensive keyword/search term dataset included
- [x] Source URLs and documentation links compiled
- [x] Research methodology defined with output templates
- [x] Integration with existing agents documented
- [x] Sample research tasks demonstrated

---

## Dependencies

### Required Reading
- `.claude/agents/web-researcher.md` - Base research patterns
- `.claude/agents/mcp-researcher.md` - MCP tool patterns
- `.claude/agents/prompt-refiner.md` - Prompt improvement methodology
- `.claude/agents/reflector.md` - Meta-learning patterns
- `specs/SPEC_CREATION_GUIDE.md` - Spec workflow patterns

### Tools Required
- `WebSearch` - Primary research tool
- `WebFetch` - Content extraction from URLs
- `Read`, `Glob`, `Grep` - Codebase analysis
- `Write`, `Edit` - Artifact creation

---

## Agent Capabilities

### 1. Trend Research Domains

| Domain | Focus Areas |
|--------|-------------|
| **Prompting** | CoT, ToT, ReAct, meta-prompting, DSPy, structured outputs |
| **Agentic Workflows** | Multi-agent orchestration, LangGraph, CrewAI, AutoGen |
| **Context Engineering** | Memory systems, RAG variants, chunking, compression |
| **Claude Code** | Skills, hooks, subagents, MCP integration, checkpoints |
| **MCP Ecosystem** | Server development, registry, best practices |
| **Repository AI-Friendliness** | CLAUDE.md, AGENTS.md, llms.txt patterns |

### 2. Report Types

| Report Type | Target Audience |
|-------------|-----------------|
| **Agent Improvement** | Specific agents (prompt-refiner, reflector, etc.) |
| **Trend Analysis** | Maintainers and architects |
| **Best Practice Update** | All contributors |
| **Configuration Audit** | Repository configuration files |

### 3. Artifact Creation

- `.claude/skills/*.md` - Reusable skill modules
- `.claude/rules/*.md` - Focused rule files
- `.claude/commands/*.md` - Slash commands
- `.claude/agents/*.md` - New agent definitions

---

## Implementation Phases

### Phase 1: Research (Discovery)
- Execute targeted web searches using keyword database
- Cross-reference multiple authoritative sources
- Extract key insights and validate credibility

### Phase 2: Synthesis (Analysis)
- Compile findings into structured format
- Identify patterns and emerging consensus
- Note gaps and conflicting information

### Phase 3: Production (Output)
- Generate reports using defined templates
- Create/update artifacts as needed
- Document recommendations with rationale

### Phase 4: Integration (Handoff)
- Update REFLECTION_LOG with learnings
- Notify relevant agents of new research
- Track adoption of recommendations

---

## Related Files

- [ai-trends-researcher.original.md](./ai-trends-researcher.original.md) - Original prompt
- [ai-trends-researcher.prompt.md](./ai-trends-researcher.prompt.md) - Refined specification with embedded knowledge base
- [templates/](./templates/) - Report templates
  - `research-report.template.md` - General research report format
  - `agent-improvement.template.md` - Agent enhancement report format
  - `config-audit.template.md` - Configuration audit report format

---

## Created Artifacts

### Agent Definition
**Location**: `.claude/agents/ai-trends-researcher.md` (443 lines)

**Features**:
- Embedded knowledge base with 7 research domains
- 100+ keywords and search terms
- 30+ authoritative source URLs
- 3 output templates
- Integration with 5 existing agents

### Spec Files
```
specs/agents/ai-trends-researcher/
├── README.md                              # This file
├── REFLECTION_LOG.md                      # Learnings from creation
├── ai-trends-researcher.original.md       # Original request
├── ai-trends-researcher.prompt.md         # Refined spec (665 lines)
└── templates/
    ├── research-report.template.md        # Research output format
    ├── agent-improvement.template.md      # Agent enhancement format
    └── config-audit.template.md           # Config audit format
```

---

## Usage Examples

### Research a Topic
```
"Research the latest context engineering techniques for AI agents"
```

### Improve an Agent
```
"Research prompting best practices and suggest improvements to the prompt-refiner agent"
```

### Audit Configuration
```
"Compare our .claude/ configuration to the latest Claude Code best practices"
```

### Create an Artifact
```
"Create a skill for MCP server development patterns"
```
