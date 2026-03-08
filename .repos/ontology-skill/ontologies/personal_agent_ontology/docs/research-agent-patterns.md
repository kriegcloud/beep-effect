# Research Report: AI Coding Agent Architectures and Patterns for Personal Agent Ontology

## Executive Summary

This report analyzes the architecture of modern AI coding agents -- particularly
Anthropic's Claude Code and the Claude Agent SDK -- to identify the key
concepts, relationships, and patterns that a personal agent ontology must
capture. The analysis covers seven domains: (1) Claude Code's architecture,
(2) the Agent SDK's structure, (3) tool use patterns, (4) session management,
(5) agentic patterns, (6) memory systems, and (7) ontological requirements
derived from these patterns.

The central finding is that modern coding agents are built around a **single-
threaded agent loop** ("think, act, observe, repeat") with a rich ecosystem of
**context engineering** mechanisms layered on top: hierarchical memory files,
automatic context compaction, session persistence, tool sandboxing, sub-agent
delegation, and hook-based lifecycle interception. A personal agent ontology
must model not just the conversation transcript, but the entire **control
architecture** -- sessions, turns, tool invocations, memory layers, plans,
permissions, and the governance constraints that bind them together.

---

## 1. Claude Code Architecture

### 1.1 The Master Agent Loop

Claude Code is built around what Anthropic internally calls the "nO" loop -- a
single-threaded master agent loop that implements a classic while-loop pattern.
The operational flow is:

```
User Input -> Model Analysis -> Tool Decision -> Tool Execution -> Result Feedback -> ... -> Final Answer -> User
```

The loop continues as long as the model's responses include tool calls. This is
deliberately simple: while competitors pursue multi-agent swarms and complex
orchestration, Anthropic built a single-threaded loop that does one thing well:
think, act, observe, repeat.

