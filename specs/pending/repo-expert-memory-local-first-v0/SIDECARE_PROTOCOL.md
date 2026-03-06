# Sidecar Protocol

## Thesis
The desktop shell and the Bun sidecar need one stable, explicit protocol boundary.

For `v0`, that boundary is:
- `localhost HTTP` for request/response operations
- `SSE` for streaming progress and answer events

The shell launches the sidecar as an official Tauri sidecar/external binary. The sidecar owns all repo-memory runtime semantics.

## Official Grounding
This protocol is aligned to official primitives rather than plugin folklore:
- [Tauri v2 sidecars](https://v2.tauri.app/develop/sidecar/)
- [Tauri shell plugin](https://v2.tauri.app/plugin/shell/)
- [Tauri sidecar learn guide](https://v2.tauri.app/learn/sidecar-nodejs/)
- [Bun standalone executables](https://bun.sh/docs/bundler/executables)

This means `v0` should rely on Tauri's sidecar/external binary model and Bun's compiled executable model.

## Explicit Rejections For V0
The implementation must explicitly reject these as `v0` foundations:
- full-stack Next.js local server as the primary backend runtime
- `tauri-plugin-js` as the primary lifecycle dependency
- shell-owned business logic
- UI-to-internal-module imports that bypass the sidecar protocol

## Process Model
### Shell startup sequence
1. The Tauri shell launches a packaged sidecar executable named `repo-memory-sidecar`.
2. The shell passes these arguments:
   - `--host 127.0.0.1`
   - `--port 0`
   - `--session-id <uuid>`
   - `--app-data-dir <absolute path>`
3. The sidecar binds an ephemeral port.
4. The sidecar writes one bootstrap line to stdout as JSON.
5. The shell parses that bootstrap line and begins health checks.
6. The shell marks the sidecar usable only after a successful health response.

### Bootstrap stdout line
The first machine-readable stdout line must be:

```json
{
  "type": "bootstrap",
  "sessionId": "7f7c55d1-3e8f-4d70-9955-6653f2f2ef2d",
  "version": "0.1.0",
  "host": "127.0.0.1",
  "port": 43117,
  "baseUrl": "http://127.0.0.1:43117",
  "pid": 12345
}
```

This shape is the conceptual `SidecarBootstrap` contract.

### Shutdown behavior
- The shell owns process lifetime.
- On app shutdown, the shell terminates the sidecar process gracefully.
- If the sidecar exits unexpectedly, the shell surfaces disconnected state and offers restart without requiring a full desktop-app relaunch.

## Transport Rules
- HTTP base URL comes from the bootstrap line.
- All API routes live under `/api/v0`.
- All request and response bodies are JSON.
- All long-running index and query work is represented as `run` resources.
- All streaming is done through one SSE endpoint per run.

## Minimum Interface Surface
### 1. Health / bootstrap contract
#### `GET /api/v0/health`
Response:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "sessionId": "7f7c55d1-3e8f-4d70-9955-6653f2f2ef2d",
  "startedAt": "2026-03-06T12:00:00.000Z"
}
```

Use:
- startup confirmation
- reconnect confirmation
- diagnostics panel state

### 2. Repo registration contract
#### `POST /api/v0/repos`
Request:

```json
{
  "repoPath": "/absolute/path/to/repo",
  "displayName": "beep-effect3"
}
```

Response:

```json
{
  "repoId": "repo_01JABCDEF123456789",
  "repoPath": "/absolute/path/to/repo",
  "displayName": "beep-effect3",
  "status": "registered",
  "registeredAt": "2026-03-06T12:00:00.000Z"
}
```

This shape is the conceptual `RepoRegistration` contract.

#### `GET /api/v0/repos`
Response:

```json
{
  "repos": [
    {
      "repoId": "repo_01JABCDEF123456789",
      "repoPath": "/absolute/path/to/repo",
      "displayName": "beep-effect3",
      "lastIndexedAt": "2026-03-06T12:10:00.000Z"
    }
  ]
}
```

This route exists so the desktop app can restore prior repo choices after restart.

### 3. Indexing contract
#### `POST /api/v0/repos/:repoId/index-runs`
Request:

```json
{
  "mode": "full",
  "reason": "manual"
}
```

Response:

```json
{
  "runId": "run_01JINDEX123456789",
  "kind": "index",
  "repoId": "repo_01JABCDEF123456789",
  "status": "accepted",
  "runUrl": "/api/v0/runs/run_01JINDEX123456789",
  "eventsUrl": "/api/v0/runs/run_01JINDEX123456789/events"
}
```

This shape is the conceptual `IndexRun` start contract.

### 4. Query contract
#### `POST /api/v0/query-runs`
Request:

```json
{
  "repoId": "repo_01JABCDEF123456789",
  "question": "Where is the Graphiti proxy command implemented?",
  "maxCitations": 8
}
```

Response:

```json
{
  "runId": "run_01JQUERY123456789",
  "kind": "query",
  "repoId": "repo_01JABCDEF123456789",
  "status": "accepted",
  "runUrl": "/api/v0/runs/run_01JQUERY123456789",
  "eventsUrl": "/api/v0/runs/run_01JQUERY123456789/events"
}
```

This shape is the conceptual `QueryRun` start contract.

### 5. Run status contract
#### `GET /api/v0/runs/:runId`
For index runs:

```json
{
  "runId": "run_01JINDEX123456789",
  "kind": "index",
  "repoId": "repo_01JABCDEF123456789",
  "status": "completed",
  "startedAt": "2026-03-06T12:10:00.000Z",
  "completedAt": "2026-03-06T12:10:12.000Z",
  "summary": {
    "filesDiscovered": 142,
    "filesIndexed": 137,
    "filesSkipped": 5
  }
}
```

For query runs:

```json
{
  "runId": "run_01JQUERY123456789",
  "kind": "query",
  "repoId": "repo_01JABCDEF123456789",
  "question": "Where is the Graphiti proxy command implemented?",
  "status": "completed",
  "startedAt": "2026-03-06T12:12:00.000Z",
  "completedAt": "2026-03-06T12:12:03.000Z",
  "finalAnswer": "The Graphiti CLI command is defined in tooling/cli/src/commands/Graphiti/index.ts and the runtime behavior lives in the internal proxy runtime modules.",
  "retrievalPacket": {
    "repoId": "repo_01JABCDEF123456789",
    "query": "Where is the Graphiti proxy command implemented?",
    "createdAt": "2026-03-06T12:12:03.000Z",
    "citations": []
  }
}
```

### 6. SSE run stream contract
#### `GET /api/v0/runs/:runId/events`
The sidecar must stream `text/event-stream` events until completion or failure.

The conceptual `RunStreamEvent` union for `v0` is:
- `run.started`
- `run.progress`
- `retrieval.packet.ready`
- `answer.delta`
- `answer.completed`
- `run.failed`
- `heartbeat`

Examples:

```text
event: run.started
data: {"runId":"run_01JQUERY123456789","kind":"query","status":"running"}

event: run.progress
data: {"runId":"run_01JQUERY123456789","phase":"retrieval","message":"Searching symbols and source spans"}

event: retrieval.packet.ready
data: {"runId":"run_01JQUERY123456789","packet":{"repoId":"repo_01JABCDEF123456789","query":"Where is the Graphiti proxy command implemented?","createdAt":"2026-03-06T12:12:02.000Z","citations":[]}}

event: answer.delta
data: {"runId":"run_01JQUERY123456789","text":"The Graphiti CLI command is defined"}

event: answer.completed
data: {"runId":"run_01JQUERY123456789","finalAnswer":"The Graphiti CLI command is defined in tooling/cli/src/commands/Graphiti/index.ts ..."}
```

## Evidence Contracts
### `Citation`
`Citation` lives conceptually in `packages/repo-memory/domain`.

```json
{
  "id": "cit_01JABCDEF123456789",
  "kind": "symbol-span",
  "filePath": "tooling/cli/src/commands/Graphiti/index.ts",
  "symbolId": "tooling/cli/src/commands/Graphiti/index.ts#graphitiCommand",
  "symbolName": "graphitiCommand",
  "startLine": 18,
  "startColumn": 1,
  "endLine": 39,
  "endColumn": 1,
  "excerpt": "const graphitiProxyCommand = Command.make(...)",
  "rationale": "Defines the Graphiti CLI command and its subcommands."
}
```

Rules:
- every final query answer must include at least one citation when the system claims repo-grounded knowledge
- citations must always point to real file spans
- citations may point to files or symbols, but they must remain span-backed

### `RetrievalPacket`
`RetrievalPacket` also lives conceptually in `packages/repo-memory/domain`.

```json
{
  "repoId": "repo_01JABCDEF123456789",
  "query": "Where is the Graphiti proxy command implemented?",
  "createdAt": "2026-03-06T12:12:02.000Z",
  "citations": [
    {
      "id": "cit_01JABCDEF123456789",
      "kind": "symbol-span",
      "filePath": "tooling/cli/src/commands/Graphiti/index.ts",
      "symbolId": "tooling/cli/src/commands/Graphiti/index.ts#graphitiCommand",
      "symbolName": "graphitiCommand",
      "startLine": 18,
      "startColumn": 1,
      "endLine": 39,
      "endColumn": 1,
      "excerpt": "const graphitiProxyCommand = Command.make(...)",
      "rationale": "Defines the Graphiti CLI command and its subcommands."
    }
  ],
  "notes": [
    "Prototype packet: bounded to the top cited repo spans only."
  ]
}
```

Rules:
- the retrieval packet is the bounded evidence-bearing context returned by the sidecar
- the UI must be able to render it directly in a citations/evidence panel
- the sidecar owns packet construction and truncation

## Error Contract
Any failed run must eventually surface:

```json
{
  "runId": "run_01JQUERY123456789",
  "status": "failed",
  "error": {
    "code": "repo_not_registered",
    "message": "Repo repo_01JABCDEF123456789 is not registered in this sidecar session.",
    "retriable": false
  }
}
```

Prototype-grade error codes to reserve in the spec:
- `sidecar_unhealthy`
- `repo_not_registered`
- `index_failed`
- `query_failed`
- `unsupported_repo_layout`
- `transport_disconnected`

## First Implementation Constraint
The first implementation should make the sidecar protocol the only supported route for desktop-business interactions.

No desktop screen in `v0` should bypass the protocol and reach directly into repo-memory server code. That boundary is part of what the prototype is meant to prove.
