# RLM Prompting Research: Encouraging Recursive Decomposition

## Problem Statement

Our RLM system exposes `llm_query(query, context?)` for recursive sub-calls, but the model never uses it. Investigation confirmed the pipeline is intact — the issue is prompt-level. The model solves everything with code, even semantic tasks where `llm_query` would be more appropriate.

This document synthesizes research from the original RLM paper, existing implementations, and prompting literature to identify concrete improvements.

---

## 1. Reference RLM Implementation (Zhang et al.)

**Source**: [arxiv.org/abs/2512.24601](https://arxiv.org/abs/2512.24601), [github.com/alexzhang13/rlm](https://github.com/alexzhang13/rlm), [alexzhang13.github.io/blog/2025/rlm/](https://alexzhang13.github.io/blog/2025/rlm/)

### System Prompt (verbatim from `rlm/utils/prompts.py`)

```
You are tasked with answering a query with associated context. You can access,
transform, and analyze this context interactively in a REPL environment that can
recursively query sub-LLMs, which you are strongly encouraged to use as much as
possible. You will be queried iteratively until you provide a final answer.

The REPL environment is initialized with:
1. A `context` variable that contains extremely important information about your
   query. You should check the content of the `context` variable to understand
   what you are working with. Make sure you look through it sufficiently as you
   answer your query.
2. A `llm_query` function that allows you to query an LLM (that can handle
   around 500K chars) inside your REPL environment.
3. A `llm_query_batched` function that allows you to query multiple prompts
   concurrently: `llm_query_batched(prompts: List[str]) -> List[str]`. This is
   much faster than sequential `llm_query` calls when you have multiple
   independent queries. Results are returned in the same order as the input
   prompts.
4. A `SHOW_VARS()` function that returns all variables you have created in the
   REPL. Use this to check what variables exist before using FINAL_VAR.
5. The ability to use `print()` statements to view the output of your REPL code
   and continue your reasoning.

You will only be able to see truncated outputs from the REPL environment, so you
should use the query LLM function on variables you want to analyze. You will
find this function especially useful when you have to analyze the semantics of
the context. Use these variables as buffers to build up your final answer.

Make sure to explicitly look through the entire context in REPL before answering
your query. An example strategy is to first look at the context and figure out a
chunking strategy, then break up the context into smart chunks, and query an LLM
per chunk with a particular question and save the answers to a buffer, then query
an LLM with all the buffers to produce your final answer.

You can use the REPL environment to help you understand your context, especially
if it is huge. Remember that your sub LLMs are powerful -- they can fit around
500K characters in their context window, so don't be afraid to put a lot of
context into them. For example, a viable strategy is to feed 10 documents per
sub-LLM query. Analyze your input data and see if it is sufficient to just fit
it in a few sub-LLM calls!
```

### Key Differences from Our Prompt

| Aspect | Reference RLM | Our Implementation |
|--------|--------------|-------------------|
| Tone toward sub-calls | "**strongly encouraged to use as much as possible**" | "PREFER CODE OVER SUB-CALLS" |
| Output truncation | 20,000 chars max — **forces** `llm_query` for semantic analysis | No truncation limit forcing delegation |
| Context visibility | Context is never in the prompt; only metadata (type, total length, chunk sizes) | Context preview in prompt via `__vars.context` |
| Sub-call capacity | "sub LLMs can fit around 500K characters" — encourages large delegation | "Sub-LLMs can handle large context" — vague |
| Few-shot examples | 4 in-context code examples showing chunking + llm_query patterns | None |
| Batched queries | `llm_query_batched(prompts)` for concurrent sub-calls | Not available |
| Strategy guidance | Explicit chunking strategy described in system prompt | None |

### Reference RLM's Four In-Context Examples

**Example 1 — Simple chunk + query:**
```python
chunk = context[:10000]
answer = llm_query(f"What is the magic number? Here is the chunk: {chunk}")
print(answer)
```

**Example 2 — Iterative section processing with state tracking:**
```python
for i, section in enumerate(context):
    if i == len(context) - 1:
        buffer = llm_query(f"Last section. So far: {buffers}. Answer {query}. Section: {section}")
    else:
        buffer = llm_query(f"Section {i}/{len(context)}. Gather info for {query}. Section: {section}")
    print(f"After section {i}: {buffer}")
```

**Example 3 — Batched concurrent processing:**
```python
chunk_size = len(context) // 10
chunks = [context[i*chunk_size:(i+1)*chunk_size] for i in range(10)]
prompts = [f"Answer {query} from this chunk:\n{chunk}" for chunk in chunks]
answers = llm_query_batched(prompts)
final = llm_query(f"Aggregate answers for {query}:\n" + "\n".join(answers))
```

**Example 4 — Semantic chunking by structure:**
```python
sections = re.split(r'### (.+)', context["content"])
buffers = []
for i in range(1, len(sections), 2):
    summary = llm_query(f"Summarize this {sections[i]} section: {sections[i+1]}")
    buffers.append(f"{sections[i]}: {summary}")
final = llm_query(f"Based on summaries, answer {query}:\n" + "\n".join(buffers))
```

### Per-Iteration User Prompt

**Iteration 0 (first turn):**
```
You have not interacted with the REPL environment or seen your prompt / context
yet. Your next action should be to look through and figure out how to answer the
prompt, so don't just provide a final answer yet.

Think step-by-step on what to do using the REPL environment (which contains the
context) to answer the original prompt: "{root_prompt}".
```

**Subsequent iterations:**
```
The history before is your previous interactions with the REPL environment.
Think step-by-step on what to do using the REPL environment (which contains the
context) to answer the original prompt: "{root_prompt}".
```

### Metadata Prompt (injected as assistant message)

```
Your context is a {context_type} with {context_total_length} total characters,
and is broken up into chunks of char lengths: {context_lengths}.
```

This tells the model the shape and size of its data without putting actual data in context.

### The Forcing Function: Output Truncation

REPL output is truncated to **20,000 characters**. This is the single most important design decision — the model literally **cannot** read its context directly through print output. It is forced to use `llm_query` for any semantic analysis of large data.

### The Qwen Cautionary Tale

The paper (Appendix B) found that Qwen3-Coder, when given the same prompt designed for GPT-5, "will try to perform a subcall on everything, leading to thousands of LM subcalls for basic tasks." Different models need different levels of encouragement/restraint in the prompt.

---

## 2. Our Current Prompt Analysis

**Source**: `src/SystemPrompt.ts`

### What the Model Sees About `llm_query`

Only 5 lines (shown when `depth < maxDepth` and not strict mode):

```
## Recursive Sub-calls
`const result = await llm_query(query, context?)` — ask a sub-LLM for semantic
analysis. Returns a string.
- MUST use `await` — without it you get `[object Promise]`, not the answer.
- Each call counts against your LLM call budget.
- Sub-LLMs can handle large context. Pass data as the second argument, not
  embedded in the query.
- Use for semantic tasks (summarization, classification). Use code for mechanical
  tasks (search, count, filter).
```

### Rule 8: The Anti-Pattern

```
8. PREFER CODE OVER SUB-CALLS — Use code for aggregation, filtering, and string
   manipulation. Reserve llm_query for tasks that require semantic understanding.
```

This is the **opposite** of the reference RLM's "strongly encouraged to use as much as possible." The model reads "prefer code" and interprets it as "always use code."

### Prompt Real Estate Imbalance

- Code execution / REPL protocol: ~25 lines of documentation
- `llm_query`: ~5 lines
- Tools section: ~5 lines per tool
- No few-shot examples showing `llm_query` usage
- No chunking strategy guidance
- No anti-pattern warnings about misusing code for semantic tasks

### No Planning Phase

Our prompt has Rule 1 ("EXPLORE FIRST") and Rule 2 ("ITERATE"), but no requirement to **plan and classify sub-tasks** before executing. The model jumps straight to code.

### No Output Truncation Forcing Function

Unlike the reference RLM (20K char limit), our system has no truncation that forces the model to delegate semantic analysis. The model can print entire datasets and try to reason over them in-context.

---

## 3. Prompting Literature: Strategies for Decomposition

### 3.1 Plan-and-Solve Prompting (PS/PS+)

**Citation**: Wang et al., "Plan-and-Solve Prompting: Improving Zero-Shot Chain-of-Thought Reasoning" (ACL 2023) — [arxiv.org/abs/2305.04091](https://arxiv.org/abs/2305.04091)

**Core template:**
> "Let's first understand the problem and devise a plan to solve the problem. Then, let's carry out the plan and solve the problem step by step."

**Extended (PS+):**
> "Let's first understand the problem, extract relevant variables and their corresponding numerals, and devise a plan. Then, let's carry out the plan, calculate intermediate results, solve the problem step by step, and show the answer."

**Adaptation**: Add a mandatory planning phase that classifies sub-tasks by tool type.

### 3.2 Least-to-Most Prompting

**Citation**: Zhou et al., "Least-to-Most Prompting Enables Complex Reasoning in Large Language Models" (ICLR 2023) — [arxiv.org/abs/2205.10625](https://arxiv.org/abs/2205.10625)

**Two-stage process:**
1. Decomposition: "What subproblems must be solved before answering this?"
2. Sequential solving: Each subproblem's solution feeds into the next.

**Adaptation**: Add decomposition instructions — for each subproblem, classify as MECHANICAL (code) or SEMANTIC (llm_query).

### 3.3 ReAct Prompting

**Citation**: Yao et al., "ReAct: Synergizing Reasoning and Acting in Language Models" (ICLR 2023) — [promptingguide.ai/techniques/react](https://www.promptingguide.ai/techniques/react)

**Template:**
```
Thought: I need to find information about X.
Action: [code or llm_query]
Observation: [output]
Thought: Based on that, I now need to...
```

**Adaptation**: Structure each iteration response as THOUGHT → CODE, forcing the model to reason about tool selection before acting.

### 3.4 Metacognitive Prompting

**Citation**: Wang & Zhao, "Metacognitive Prompting Improves Understanding in Large Language Models" (2023) — [arxiv.org/pdf/2308.05342](https://arxiv.org/pdf/2308.05342)

**Five stages:**
1. Understand the input
2. Make a preliminary judgment
3. Critically evaluate the preliminary analysis
4. Reach a final decision
5. Evaluate confidence

**Adaptation**: Add a complexity self-assessment — "Am I trying to do semantic analysis with string matching? That's the wrong tool."

### 3.5 Divide-and-Conquer Prompting

**Citation**: [arxiv.org/abs/2402.05359](https://arxiv.org/abs/2402.05359) (2024)

Split input, process parts, aggregate results. Directly maps to the RLM chunking pattern.

### 3.6 Self-Planning Code Generation

**Citation**: [arxiv.org/abs/2303.06689](https://arxiv.org/abs/2303.06689) (2023)

Plan steps before generating code. Separates the "what" from the "how."

---

## 4. Tool Usage Research: Why Models Ignore Tools

**Sources**:
- [Arsturn: "LLM Ignores Tools? A Complete Troubleshooting Guide"](https://www.arsturn.com/blog/llm-ignores-tools-troubleshooting-guide)
- [ArXiv: "Achieving Tool Calling Functionality in LLMs Using Only Prompt Engineering"](https://arxiv.org/html/2407.04997v1)

### Root Causes of Tool Avoidance

1. **Prompt real estate bias**: The tool with the most documentation gets used most. Our code sandbox has 25+ lines; `llm_query` has 5.
2. **Vague tool descriptions**: "Use for semantic tasks" is too abstract. Models need concrete decision criteria.
3. **Instruction ordering**: Rules listed last carry disproportionate weight. Rule 8 ("PREFER CODE") is the closing instruction.
4. **No examples of tool use**: Without few-shot examples showing `llm_query` succeeding, the model has no template to follow.
5. **No anti-patterns**: The model doesn't know what *not* to do — e.g., using regex to approximate sentiment analysis.

### Practical Fixes from Literature

- **Name the tool explicitly** in instructions instead of using abstract descriptions
- **Equal or greater prompt space** for the underused tool
- **Concrete decision trees** instead of vague guidance ("when X, use Y" not "prefer Y for Z-type tasks")
- **Few-shot examples** showing the tool being used successfully
- **Anti-pattern warnings** calling out the specific mistake

---

## 5. Agent Framework Delegation Patterns

### CrewAI: Role-Based Delegation

**Source**: [docs.crewai.com/en/concepts/agents](https://docs.crewai.com/en/concepts/agents)

Each agent has a role, goal, and backstory. Delegation is based on **expertise matching**, not task complexity. Frame `llm_query` as a specialist:

```
You are the COORDINATOR. You have:
1. CODE SANDBOX: Your hands. Use for mechanical data operations.
2. llm_query(): Your ANALYST. Understands language, meaning, and nuance.
A good coordinator delegates semantic analysis to the analyst.
```

### LangChain: Plan-and-Execute

**Source**: [blog.langchain.com/planning-agents/](https://blog.langchain.com/planning-agents/)

Separate planning from execution entirely:
1. Planner produces a list of steps with tool classification
2. Executor carries out each step
3. After each step, planner re-evaluates

### Google Research: Scaling Agent Systems

**Source**: [arxiv.org/html/2512.08296v1](https://arxiv.org/html/2512.08296v1) (2025)

Key finding: Delegation helps when tasks require **specialized reasoning** that a single agent handles poorly. Delegation hurts when coordination overhead exceeds the benefit. The optimal architecture delegates intelligently, not maximally.

### Strategic Delegation

**Source**: [openreview.net/pdf?id=gC3D2ESSyK](https://openreview.net/pdf?id=gC3D2ESSyK)

> "Assigning the right task to the right tool — be it a heuristic algorithm or LLM — is far more effective than either a 'one-size-fits-all' LLM approach or misapplication of powerful LLM reasoning to problems that don't require it."

---

## 6. Concrete Recommendations

### 6.1 Reframe Rule 8

**Current:**
```
8. PREFER CODE OVER SUB-CALLS — Use code for aggregation, filtering, and
   string manipulation. Reserve llm_query for tasks that require semantic
   understanding.
```

**Proposed:**
```
8. MATCH TOOL TO TASK — Code for mechanical operations (count, filter, regex,
   math, format conversion). llm_query() for semantic operations (summarize,
   classify, compare, explain, assess sentiment). If you're writing string-matching
   heuristics to approximate understanding, use llm_query() instead.
```

### 6.2 Add a Planning Requirement

Insert before the Rules section:

```
## Strategy: Plan Before You Code
Before writing your first code block, briefly state:
1. What sub-tasks does this query require?
2. For each: is it MECHANICAL (code) or SEMANTIC (llm_query)?
3. What is the execution order?

This plan is required on your first iteration. Do not skip it.
```

### 6.3 Expand the Recursive Sub-calls Section

Replace the current 5-line section with:

```
## Recursive Sub-calls
`const result = await llm_query(query, context?)` — delegates to a sub-LLM
for semantic analysis. Returns a string. You are strongly encouraged to use
this for any task requiring understanding of meaning.

- MUST use `await` — without it you get `[object Promise]`, not the answer.
- Each call counts against your LLM call budget.
- Sub-LLMs are powerful — they can handle very large context. Pass data as
  the second argument, not embedded in the query string.

### When to Use llm_query() (MUST use)
- Summarization or paraphrasing
- Classification or categorization
- Sentiment or tone analysis
- Comparing ideas, arguments, or positions
- Answering "why" or "how" questions about text content
- Extracting structured facts from unstructured prose
- Any task where string matching would be an approximation

### When to Use Code (MUST use)
- Counting, measuring lengths, arithmetic
- Exact string or regex matching
- Sorting, filtering, deduplication
- Data format transformation (JSON parsing, etc.)

### Chunking Strategy
For large contexts, use code to chunk and llm_query to analyze:
1. Examine the data structure with code (length, format, schema)
2. Split into manageable chunks with code
3. Use llm_query() per chunk for semantic analysis
4. Aggregate results with code or a final llm_query() call
```

### 6.4 Add Few-Shot Examples

Add after the Recursive Sub-calls section:

```
## Example: Analyzing a Large Dataset

Query: "What are the main political themes in these posts?"

Step 1 — Explore the data:
```js
print(typeof __vars.context)
print(__vars.context.length)
print(__vars.context.slice(0, 500))
```

Step 2 — Chunk and delegate to llm_query:
```js
const data = __vars.context
const chunkSize = 40000
const chunks = []
for (let i = 0; i < data.length; i += chunkSize) {
  chunks.push(data.slice(i, i + chunkSize))
}
const themes = []
for (const chunk of chunks) {
  const analysis = await llm_query(
    "What political themes appear in these posts? List them briefly.",
    chunk
  )
  themes.push(analysis)
}
__vars.themes = themes
print(themes.join('\n---\n'))
```

Step 3 — Synthesize:
```js
const combined = __vars.themes.join('\n\n')
const synthesis = await llm_query(
  "Synthesize these per-chunk theme analyses into a unified list of major themes.",
  combined
)
print(synthesis)
```

Step 4 — SUBMIT({ answer: synthesis })
```

### 6.5 Add Anti-Pattern Warnings

```
## Anti-Patterns (DO NOT DO THIS)
- Do NOT use regex or keyword matching to detect sentiment
- Do NOT use string matching to summarize text
- Do NOT use word frequency to classify topics
- Do NOT write > 15 lines of string heuristics when one llm_query() call works
These are semantic tasks. Use llm_query().
```

### 6.6 Consider Output Truncation as a Forcing Function

The reference RLM truncates REPL output to 20,000 characters. This is arguably the most powerful mechanism — the model literally cannot see raw context and must delegate semantic analysis to sub-LLMs.

We could implement a configurable `maxOutputChars` that truncates sandbox output in the transcript, adding a message like:

```
[Output truncated at 20000 chars. Use llm_query() to analyze large data
 instead of printing it.]
```

This doesn't affect the sandbox itself (variables still hold full data), only what the model sees in its context window.

### 6.7 Consider `llm_query_batched` for Concurrent Sub-calls

The reference RLM has `llm_query_batched(prompts)` for concurrent processing. This would map naturally to our bridge call system — multiple sub-calls dispatched in parallel. This reduces the "cost" of using sub-calls (faster wall-clock time), making the model less reluctant to use them.

---

## 7. Priority Order for Implementation

| Priority | Change | Effort | Expected Impact |
|----------|--------|--------|-----------------|
| 1 | Reframe Rule 8 ("MATCH TOOL TO TASK") | Trivial | Removes the "prefer code" bias |
| 2 | Expand llm_query documentation with decision criteria | Small | Gives model concrete when-to-use guidance |
| 3 | Add few-shot example showing chunk + query pattern | Small | Provides template to follow |
| 4 | Add anti-pattern warnings | Small | Prevents the specific mistake |
| 5 | Add planning requirement (first iteration) | Small | Forces decomposition before execution |
| 6 | Output truncation forcing function | Medium | Forces delegation for large contexts |
| 7 | `llm_query_batched` support | Medium | Reduces cost of sub-call usage |

---

## 8. References

| Source | Key Insight |
|--------|-------------|
| [Zhang et al. 2025 — RLM Paper](https://arxiv.org/abs/2512.24601) | "Strongly encouraged to use llm_query as much as possible"; output truncation as forcing function |
| [Zhang Blog Post](https://alexzhang13.github.io/blog/2025/rlm/) | Four in-context examples; metadata-only context design |
| [github.com/alexzhang13/rlm](https://github.com/alexzhang13/rlm) | Production system prompt; per-model calibration needed |
| [github.com/alexzhang13/rlm-minimal](https://github.com/alexzhang13/rlm-minimal) | Minimal implementation; same core prompt |
| [Wang et al. 2023 — Plan-and-Solve](https://arxiv.org/abs/2305.04091) | Force planning before execution |
| [Zhou et al. 2023 — Least-to-Most](https://arxiv.org/abs/2205.10625) | Decompose into ordered subproblems |
| [Yao et al. 2023 — ReAct](https://www.promptingguide.ai/techniques/react) | Interleave reasoning with action |
| [Wang & Zhao 2023 — Metacognitive](https://arxiv.org/pdf/2308.05342) | Self-assess before committing to an approach |
| [Divide-and-Conquer Prompting 2024](https://arxiv.org/abs/2402.05359) | Split input, process parts, aggregate |
| [Self-Planning Code Generation 2023](https://arxiv.org/abs/2303.06689) | Plan steps before generating code |
| [Arsturn — Tool Avoidance Guide](https://www.arsturn.com/blog/llm-ignores-tools-troubleshooting-guide) | Name tools explicitly; equal prompt space; concrete decision criteria |
| [Tool Calling via Prompting 2024](https://arxiv.org/html/2407.04997v1) | Clear tool definitions + when-to-use criteria |
| [Google Research 2025 — Scaling Agents](https://arxiv.org/html/2512.08296v1) | Delegate when task needs specialized reasoning |
| [Strategic Delegation (OpenReview)](https://openreview.net/pdf?id=gC3D2ESSyK) | Right tool for right task beats one-size-fits-all |
| [CrewAI Docs](https://docs.crewai.com/en/concepts/agents) | Role-based delegation with expertise matching |
| [LangChain Plan-and-Execute](https://blog.langchain.com/planning-agents/) | Separate planner from executor |
| [Prime Intellect — RLM: The Paradigm of 2026](https://www.primeintellect.ai/blog/rlm) | RLM overview and industry context |