Sources:
- [Claude Code: Behind-the-scenes of the master agent loop](https://blog.promptlayer.com/claude-code-behind-the-scenes-of-the-master-agent-loop/)
- [Claude Code Agent Architecture: Single-Threaded Master Loop](https://www.zenml.io/llmops-database/claude-code-agent-architecture-single-threaded-master-loop-for-autonomous-coding)

### 1.2 System Prompt Structure

The system prompt is the foundational context that shapes Claude Code's
behavior. It consists of:

1. **Identity declaration**: "You are Claude Code, Anthropic's official CLI
   for Claude" (or "You are a Claude agent, built on Anthropic's Claude Agent
   SDK" for SDK-based agents).
2. **Main agent system prompt**: Behavioral instructions, capabilities, and
   response style guidelines.
3. **Tool definitions**: ~12k tokens of structured tool specifications that
   define what Claude can do (Read, Write, Edit, Bash, Glob, Grep, WebSearch,
   WebFetch, etc.).
4. **Memory injections**: CLAUDE.md files, auto-memory MEMORY.md (first 200
   lines), and rules from `.claude/rules/`.
5. **Sub-agent definitions**: Prompts for Plan (~633 tokens) and Explore (~516
   tokens) sub-agents.
6. **Context-specific variables**: Interpolated data such as available sub-
   agents, git status, current date, environment info.

The `--system-prompt` flag can replace everything except tool definitions and
the one-line SDK identity, giving approximately 188k tokens of usable context.

Sources:
- [Claude Code System Prompts (GitHub)](https://github.com/Piebald-AI/claude-code-system-prompts)
- [Reverse engineering Claude Code](https://kirshatrov.com/posts/claude-code-internals)
- [A Brief Analysis of Claude Code's Execution and Prompts](https://weaxsey.org/en/articles/2025-10-12/)

### 1.3 Built-in Tools

Claude Code includes ~18 built-in tools organized into categories:

| Category | Tools | Description |
|----------|-------|-------------|
| File Operations | Read, Write, Edit, NotebookEdit | Read, create, and modify files |
| Search | Glob, Grep | Pattern-based file finding and content search |
| Execution | Bash | Run terminal commands in a persistent shell |
| Web | WebSearch, WebFetch | Search the web and fetch page content |
| Agent | Task | Delegate work to sub-agents |
| User Interaction | AskUserQuestion | Ask clarifying questions with options |
| Skill Invocation | Skill | Invoke registered skills |

Tools are defined with JSON Schema parameter specifications. Each tool call
flows to a sandboxed execution environment and returns results as plain text,
ensuring predictability and security.

### 1.4 Sub-Agents

Claude Code supports sub-agents invoked through the `Task` tool. Sub-agents
operate with:

- **Isolated context windows**: Each sub-agent gets its own fresh context
  rather than sharing the parent's full history.
- **Restricted tool access**: Sub-agents typically get only Read, Write, Edit,
  Glob, and Grep (not Bash by default).
- **Custom system prompts**: Specialized instructions for the sub-agent's role.
- **Independent permissions**: Can have their own permission modes and hooks.

Built-in sub-agent types include:
- **Plan**: For planning and task decomposition (~633 tokens prompt).
- **Explore**: For codebase exploration and understanding (~516 tokens prompt).
- **Custom**: User-defined agents with specialized descriptions, prompts,
  and tool sets.

Sub-agents return condensed summaries (typically 1,000-2,000 tokens) to the
parent, enabling deep work without polluting the parent's context.

Sources:
- [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Create custom subagents](https://docs.anthropic.com/en/docs/claude-code/sub-agents)

---

## 2. Claude Agent SDK Architecture

### 2.1 SDK Overview

The Claude Agent SDK (formerly Claude Code SDK, renamed September 2025) exposes
Claude Code's infrastructure as a programmable library in Python and TypeScript.
It provides:

- The same agent loop that powers Claude Code
- All built-in tools (Read, Edit, Bash, Glob, Grep, etc.)
- Context management and automatic compaction
- Session creation, resumption, and forking
- Hook-based lifecycle interception
- Sub-agent delegation via the Task tool
- MCP (Model Context Protocol) server integration
- Permission and sandbox controls

### 2.2 Core API: The `query()` Function

The primary entry point is the `query()` function, which accepts:

```python
query(
    prompt="...",               # The user's instruction
    options=ClaudeAgentOptions(
        model="claude-opus-4-6",
        allowed_tools=["Read", "Edit", "Bash", "Glob", "Grep"],
        permission_mode="acceptEdits",
        resume="session-id",    # Resume a previous session
        fork_session=True,      # Fork instead of continuing
        hooks={...},            # Lifecycle hooks
        agents={...},           # Custom sub-agent definitions
        mcp_servers={...},      # MCP server connections
        setting_sources=["project"],  # Load CLAUDE.md, skills, etc.
    )
)
```

The function returns an async iterator of messages. The first message is always
a `system/init` message containing the `session_id`.

### 2.3 Message Types

The SDK emits several message types during execution:

| Message Type | Subtype | Content |
|-------------|---------|---------|
| system | init | Session ID, configuration |
| assistant | text | Claude's reasoning and responses |
| assistant | tool_use | Tool call with name, parameters |
| tool | tool_result | Result from tool execution |
| system | compaction | Context was compacted |
| result | - | Final answer text |

### 2.4 SDK vs Client SDK

The key architectural difference between the Agent SDK and the lower-level
Anthropic Client SDK is who manages the tool loop:

- **Client SDK**: You implement the tool loop yourself -- send a prompt, check
  if `stop_reason == "tool_use"`, execute tools, send results back, repeat.
- **Agent SDK**: Claude handles tools autonomously -- you send a prompt and
  receive a stream of messages as Claude thinks, acts, and produces results.

Sources:
- [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

---

## 3. Tool Use Patterns

### 3.1 The Tool Use Request-Response Cycle

Claude's tool use follows a structured multi-step protocol:

1. **Tool Definition**: Tools are specified in the `tools` parameter of the API
   request. Each definition includes a name, description, and JSON Schema for
   input parameters.

2. **Tool Selection**: When Claude determines it needs external capabilities,
   it emits a `tool_use` content block containing:
   - `id`: Unique identifier for this tool invocation
   - `name`: The tool to call
   - `input`: Structured parameters matching the schema

3. **Tool Execution**: The host application executes the tool and returns a
   `tool_result` content block with:
   - `tool_use_id`: Matching the original invocation
   - `content`: The tool's output (text, images, or structured data)
   - `is_error`: Boolean indicating success/failure

4. **Continuation**: Claude processes the result and either makes another tool
   call or produces a final text response.

### 3.2 Parallel Tool Calls

Claude can emit multiple `tool_use` blocks in a single assistant message when
tools are independent. All corresponding `tool_result` blocks must be provided
in the subsequent user message. This enables significant latency reduction for
independent operations (e.g., reading multiple files simultaneously).

### 3.3 Advanced Tool Use Features (2025)

Anthropic introduced several advanced tool use features:

1. **Tool Search Tool**: When working with hundreds or thousands of tools, you
   can mark tools with `defer_loading: true`. Claude finds and loads only the
   tools it needs through a search mechanism, avoiding context window bloat.

2. **Programmatic Tool Calling**: Claude can write code that calls tools
   programmatically within the Code Execution environment, rather than
   requiring round-trips for each invocation. This dramatically reduces latency
   and token consumption for multi-tool workflows.

3. **Automatic Tool Call Clearing**: Old tool use results are automatically
   cleared as token limits are approached, enabling more efficient context
   management in long conversations.

### 3.4 Ontology Implications for Tool Use

A personal agent ontology must model:

- **ToolDefinition**: Schema, name, description, parameter specification
- **ToolInvocation**: A specific call with ID, input parameters, timestamp
- **ToolResult**: Output, success/failure status, execution duration
- **ToolInvocationGroup**: Parallel tool calls that belong together
- **ToolPermission**: Whether a tool is allowed, blocked, or requires approval

Sources:
- [How to implement tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use)
- [Tool use with Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [Introducing advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use)
- [Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)

---

## 4. Session Management Patterns

### 4.1 Session Lifecycle

Sessions in the Claude Agent SDK follow this lifecycle:

1. **Creation**: A new `query()` call automatically creates a session. The
   session ID is returned in the `system/init` message.

2. **Active Execution**: The agent loop runs, executing tools and producing
   messages. The session accumulates conversation history and context.

3. **Completion**: The agent produces a final result. The session persists
   with its full history.

4. **Resumption**: A subsequent `query()` call with `resume=session_id` loads
   the full conversation history and continues from where it left off.

5. **Forking**: Using `fork_session=True` creates a new session that branches
   from the resumed state, preserving the original session unchanged.

### 4.2 Context Window Management

The context window is the fundamental constraint on agent cognition. Claude
Code manages it through several mechanisms:

**Effective Context Window**: Claude Code supports 200,000 tokens maximum. A
buffer of ~33,000-45,000 tokens (16.5-22.5% of 200K) is reserved for system
components, leaving ~155,000-167,000 tokens for conversation.

**Automatic Compaction**: When context usage reaches 98% of the effective
window, the system automatically compacts the transcript:

1. The full message history is passed to the model for summarization.
2. Critical details are preserved: architectural decisions, unresolved bugs,
   implementation details, file paths.
3. Redundant tool outputs and verbose messages are discarded.
4. The compacted summary replaces the old history in the context window.

**Manual Compaction**: The `/compact` command triggers immediate compaction.
Users can provide custom instructions for what to preserve.

**PreCompact Hook**: A lifecycle hook fires before compaction (both manual and
automatic), receiving the session ID, transcript path, and any custom
instructions. This allows custom processing before context is compressed.

### 4.3 Cross-Session Persistence

Multiple mechanisms preserve state across sessions:

| Mechanism | Scope | Persistence | Content |
|-----------|-------|-------------|---------|
| Session history | Per session | Until deleted | Full conversation + tool results |
| Session summaries | Per session | Long-term | Compressed summary of session work |
| Auto-memory (MEMORY.md) | Per project | Long-term | Claude's learned patterns and notes |
| CLAUDE.md files | Per project/user | Long-term | User-authored instructions |
| File checkpoints | Per session | Session lifetime | Git-like snapshots of file state |

Session summaries are stored as structured markdown files at:
`~/.claude/projects/<project-hash>/<session-id>/session-memory/summary.md`

### 4.4 Session Forking

Session forking enables branching exploration:

| Behavior | Continue (default) | Fork |
|----------|-------------------|------|
| Session ID | Same as original | New ID generated |
| History | Appends to original | Creates branch from resume point |
| Original | Modified | Preserved unchanged |
| Use Case | Linear continuation | Explore alternatives |

### 4.5 Ontology Implications for Sessions

A personal agent ontology must model:

- **Session**: ID, creation time, status, parent session (for forks)
- **SessionFork**: Relationship between parent and child sessions
- **Turn**: User prompt + agent response pair within a session
- **ContextWindow**: Current token usage, capacity, compaction history
- **CompactionEvent**: When context was compressed, what was preserved/lost
- **SessionSummary**: Compressed representation of a session

Sources:
- [Session Management](https://platform.claude.com/docs/en/agent-sdk/sessions)
- [Claude Code Session Memory](https://claudefa.st/blog/guide/mechanics/session-memory)
- [Context Window & Compaction](https://deepwiki.com/anthropics/claude-code/3.3-session-and-conversation-management)
- [Claude Code Context Buffer](https://claudefa.st/blog/guide/mechanics/context-buffer-management)

---

## 5. Agentic Patterns

### 5.1 Anthropic's Taxonomy of Agentic Systems

Anthropic draws an important architectural distinction between **workflows**
and **agents**:

- **Workflows**: LLMs and tools orchestrated through predefined code paths.
  The developer controls the sequence. Includes patterns like prompt chaining,
  routing, parallelization, orchestrator-workers, and evaluator-optimizer.

- **Agents**: LLMs dynamically direct their own processes and tool usage.
  The model controls the sequence based on its reasoning about the task.

Key workflow patterns from Anthropic's "Building Effective Agents" guide:

1. **Prompt Chaining**: Task decomposed into sequential steps, each LLM call
   processes the output of the previous one. Trades latency for accuracy.

2. **Routing**: Input classified and directed to specialized handlers.

3. **Parallelization**: Independent subtasks run simultaneously, outputs
   aggregated. Two variants: sectioning (different subtasks) and voting
   (same task, multiple attempts).

4. **Orchestrator-Workers**: A central LLM dynamically breaks down tasks and
   delegates to worker LLMs.

5. **Evaluator-Optimizer**: One LLM generates, another evaluates in a loop.

Sources:
- [Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)

### 5.2 Planning and Task Decomposition

Modern coding agents use explicit planning mechanisms:

- **TODO Lists**: Claude Code uses TODO lists as a planning artifact, tracking
  what needs to be done and checking items off as they complete.

- **Hierarchical Decomposition**: Complex tasks are broken into sub-tasks,
  each potentially delegated to a sub-agent. A parent/root agent receives the
  complex task and decomposes it into manageable sub-tasks.

- **Progress Tracking**: For long-running tasks, a `claude-progress.txt` file
  (or similar artifact) tracks what has been accomplished, enabling new context
  windows to quickly understand the state of work.

- **Feature Lists**: Initializer agents set up the environment with feature
  lists, git repositories, and progress tracking files before coding agents
  make incremental progress.

### 5.3 Error Recovery and Retry Patterns

Agents implement resilience through:

1. **Observe-Evaluate-Replan**: After an action, feedback is checked. On
   failure, the system queries memory or error logs, and the planner
   re-evaluates whether to skip, retry with modified parameters, or ask
   for clarification.

2. **File Checkpointing**: Claude Code automatically saves code state before
   each edit. The `/rewind` command enables instant rollback to any previous
   state within the session. Only direct file edits through Write/Edit/
   NotebookEdit are tracked (not Bash commands like `sed -i`).

3. **Git Integration**: For permanent version history, agents use git commits
   as milestone markers. Checkpoints complement but do not replace version
   control.

4. **Graceful Degradation**: When a tool fails, the agent can try alternative
   approaches (e.g., different search strategies, different file access
   methods).

### 5.4 Human-in-the-Loop Patterns

Several checkpoint mechanisms exist for human oversight:

1. **Permission Modes**: Five levels from `default` (ask for everything) to
   `bypassPermissions` (fully autonomous).

2. **AskUserQuestion Tool**: The agent can explicitly ask the user for
   clarification with multiple-choice options.

3. **Hook-Based Interception**: PreToolUse hooks can block, modify, or require
   approval for specific tool invocations before they execute.

4. **Explicit Checkpoints**: Framework-level `interrupt()` functions (in
   LangGraph, Semantic Kernel) pause agent execution and wait for human input.

5. **Review Points**: Agents can be configured to pause at critical junctures
   (before destructive operations, before committing, before deploying).

### 5.5 Long-Running Agent Harnesses

Anthropic's research on effective harnesses for long-running agents identifies
the core challenge: agents must work in discrete sessions with no memory of
what came before, and complex projects cannot be completed within a single
context window.

Their solution uses a two-part architecture:

1. **Initializer Agent**: Sets up the environment with feature lists, git
   repositories, and progress tracking files (`claude-progress.txt`).

2. **Coding Agents**: Make incremental progress, updating the progress file
   and committing to git. Each new context window can quickly orient itself
   by reading the progress file and git history.

The key insight is that without this harness, even frontier models try to
"one-shot" complex tasks, attempting to do too much at once and losing
coherence.

Sources:
- [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Checkpointing](https://code.claude.com/docs/en/checkpointing)

### 5.6 Ontology Implications for Agentic Patterns

A personal agent ontology must model:

- **Plan**: A structured decomposition of a goal into tasks
- **Task**: A unit of work with status, assignee (agent/sub-agent), result
- **Goal**: The high-level objective driving agent behavior
- **ExecutionLoop**: The think-act-observe cycle with iteration count
- **Checkpoint**: A point where the agent pauses for human review
- **ErrorRecovery**: A retry/replan event after a failure
- **ProgressArtifact**: Files or records tracking long-running work

---

## 6. Memory Patterns in Practice

### 6.1 Claude Code's Memory Hierarchy

Claude Code implements a rich, hierarchical memory system with six distinct
levels, each serving a different scope and purpose:

| Level | Location | Loaded | Scope | Author |
|-------|----------|--------|-------|--------|
| Managed policy | `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS) | Always, at launch | Organization-wide | IT/DevOps |
| Project memory | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Always, at launch | Project (shared via VCS) | Team |
| Project rules | `./.claude/rules/*.md` | Always, at launch (conditional by path) | Project (shared via VCS) | Team |
| User memory | `~/.claude/CLAUDE.md` | Always, at launch | All projects (personal) | User |
| Local project memory | `./CLAUDE.local.md` | Always, at launch | Project (personal, gitignored) | User |
| Auto-memory | `~/.claude/projects/<project>/memory/` | First 200 lines at launch; rest on-demand | Project (personal) | Claude |

**Precedence**: More specific instructions override broader ones. Project rules
override user memory. CLAUDE.md files in child directories load on-demand when
Claude reads files in those directories.

### 6.2 CLAUDE.md Files: Persistent Project Memory

CLAUDE.md files are the primary mechanism for human-authored persistent memory:

- **Content**: Coding standards, architectural patterns, common workflows,
  tool preferences, project-specific conventions, build commands.
- **Format**: Markdown with structured bullet points and headings.
- **Imports**: `@path/to/file` syntax for importing additional files, with
  recursive imports up to 5 levels deep.
- **Discovery**: Claude Code reads CLAUDE.md files recursively from cwd up
  to the repository root. Nested CLAUDE.md files in subdirectories are loaded
  on-demand.

Best practices:
- Keep memories minimal and specific ("Use 2-space indentation" not "Format
  code properly").
- Use structure: bullet points grouped under descriptive markdown headings.
- Review periodically as the project evolves.

### 6.3 Auto-Memory: Claude's Self-Written Notes

Auto-memory is a persistent directory where Claude records learnings, patterns,
and insights as it works. Unlike CLAUDE.md files that contain human-authored
instructions, auto-memory contains notes Claude writes for itself.

**Structure**:
```
~/.claude/projects/<project>/memory/
  MEMORY.md          # Concise index (first 200 lines loaded at startup)
  debugging.md       # Detailed notes on debugging patterns
  api-conventions.md # API design decisions
  ...                # Any other topic files Claude creates
```

**What gets remembered**:
- Project patterns: build commands, test conventions, code style
- Debugging insights: solutions to tricky problems, common error causes
- Architecture notes: key files, module relationships, abstractions
- User preferences: communication style, workflow habits, tool choices

**How it works**:
- MEMORY.md acts as an index; first 200 lines loaded into system prompt.
- Topic files loaded on-demand when Claude needs the information.
- Claude reads and writes memory files during the session.
- Users can tell Claude to remember things: "remember that we use pnpm".

### 6.4 Session Memory: Background Summaries

Session Memory is Claude Code's automatic background system for remembering
what happened across sessions:

- **Continuous writing**: Session summaries are written continuously in the
  background, not just at session end.
- **Compression**: A two-hour session becomes a focused summary that Claude
  can load in seconds.
- **Storage**: `~/.claude/projects/<project-hash>/<session-id>/session-memory/summary.md`
- **Capture**: What you did and why, not a transcript of every message.

When compaction occurs (manual `/compact` or automatic at 98% context), the
pre-written summary is loaded into a fresh context window with no re-analysis
needed.

### 6.5 Modular Rules

The `.claude/rules/` directory enables organized, topic-specific project
instructions:

- **Automatic loading**: All `.md` files in `.claude/rules/` are loaded as
  project memory.
- **Path-specific rules**: YAML frontmatter with `paths` field scopes rules
  to specific file patterns (glob syntax).
- **Subdirectories**: Rules can be organized into subdirectories, all
  discovered recursively.
- **Symlinks**: Supported for sharing rules across projects.
- **User-level rules**: Personal rules at `~/.claude/rules/` apply to all
  projects.

### 6.6 Skills: Specialized Capability Definitions

Skills are markdown-based guides that teach Claude how to handle specific
tasks:

- **Storage**: `.claude/skills/SKILL.md` files in a named folder.
- **Invocation**: Natural language (Claude decides when to use them) or
  explicit slash command.
- **Description loading**: Skill descriptions are loaded into context so
  Claude knows what is available.
- **Composition**: Skills can reference shared materials in
  `.claude/skills/_shared/`.

### 6.7 Context Engineering: The Discipline

Anthropic frames "context engineering" as the core discipline for building
effective AI agents. The context window is a finite resource shared by:

- System prompts
- Tool definitions
- Memory injections (CLAUDE.md, auto-memory, rules)
- Conversation history
- Tool results
- Runtime data retrieval

Key principles:
- **Context is precious**: Every token in the context window should earn its
  place.
- **Sub-agents isolate context**: Rather than one agent maintaining state
  across an entire project, specialized sub-agents handle focused tasks with
  clean context windows and return condensed summaries.
- **Compaction preserves essentials**: When context must be compressed,
  preserve decisions and state, discard verbose outputs.
- **Memory layers serve different timescales**: Working memory (context window)
  for the current task; session memory for within-session recall; auto-memory
  for cross-session learning; CLAUDE.md for long-term project knowledge.

Sources:
- [Manage Claude's memory](https://code.claude.com/docs/en/memory)
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [Claude Code Memory System](https://developertoolkit.ai/en/claude-code/advanced-techniques/memory-system/)

### 6.8 Ontology Implications for Memory

A personal agent ontology must model:

- **MemoryLayer**: The hierarchical level (managed policy, project, user, auto)
- **MemoryItem**: A discrete piece of stored knowledge with provenance
- **MemoryScope**: Project, user, organization, session
- **MemorySource**: Human-authored vs agent-authored vs system-generated
- **MemoryFile**: A specific file (CLAUDE.md, MEMORY.md, rule file, skill)
- **ContextWindow**: Current state of the finite attention resource
- **CompactionEvent**: When and how context was compressed
- **SessionSummary**: Compressed session representation
- **Skill**: A specialized capability definition with trigger conditions
- **Rule**: A conditional instruction scoped to file paths

---

## 7. Permissions and Safety Constraints

### 7.1 Permission Modes

Claude Code implements five permission modes:

| Mode | Behavior | Use Case |
|------|----------|----------|
| `default` | Ask permission for everything | Maximum safety |
| `acceptEdits` | Auto-approve file edits, ask for other ops | Trusted projects |
| `plan` | Read-only exploration, no edits | Code review, analysis |
| `dontAsk` | Auto-approve most operations | Automation pipelines |
| `bypassPermissions` | No permission checks at all | Isolated containers only |

### 7.2 Defense in Depth: Permissions + Sandboxing

Two independent safety layers:

- **Permissions**: Control which tools Claude can use and which files/domains
  it can access. Applies to all tools.
- **Sandboxing**: OS-level enforcement that restricts Bash commands' filesystem
  and network access. Applies only to Bash and child processes.

Using both provides defense-in-depth: permission rules block Claude from
attempting restricted access, and sandbox restrictions prevent Bash commands
from reaching resources outside defined boundaries, even if a prompt injection
bypasses Claude's decision-making.

### 7.3 Hooks for Safety Enforcement

Hooks provide programmatic interception points in the agent lifecycle:

| Hook Event | Fires When | Can Do |
|------------|-----------|--------|
| PreToolUse | Before tool execution | Block, modify input, require approval |
| PostToolUse | After tool execution | Log, add context, validate output |
| PreCompact | Before context compaction | Custom preservation logic |
| Stop | Session ending | Cleanup, summary generation |
| SessionStart | Session beginning | Setup, validation |
| UserPromptSubmit | User sends a prompt | Input validation, routing |
| SubagentStop | Sub-agent finishing | Result validation |

### 7.4 Ontology Implications for Safety

A personal agent ontology must model:

- **PermissionMode**: The current safety posture
- **Permission**: Allow/deny/require-approval for specific tools or resources
- **SandboxPolicy**: OS-level access restrictions
- **Hook**: A lifecycle interception point with matcher and callback
- **SafetyConstraint**: An abstract constraint on agent behavior
- **AuditLog**: Record of all tool invocations, approvals, and denials

---

## 8. Model Context Protocol (MCP)

### 8.1 MCP Architecture

The Model Context Protocol provides a standardized way to connect AI agents
to external systems. It uses a client-server architecture built on JSON-RPC
2.0:

- **Host**: The AI-powered application (e.g., Claude Code)
- **Client**: MCP client component within the host
- **Servers**: External integrations that expose capabilities

### 8.2 MCP Primitives

MCP defines three core primitives:

| Primitive | Description | Control |
|-----------|-------------|---------|
| **Tools** | Executable functions the LLM can call | Model-controlled |
| **Resources** | Data/content for context (files, DB rows, etc.) | Application-controlled |
| **Prompts** | Structured message templates for guided interaction | User-controlled |

### 8.3 Server Discovery

The client asks each server "What capabilities do you offer?" and each server
responds with its available tools, resources, and prompts. This discovery
mechanism enables dynamic capability negotiation.

### 8.4 Ontology Implications for MCP

A personal agent ontology must model:

- **ExternalService**: An MCP server or other external integration
- **ServiceCapability**: A tool, resource, or prompt exposed by a service
- **ServiceConnection**: Active connection between agent and service
- **CapabilityDiscovery**: The negotiation of available capabilities

Sources:
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Understanding MCP features](https://workos.com/blog/mcp-features-guide)

---

## 9. Ontology Requirements Synthesis

Based on the analysis above, a personal agent ontology needs to model the
following concept domains. This section synthesizes the ontological implications
from all seven research areas into a coherent requirements specification.

### 9.1 Core Concept Domains

#### A. Agents and Roles

| Concept | Description | Key Properties |
|---------|-------------|----------------|
| Agent | Any entity that can act (human, AI, sub-agent, organization) | id, type, name, capabilities |
| HumanUser | The human interacting with the system | preferences, permissions |
| AIAssistant | The primary AI agent (e.g., Claude Code) | model, version, system prompt |
| SubAgent | A delegated specialized agent | parent, role, tool restrictions |
| AgentRole | A role an agent plays in a context | roleType, scope, permissions |

#### B. Sessions and Conversations

| Concept | Description | Key Properties |
|---------|-------------|----------------|
| Session | A bounded interaction context with persistent state | id, created, status, parentSession |
| SessionFork | A branching point creating a new session from an existing one | sourceSession, forkPoint |
| Conversation | The dialogue within a session | session, participants, turns |
| Turn | A single exchange: user prompt + agent response | index, speaker, timestamp |
| Message | A discrete unit of communication | role, content, contentBlocks |
| ContentBlock | A typed piece of content within a message | type (text, tool_use, tool_result, image) |

#### C. Tool Use

| Concept | Description | Key Properties |
|---------|-------------|----------------|
| ToolDefinition | Schema for a callable tool | name, description, inputSchema |
| ToolInvocation | A specific tool call | id, tool, input, timestamp, duration |
| ToolResult | The output of a tool call | toolUseId, content, isError |
| ToolInvocationGroup | Parallel tool calls in one turn | invocations[], turn |
| ToolPermission | Access control for a tool | tool, mode (allow/deny/ask) |

#### D. Memory and Context

| Concept | Description | Key Properties |
|---------|-------------|----------------|
| MemoryLayer | A level in the memory hierarchy | level, scope, loadBehavior |
| MemoryFile | A persistent memory artifact | path, scope, author, content |
| MemoryItem | A discrete piece of stored knowledge | source, confidence, timestamp |
| AutoMemory | Agent-authored persistent notes | project, topics, indexFile |
| SessionSummary | Compressed session representation | session, summary, preservedDetails |
| ContextWindow | The finite attention resource | capacity, used, available |
| CompactionEvent | Context compression event | trigger, preservedItems, discardedItems |
| Rule | A conditional instruction | paths, content, priority |
| Skill | A specialized capability guide | name, description, triggerConditions |

#### E. Plans, Tasks, and Goals

| Concept | Description | Key Properties |
|---------|-------------|----------------|
| Goal | A high-level objective | description, status, priority |
| Plan | A structured decomposition of a goal | goal, tasks[], strategy |
| Task | A unit of work | description, status, assignee, result |
| TaskDecomposition | Breaking a task into subtasks | parentTask, childTasks[] |
| ProgressArtifact | A tracking file for long-running work | path, format, lastUpdated |

#### F. Permissions and Safety

| Concept | Description | Key Properties |
|---------|-------------|----------------|
| PermissionMode | The overall safety posture | mode, description |
| Permission | Specific access control rule | resource, action, decision |
| SandboxPolicy | OS-level access restrictions | filesystem, network, processes |
| Hook | Lifecycle interception point | event, matcher, callback |
| AuditEntry | Record of an action and its authorization | action, decision, timestamp, reason |
| SafetyConstraint | An abstract behavioral constraint | type, enforcement, scope |

#### G. External Services (MCP)

| Concept | Description | Key Properties |
|---------|-------------|----------------|
| ExternalService | An MCP server or API | name, transport, status |
| ServiceTool | A tool exposed by an external service | service, definition |
| ServiceResource | Data exposed by an external service | service, uri, mimeType |
| ServicePrompt | A prompt template from an external service | service, name, arguments |

### 9.2 Key Relationships

The following relationships form the "spine" of the ontology:

```
Agent --performs--> Action
Agent --participates_in--> Session
Agent --holds--> MemoryItem
Agent --pursues--> Goal

Session --contains--> Turn
Session --has_context--> ContextWindow
Session --forked_from--> Session
Session --summarized_by--> SessionSummary

Turn --has_message--> Message
Turn --contains--> ToolInvocation
Turn --spoken_by--> Agent

ToolInvocation --uses--> ToolDefinition
ToolInvocation --produces--> ToolResult
ToolInvocation --authorized_by--> Permission

Goal --decomposed_into--> Plan
Plan --has_task--> Task
Task --assigned_to--> Agent (or SubAgent)
Task --delegated_via--> ToolInvocation (Task tool)

MemoryFile --belongs_to--> MemoryLayer
MemoryItem --stored_in--> MemoryFile
MemoryItem --has_provenance--> ProvenanceRecord

ContextWindow --compacted_by--> CompactionEvent
CompactionEvent --preserves--> MemoryItem
CompactionEvent --discards--> MemoryItem

Hook --intercepts--> ToolInvocation
Permission --governs--> ToolDefinition
SandboxPolicy --restricts--> Agent
```

### 9.3 Candidate Upper Ontology Alignment

The concepts above map to BFO/PROV categories:

| Agent Ontology Concept | BFO Category | PROV Mapping |
|----------------------|--------------|--------------|
| Agent | Independent Continuant | prov:Agent |
| Session | Process | prov:Activity |
| Turn | Process Part | prov:Activity |
| ToolInvocation | Process | prov:Activity |
| ToolResult | Information Entity | prov:Entity |
| MemoryItem | Information Entity | prov:Entity |
| Plan | Information Entity | prov:Plan |
| Goal | Disposition/Role | (extension needed) |
| Permission | Role | prov:Role |
| ContextWindow | Quality | (extension needed) |
| CompactionEvent | Process | prov:Activity (wasInformedBy) |
| SessionSummary | Information Entity | prov:Entity (wasDerivedFrom) |

### 9.4 Competency Questions

The ontology should be able to answer:

1. What tools did the agent use in session X, and what were their results?
2. What is the current state of the context window, and when was it last
   compacted?
3. What memory items were preserved vs. discarded during the last compaction?
4. What plan was the agent following, and which tasks are complete?
5. Who authored each memory file, and when was it last modified?
6. What permissions govern tool X for agent Y in project Z?
7. What sessions were forked from session X, and how do their outcomes differ?
8. What skills are available for the current project?
9. What external services are connected, and what capabilities do they expose?
10. What is the provenance chain for a given memory item or claim?
11. What errors occurred during execution, and how were they recovered from?
12. What human-in-the-loop checkpoints were triggered, and what decisions
    were made?

---

## 10. Comparison with Existing Research Reports

The two existing deep research reports in this project provide complementary
perspectives:

- **Report 0** (`deep-research-report_0.md`): Focuses on cognitive science
  foundations for agent memory (Atkinson-Shiffrin, Baddeley, episodic vs
  semantic, consolidation, forgetting) and maps these to agent implementation
  patterns (RAG, KG, hybrid stores). Provides the theoretical grounding for
  *why* memory architectures look the way they do.

- **Report 1** (`deep-research-report_1.md`): Focuses on ontology design for
  personal assistant agents with detailed standards alignment (RDF/OWL, PROV-O,
  OWL-Time, SHACL, ODRL, DPV). Provides concrete Turtle snippets, SHACL
  shapes, and SPARQL recipes. Defines the core classes (Agent, Episode, Turn,
  Claim, Evidence, etc.) and the governance framework.

- **This Report**: Focuses on the *concrete implementation patterns* in
  production coding agents (Claude Code, Agent SDK) and derives ontology
  requirements from actual system architecture. Adds concepts not covered in
  the previous reports: tool definitions and invocations, session management
  and forking, context window dynamics and compaction, permission modes and
  sandboxing, hooks and lifecycle events, MCP integration, skills and rules,
  and the planning/task decomposition patterns used by real agents.

### Key Concepts This Report Adds

The following concepts are newly identified in this report and should be
incorporated into the ontology design:

1. **ToolDefinition / ToolInvocation / ToolResult**: The full tool use
   lifecycle, including parallel invocations and error handling.
2. **Session / SessionFork**: Persistent, resumable, forkable interaction
   contexts.
3. **ContextWindow / CompactionEvent**: The finite attention resource and its
   management.
4. **MemoryLayer / MemoryFile**: The hierarchical memory system with six
   distinct levels.
5. **AutoMemory**: Agent-authored persistent notes (distinct from human-
   authored CLAUDE.md).
6. **Skill / Rule**: Specialized capability definitions and conditional
   instructions.
7. **PermissionMode / Permission / SandboxPolicy**: The layered safety system.
8. **Hook**: Lifecycle interception points for custom behavior.
9. **Plan / Task / ProgressArtifact**: Planning and tracking for long-running
   work.
10. **ExternalService (MCP)**: Standardized integration with external
    capabilities.

---

## 11. Recommended Next Steps

1. **Merge Concept Models**: Combine the entity models from Report 1
   (Agent, Episode, Turn, Claim, Evidence, etc.) with the new concepts from
   this report (ToolInvocation, Session, ContextWindow, etc.) into a unified
   conceptual model.

2. **Define Competency Questions**: Formalize the 12 CQs from Section 9.4
   as SPARQL queries against the proposed class structure.

3. **BFO Alignment**: Map all concepts to BFO categories (continuant vs
   occurrent, independent vs dependent, etc.) following the alignment table
   in Section 9.3.

4. **PROV Integration**: Use PROV-O as the provenance backbone, with
   prov:Activity for sessions/turns/tool invocations, prov:Entity for
   memory items/results, and prov:Agent for all agent types.

5. **SHACL Shapes**: Define validation shapes for the new concepts,
   especially:
   - ToolInvocation must have a matching ToolResult
   - CompactionEvent must reference what was preserved
   - Session must have at least one Turn
   - Permission must reference a ToolDefinition

6. **Prototype in Turtle**: Create a minimal Turtle serialization of a
   sample session showing: agent identity, session creation, a few turns
   with tool invocations, a compaction event, and memory file references.

---

## Primary Sources

### Anthropic Official Documentation
- [Claude Code: How it works](https://code.claude.com/docs/en/how-claude-code-works)
- [Manage Claude's memory](https://code.claude.com/docs/en/memory)
- [Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [Configure permissions](https://code.claude.com/docs/en/permissions)
- [Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)

### Anthropic Agent SDK Documentation
- [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Session Management](https://platform.claude.com/docs/en/agent-sdk/sessions)
- [Hooks](https://platform.claude.com/docs/en/agent-sdk/hooks)
- [Permissions](https://platform.claude.com/docs/en/agent-sdk/permissions)
- [File Checkpointing](https://platform.claude.com/docs/en/agent-sdk/file-checkpointing)

### Anthropic Engineering Blog
- [Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)
- [Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Introducing advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use)
- [Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Tool Use Documentation
- [How to implement tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use)
- [Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
- [Memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)

### Model Context Protocol
- [MCP Specification](https://modelcontextprotocol.io)
- [Understanding MCP features](https://workos.com/blog/mcp-features-guide)

### Community Analysis
- [Claude Code: Behind-the-scenes of the master agent loop](https://blog.promptlayer.com/claude-code-behind-the-scenes-of-the-master-agent-loop/)
- [Claude Code Agent Architecture (ZenML)](https://www.zenml.io/llmops-database/claude-code-agent-architecture-single-threaded-master-loop-for-autonomous-coding)
- [Reverse engineering Claude Code](https://kirshatrov.com/posts/claude-code-internals)
- [Claude Code System Prompts (GitHub)](https://github.com/Piebald-AI/claude-code-system-prompts)
- [Tracing Claude Code's LLM Traffic](https://medium.com/@georgesung/tracing-claude-codes-llm-traffic-agentic-loop-sub-agents-tool-use-prompts-7796941806f5)
- [Claude Code Session Memory](https://claudefa.st/blog/guide/mechanics/session-memory)
- [Claude Code Context Buffer](https://claudefa.st/blog/guide/mechanics/context-buffer-management)

### Broader Agentic AI Patterns
- [Google: Multi-agent patterns in ADK](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
- [Designing agentic loops (Simon Willison)](https://simonwillison.net/2025/Sep/30/designing-agentic-loops/)
- [Human-in-the-Loop for AI Agents](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo)
- [Agentic Much? Adoption of Coding Agents on GitHub](https://arxiv.org/html/2601.18341v1)
