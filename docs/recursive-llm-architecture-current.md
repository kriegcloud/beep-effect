# Recursive LLM Architecture (Current State)

As of 2026-02-09, this repository is a Bun CLI-first, in-memory recursive orchestration runtime.

## 1) System Architecture

```mermaid
flowchart LR
  U["User / Caller"] --> CLI["Bun CLI Entrypoint<br/>src/cli.ts"]
  CLI --> CMD["CLI Parsing + Validation<br/>src/cli/Command.ts<br/>src/cli/Normalize.ts"]
  CMD --> RUN["CLI Program + Event Renderer<br/>src/cli/Run.ts"]
  RUN --> LAYER["Layer Assembly<br/>src/CliLayer.ts<br/>src/Rlm.ts"]
  LAYER --> RLM["Rlm Service<br/>stream()/complete()"]
  RLM --> SCH["Scheduler Loop<br/>src/Scheduler.ts"]

  subgraph HOST["Host Process (Effect Runtime)"]
    SCH <--> RT["RlmRuntime Store<br/>Queue(commands)<br/>PubSub(events)<br/>Ref(callStates, budgets, bridgePending)<br/>src/Runtime.ts"]
    SCH <--> CS["CallContext (per call)<br/>iteration/transcript/variableSnapshot<br/>src/CallContext.ts"]
    SCH <--> BUD["Budget + Semaphore Gates<br/>src/Budget.ts"]
    SCH <--> PR["Prompt Construction + Guardrails<br/>src/SystemPrompt.ts<br/>src/RlmPrompt.ts<br/>src/SubmitTool.ts"]
    SCH <--> BR["BridgeStore + BridgeHandler<br/>src/scheduler/BridgeStore.ts<br/>src/BridgeHandler.ts"]
  end

  subgraph SBOX["Sandbox Boundary"]
    SCH --> SBF["SandboxFactory (host wrapper)<br/>src/SandboxBun.ts"]
    SBF --> WORKER["sandbox-worker Bun subprocess<br/>src/sandbox-worker.ts"]
    WORKER -->|llm_query / llm_query_batched / tools via IPC| BR
    BR -->|HandleBridgeCall command| SCH
    SCH -->|Bridge deferred resolve/fail| WORKER
  end

  subgraph LLM["External LLM Providers"]
    MODEL["RlmModel Provider Adapter<br/>src/RlmModel.ts"] --> OAI["OpenAI"]
    MODEL --> GOO["Google"]
    MODEL --> ANT["Anthropic"]
  end

  SCH --> MODEL
  RT --> EVT["RlmEvent Stream"]
  EVT --> RUN
  RUN --> OUT["stdout/stderr"]
```

## 2) Scheduler Command State Machine

```mermaid
flowchart TD
  START["StartCall"] --> GEN["GenerateStep"]
  GEN -->|code block extracted| EXEC["ExecuteCode"]
  EXEC --> EXECED["CodeExecuted"]
  EXECED --> GEN

  GEN -->|SUBMIT tool call| FIN["Finalize"]
  GEN -->|error| FAIL["FailCall"]

  BRIDGE["HandleBridgeCall"] -->|method != llm_query| TOOL["User Tool Dispatch"]
  BRIDGE -->|method == llm_query and depth < maxDepth| SUBCALL["Enqueue nested StartCall"]
  BRIDGE -->|method == llm_query and depth limit reached| ONESHOT["One-shot model call"]
  BRIDGE -->|method == llm_query_batched| BATCH["Parallel one-shot sub-calls"]

  TOOL --> GEN
  SUBCALL --> GEN
  ONESHOT --> GEN
  BATCH --> GEN

  FIN --> DONE["Resolve root result + shutdown command queue"]
  FAIL --> DONE
```

## 3) Secrets and Trust-Boundary Diagram

```mermaid
flowchart LR
  subgraph ENV["Host Environment"]
    E1["ANTHROPIC_API_KEY"]
    E2["OPENAI_API_KEY"]
    E3["GOOGLE_API_KEY"]
    E4["Optional test env: PROP_* / CI"]
  end

  E1 --> NORM["normalizeCliArgs() checks required key<br/>src/cli/Normalize.ts"]
  E2 --> NORM
  E3 --> NORM

  E1 --> CL["buildRlmModelLayer()<br/>Redacted.make(Bun.env.*)<br/>src/CliLayer.ts"]
  E2 --> CL
  E3 --> CL
  CL --> PC["Provider Clients<br/>@effect/ai-openai/google/anthropic"]
  PC --> NET["Outbound HTTPS to model provider APIs"]

  subgraph TRUST1["Sandbox Spawn Modes"]
    STRICT["Strict mode spawn<br/>cwd=TMPDIR, env={}, stderr=ignore<br/>src/SandboxBun.ts"]
    PERM["Permissive mode spawn<br/>inherits host env and stderr<br/>src/SandboxBun.ts"]
  end

  ENV --> PERM
  PERM --> W1["sandbox-worker process"]
  STRICT --> W1

  W1 --> IPC["IPC Bridge Calls<br/>llm_query/tool methods"]
  IPC --> SCH2["Scheduler HandleBridgeCall"]
  SCH2 --> PC

  W1 --> EVRISK["Potential data egress surfaces:<br/>CodeExecutionStarted.code<br/>CodeExecutionCompleted.output<br/>CallFailed.error<br/>ModelResponse.text"]
  EVRISK --> STREAM["RlmEvent stream subscribers / logs"]
```

## 4) Fact Source Index

- CLI entrypoint and execution: `src/cli.ts`, `src/cli/Command.ts`, `src/cli/Run.ts`.
- Per-call dependency/layer assembly: `src/Rlm.ts`.
- Scheduler queue-driven orchestration and command dispatch: `src/Scheduler.ts`.
- Runtime in-memory state (Queue, PubSub, Ref, Semaphore): `src/Runtime.ts`.
- Per-call mutable context: `src/CallContext.ts`.
- Bridge deferred lifecycle: `src/scheduler/BridgeStore.ts`, `src/BridgeHandler.ts`.
- Sandbox process + strict/permissive spawn behavior: `src/SandboxBun.ts`, `src/sandbox-worker.ts`.
- Provider integration and API key consumption: `src/CliLayer.ts`, `src/RlmModel.ts`, `src/cli/Normalize.ts`.
- Prompt/guardrail/finalization path: `src/SystemPrompt.ts`, `src/RlmPrompt.ts`, `src/SubmitTool.ts`.
