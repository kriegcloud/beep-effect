# Research Report: DSPy-Style Signatures

## Research Parameters
- **Topic**: Programmatic Prompts and Agent Signatures
- **Date**: 2026-01-21
- **Queries Used**:
  - `DSPy signature programmatic prompts examples 2025 2026`
  - `DSPy typescript markdown agents integration non-python 2025`

## Executive Summary

DSPy signatures represent a paradigm shift from "prompting" to "programming" language models. Instead of hand-crafted prompts, developers declare input/output contracts (signatures) and let optimizers find optimal prompt formulations. By December 2025, this approach became standard for enterprise AI. Multiple TypeScript implementations (Ax, TS-DSPy, DSPy.ts) bring these patterns to non-Python stacks, making them applicable to beep-effect's Effect/TypeScript architecture.

## Key Findings

### Finding 1: DSPy Signatures - Declaration Over Implementation

**Source**: [DSPy Official Documentation](https://dspy.ai/learn/programming/signatures/)
**Credibility**: HIGH (Official documentation)
**Summary**: A DSPy signature is a declaration of what a transformation does, not how it's prompted:
- **Simple format**: `"question -> answer"` (string-based)
- **Typed format**: `"question: str -> answer: float"`
- **Class-based**: For complex tasks with docstrings and field metadata

Examples:
- `"document -> summary"`
- `"context, question -> answer"`
- `"baseball_player -> affiliated_team"`

**Relevance to beep-effect**: Agent definitions should include signature-style contracts: "What goes in, what comes out."

---

### Finding 2: The Three Pillars of DSPy (2025)

**Source**: [AI Tools Insights - DSPy Guide 2026](https://aitoolsinsights.com/articles/dspy-programmatic-prompting-guide)
**Credibility**: HIGH (Comprehensive guide)
**Summary**: Three pillars of modern DSPy:
1. **Signatures**: Declarative specification of task behavior
2. **Modules**: Composable units (like neural network layers)
   - `dspy.ChainOfThought`: Adds reasoning steps
   - `dspy.ReAct`: Tool-use loops
3. **Optimizers**: Find optimal instructions/examples
   - `COPRO`: Coordinate ascent over instructions
   - `MIPROv2`: Bayesian optimization over instructions + few-shot

Key benefit: **Model portability**—when new model releases, recompile program to find new optimal instructions.

**Relevance to beep-effect**: Agents can have signatures that describe their behavior, making them composable.

---

### Finding 3: TypeScript Implementation - Ax Framework

**Source**: [Ax (ax-llm/ax) GitHub](https://github.com/ax-llm/ax)
**Credibility**: HIGH (Official repository)
**Summary**: Ax is the "official" DSPy for TypeScript:
- Production-ready, type-safe
- Works with all major LLMs
- Instead of prompts, write signatures

Example:
```typescript
const summarize = new AxChainOfThought<{ document: string }, { summary: string }>();
```

**Relevance to beep-effect**: Could define agent signatures in TypeScript for type-safe composition.

---

### Finding 4: TS-DSPy - Type-Safe LLM Applications

**Source**: [TS-DSPy Medium Article](https://medium.com/@ardada2468/ts-dspy-building-type-safe-llm-apps-with-typescript-9ea3eb894a4f)
**Credibility**: HIGH (Technical tutorial)
**Summary**: TS-DSPy brings structured approach to TypeScript:
- Type-safe agents with strict contracts
- `RespAct` module for autonomous agents
- Built-in tool integration

Features:
- Strong typing for inputs/outputs
- Composable modules
- Agent reasoning + planning + execution

**Relevance to beep-effect**: Aligns with Effect's type-safe philosophy. Agent signatures could use similar patterns.

---

### Finding 5: DSPy.ts - Full Port with Optimizers

**Source**: [DSPy.ts GitHub](https://github.com/ruvnet/dspy.ts)
**Credibility**: MEDIUM (Community project, active development)
**Summary**: DSPy.ts includes:
- Modules: Predict, ChainOfThought, ReAct
- Optimizers: Bootstrap, MIPROv2
- Memory: AgentDB, ReasoningBank, Swarm

Brings full DSPy optimization capabilities to JavaScript ecosystem.

**Relevance to beep-effect**: If automated prompt optimization is desired, DSPy.ts provides the tooling.

---

### Finding 6: Signature Composition Patterns

**Source**: [DSPy Official - Modules](https://dspy.ai/) and [dbreunig - Pipelines](https://www.dbreunig.com/2024/12/12/pipelines-prompt-optimization-with-dspy.html)
**Credibility**: HIGH (Official + technical blog)
**Summary**: Signatures compose through modules:
```python
class MultiHop(dspy.Module):
    def __init__(self, passages_per_hop=3):
        self.retrieve = dspy.Retrieve(k=passages_per_hop)
        self.generate_query = dspy.ChainOfThought("context, question -> search_query")
        self.generate_answer = dspy.ChainOfThought("context, question -> answer")
```

Composition patterns:
- **Sequential**: Output of one becomes input to next
- **Branching**: Conditional routing based on intermediate outputs
- **Looping**: ReAct-style iterate until termination

**Relevance to beep-effect**: Agent pipelines (research → planning → implementation) follow sequential composition.

---

### Finding 7: Markdown Format in DSPy Agents

**Source**: [DSPy Agents Tutorial](https://github.com/stanfordnlp/dspy/blob/main/docs/docs/tutorials/agents/index.ipynb)
**Credibility**: HIGH (Official tutorial)
**Summary**: DSPy agent planning uses Markdown format:
- Top-level steps denoted by `##` headings
- Sub-steps beneath headings
- Structured yet human-readable

**Relevance to beep-effect**: Agent signatures in markdown (not Python/TypeScript) maintain consistency with documentation-first approach.

---

## Cross-Reference Analysis

| Type | Notes |
|------|-------|
| **Consensus** | All sources agree on "declare, don't instruct" principle. Signatures enable model portability. TypeScript implementations are production-ready. |
| **Conflicts** | Python vs TypeScript: DSPy optimizers most mature in Python. TypeScript implementations catching up but may lack some optimization features. |
| **Gaps** | No research on markdown-native signatures (signatures are typically code). Need to design format for documentation-based agents. |

## Practical Examples

### Agent Signature in Markdown Format

```markdown
# Agent: codebase-researcher

## Signature
```
context: { spec_name: string, scope: string[] }
-> findings: { files: string[], patterns: string[], dependencies: string[] }
```

## Description
Explores codebase to understand existing patterns, file structure, and dependencies relevant to a specification.

## Input Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| spec_name | string | yes | Name of the specification |
| scope | string[] | yes | List of directories/files to explore |

## Output Schema
| Field | Type | Description |
|-------|------|-------------|
| files | string[] | Relevant files discovered |
| patterns | string[] | Patterns identified in code |
| dependencies | string[] | Package dependencies relevant to spec |

## Composition
- Can be followed by: `ai-trends-researcher`, `doc-writer`
- Requires: File system access, glob patterns
```

### Signature-Based Agent Mapping Table

| Agent | Signature | Modules Used |
|-------|-----------|--------------|
| `codebase-researcher` | `spec_context -> codebase_findings` | Retrieve, ChainOfThought |
| `ai-trends-researcher` | `research_questions -> validated_sources` | WebSearch, CrossReference |
| `doc-writer` | `findings, template -> documentation` | ChainOfThought, Format |
| `reflector` | `phase_outcome -> structured_reflection` | ChainOfThought, Extract |
| `architecture-pattern-enforcer` | `code_changes -> violation_report` | Retrieve, Validate |

### Composable Agent Pipeline

```markdown
## Pipeline: Research Phase

### Step 1: Scope Discovery
**Agent**: codebase-researcher
**Input**: `{ spec_name: "spec-creation-improvements", scope: ["specs/", "documentation/"] }`
**Output**: `codebase_findings`

### Step 2: External Research (Parallel)
**Agent**: ai-trends-researcher
**Input**: `{ questions: codebase_findings.research_gaps }`
**Output**: `external_sources[]`

### Step 3: Synthesis
**Agent**: doc-writer
**Input**: `{ codebase: codebase_findings, external: external_sources }`
**Output**: `research_report`

### Composition Flow
```
codebase-researcher
        |
        v
ai-trends-researcher (parallel: 3 queries)
        |
        v
   doc-writer
```
```

### TypeScript Signature Types (Conceptual)

```typescript
// Agent signature types for beep-effect agents
import * as S from "effect/Schema";

// codebase-researcher signature
const CodebaseResearcherInput = S.Struct({
  spec_name: S.String,
  scope: S.Array(S.String),
});

const CodebaseResearcherOutput = S.Struct({
  files: S.Array(S.String),
  patterns: S.Array(S.String),
  dependencies: S.Array(S.String),
});

type CodebaseResearcherSignature = {
  input: S.Schema.Type<typeof CodebaseResearcherInput>;
  output: S.Schema.Type<typeof CodebaseResearcherOutput>;
};

// ai-trends-researcher signature
const ResearcherInput = S.Struct({
  questions: S.Array(S.String),
  year_filter: S.optional(S.Literal("2025", "2026")),
});

const ResearcherOutput = S.Struct({
  sources: S.Array(S.Struct({
    url: S.String,
    credibility: S.Literal("HIGH", "MEDIUM", "LOW"),
    summary: S.String,
  })),
});
```

## Recommendations for beep-effect

| Priority | Recommendation | Implementation Notes |
|----------|----------------|---------------------|
| P0 | Define markdown signature format for agents | Input/output tables with types |
| P0 | Add signature section to each agent in `.claude/agents/` | Standardize existing agents |
| P1 | Create composition diagram in SPEC_CREATION_GUIDE.md | Show how agents chain together |
| P1 | Document input/output schemas for all 9 agents | Enable validation and composition |
| P2 | Consider Effect Schema types for agent contracts | Type-safe agent composition |
| P2 | Explore Ax/TS-DSPy for automated optimization | Future enhancement |

## Sources

### High Credibility (7 sources)
- [DSPy Official Documentation](https://dspy.ai/) - Framework reference
- [DSPy Signatures](https://dspy.ai/learn/programming/signatures/) - Signature syntax
- [AI Tools Insights - DSPy Guide 2026](https://aitoolsinsights.com/articles/dspy-programmatic-prompting-guide) - Three pillars
- [Ax GitHub](https://github.com/ax-llm/ax) - TypeScript implementation
- [TS-DSPy Article](https://medium.com/@ardada2468/ts-dspy-building-type-safe-llm-apps-with-typescript-9ea3eb894a4f) - Type-safe agents
- [DSPy Agents Tutorial](https://github.com/stanfordnlp/dspy/blob/main/docs/docs/tutorials/agents/index.ipynb) - Official tutorial
- [dbreunig - Pipelines](https://www.dbreunig.com/2024/12/12/pipelines-prompt-optimization-with-dspy.html) - Composition patterns

### Medium Credibility
- [DSPy.ts GitHub](https://github.com/ruvnet/dspy.ts) - Community TypeScript port
- [DigitalOcean - DSPy](https://www.digitalocean.com/community/tutorials/prompting-with-dspy) - Tutorial
- [LangWatch - Framework Comparison](https://langwatch.ai/blog/best-ai-agent-frameworks-in-2025-comparing-langgraph-dspy-crewai-agno-and-more) - Context
