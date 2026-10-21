# @beep/acp

Effect-native Agent Client Protocol (ACP) driver.

The package holds the ACP wire contracts, the JSON-RPC transport, typed
protocol errors, a dual-generation client (ACP v1 and v2), a v2 agent, and the
driver-local layers. It is product-neutral: product-specific agent behaviour
belongs in the owning slice or shared use-case contracts.

## Installation

```bash
bun add @beep/acp
```

## Public surface

| Subpath | Module | What it holds |
| --- | --- | --- |
| `@beep/acp` | `src/index.ts` | Namespaces `Errors`, `Schema`, `SchemaV1`, `Compat`, `Agent`, `Client`, `Json`, `Protocol`, `Rpc` |
| `@beep/acp/client` | `AcpClient.service.ts` | `AcpClient` service, `make`, `layerChildProcess`, `AcpClientOptions`, `AcpClientProtocolGeneration`, `makeTerminationError` |
| `@beep/acp/agent` | `AcpAgent.service.ts` | `AcpAgent` service (generation 2 only), `make`, `layer`, `layerStdio` |
| `@beep/acp/protocol` | `AcpProtocol.service.ts` | `makeAcpPatchedProtocol`, `AcpRequestContext`, `AcpRequestHandler`, `AcpStdio`, `RPC_REQUEST_ID_START`, logging and notification schemas |
| `@beep/acp/schema` | `Acp.models.ts` | Generated ACP v2 schemas, `AGENT_METHODS`, `CLIENT_METHODS`, `PROTOCOL_VERSION` (2), and the v1 method tables `V1_AGENT_METHODS`, `V1_CLIENT_METHODS`, `V1_PROTOCOL_VERSION` (1) |
| `@beep/acp/schema-v1` | `AcpV1.models.ts` | Generated ACP v1 schemas |
| `@beep/acp/compat` | `AcpCompat.models.ts` | The normalized schemas the client speaks for both generations |
| `@beep/acp/rpc` | `AcpRpc.models.ts` | `AgentRpcs`, `ClientRpcs`, `CompatAgentRpcs`, `CompatClientRpcs`, `LEGACY_AGENT_METHODS`, `LEGACY_CLIENT_METHODS` |
| `@beep/acp/errors` | `Acp.errors.ts` | `AcpError` union and its members, `AcpRequestId`, `AcpRequestDiagnostics`, operation literal kits |
| `@beep/acp/json` | `AcpJson.codec.ts` | JSON text codec with the escaped-key guard |

`_generated/*` is not exported. `internal/*` resolves inside the workspace only
so package tests can reach the normalizers; it is `null` in
`publishConfig.exports` and excluded from docgen.

## Usage

### Client (`@beep/acp/client`)

The client spawns or attaches to an agent and speaks the `Compat` shapes for
both protocol generations. By default it negotiates: it sends an `initialize`
request that both generations understand and takes the generation from the
shape of the reply. Pin a generation with `protocolGeneration: "v1"` or `"v2"`.

```ts
import * as AcpClient from "@beep/acp/client"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type * as ChildProcessSpawner from "effect/process/ChildProcessSpawner"

const runPrompt = Effect.fnUntraced(function* (handle: ChildProcessSpawner.ChildProcessHandle) {
  const context = yield* Layer.build(AcpClient.layerChildProcess({ handle, protocolGeneration: "negotiate" }))
  const client = Context.get(context, AcpClient.AcpClient)

  // Handlers receive the request and an AcpRequestContext { method, requestId }.
  yield* client.handleRequestPermission((request) =>
    Effect.succeed({ outcome: { outcome: "selected", optionId: request.options[0]!.optionId } })
  )
  yield* client.handleSessionUpdate((notification) => Effect.log(notification.update.sessionUpdate))

  yield* client.agent.initialize({ protocolVersion: 2 })
  const session = yield* client.agent.createSession({ cwd: process.cwd(), mcpServers: [] })
  const result = yield* client.agent.prompt({
    sessionId: session.sessionId,
    prompt: [{ type: "text", text: "Hello" }],
  })
  return result.stopReason
})
```

Under generation 2 a `prompt` call resolves on the agent's idle `state_update`
(the RPC result is only an acknowledgement). A second prompt on a session that
is still busy fails locally.

### Agent (`@beep/acp/agent`)

The agent serves generation 2 only. Core handlers take the request and an
`AcpRequestContext`; an unregistered method answers `-32601`.

```ts
import * as AcpAgent from "@beep/acp/agent"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as NodeServices from "@effect/platform-node/NodeServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

const registerHandlers = Effect.gen(function* () {
  const agent = yield* AcpAgent.AcpAgent
  yield* agent.handleInitialize(() =>
    Effect.succeed({ protocolVersion: 2, capabilities: {}, info: { name: "my-agent", version: "0.0.0" } })
  )
  yield* agent.handleCreateSession(() => Effect.succeed({ sessionId: "session-1" }))
})

// Serve over the process stdio until the process is stopped.
const main = Layer.effectDiscard(registerHandlers).pipe(
  Layer.provide(AcpAgent.layerStdio()),
  Layer.provide(NodeServices.layer),
  Layer.launch
)

NodeRuntime.runMain(main)
```

The agent serves only while the scope of its layer stays open. `Layer.launch`
keeps that scope open. `registerHandlers.pipe(Effect.provide(AcpAgent.layerStdio()))`
would close the scope, and stop the agent, as soon as the handlers are
registered. `layerStdio` needs a `Stdio` service; `NodeServices.layer`
provides one on Node.

### Protocol (`@beep/acp/protocol`)

`makeAcpPatchedProtocol` is the JSON-RPC transport under both services. Use it
directly for raw peers (the ai-provider-cli test fixtures do this for
generation-1 agents).

```ts
import * as Protocol from "@beep/acp/protocol"
import * as Effect from "effect/Effect"
import * as HashSet from "effect/HashSet"
import type * as Stdio from "effect/Stdio"

const rawPeer = (stdio: Stdio.Stdio) =>
  Effect.gen(function* () {
    const transport = yield* Protocol.makeAcpPatchedProtocol({
      stdio,
      serverRequestMethods: HashSet.empty(),
      onExtRequest: (method, _params, context) => Effect.succeed({ method, id: context.requestId }),
    })
    yield* transport.notify("x/ready", {})
  })
```

### Schemas (`@beep/acp/schema`, `@beep/acp/schema-v1`, `@beep/acp/compat`)

```ts
import * as Compat from "@beep/acp/compat"
import * as Schema from "@beep/acp/schema"
import * as SchemaV1 from "@beep/acp/schema-v1"
import * as S from "effect/Schema"

S.is(Schema.ContentBlock)({ type: "text", text: "v2" }) // true
S.is(SchemaV1.AvailableCommand)({ name: "plan", description: "Plan", input: { hint: "Task" } }) // true
console.log(Schema.PROTOCOL_VERSION, Schema.V1_PROTOCOL_VERSION, Compat.ACP_UNKNOWN) // 2 1 "_acp_unknown"
```

`Schema` is generation 2 only. It has no v1-name aliases: the v1
`AuthenticateRequest` is `LoginAuthRequest` in v2, `SessionNotification` is
`UpdateSessionNotification`, `CancelNotification` is
`CancelSessionNotification`, and `LoadSessionRequest` has no v2 counterpart
(the client maps it to `session/resume` with `replayFrom: { type: "start" }`).
Use `SchemaV1` for the generation-1 names and `Compat` for the normalized
client shapes.

Most generated objects are open structs (`S.StructWithRest`). Spread their
fields through `.schema.fields`, and prefer `S.is` / `S.decodeUnknown*` to
`.make`.

## Code generation

`scripts/generate.ts` generates both generations through
`@beep/codegen-kit` in one run:

| Generation | Pinned release | Spec cache | Output |
| --- | --- | --- | --- |
| 2 | `schema-v2.0.0-alpha.3` | `spec/schema.unstable.json`, `spec/meta.unstable.json` | `src/_generated/schema.gen.ts`, `src/_generated/meta.gen.ts` |
| 1 | `schema-v1.21.0` | `spec/v1/schema.unstable.json`, `spec/v1/meta.unstable.json` | `src/_generated/schema-v1.gen.ts` (method tables go into `meta.gen.ts`) |

Both configs apply the kit transforms `nullableTypeArray`,
`unevaluatedPropertiesOpen`, `notDiscriminatorPattern`,
`uniqueDiscriminatorOneOfAsAnyOf` and `distributeAllOf`.

```bash
# Regenerate from the committed caches (offline).
bun run --cwd packages/drivers/acp generate

# Download the pinned release assets, refresh the caches, then regenerate.
bun run --cwd packages/drivers/acp generate -- --refresh

# Fail on drift between the caches and the committed output (offline; CI Codegen Drift).
bun run --cwd packages/drivers/acp generate:check
```

To bump a pin, change `V2_SCHEMA_RELEASE` or `V1_SCHEMA_RELEASE` in
`scripts/generate.ts`, run `generate -- --refresh`, then `generate:check`.
Build and check stay offline.

## Breaking changes (t3code port)

- The `Terminal` namespace and the `@beep/acp/terminal` subpath are removed,
  together with `AcpTerminal`, `MakeTerminalOptions` and `makeTerminal`.
  `AcpAgent.client.createTerminal`, `readTextFile` and `writeTextFile` are
  removed too: generation 2 has no client fs or terminal methods. The client
  still answers generation-1 `fs/*` and `terminal/*` requests through
  `handleReadTextFile`, `handleCreateTerminal` and the other handlers.
- `Schema` (`@beep/acp/schema`) is now ACP v2 (`schema-v2.0.0-alpha.3`,
  `PROTOCOL_VERSION` 2). The v1 schemas (`schema-v1.21.0`) moved to
  `SchemaV1` (`@beep/acp/schema-v1`).
- `AcpAgent` serves generation 2 only. `handleSetSessionMode` and
  `handleSetSessionModel` are gone; `handleAuthenticate`/`handleLogout` serve
  `auth/login`/`auth/logout`, and `handleLoadSession` serves `session/resume`
  from the start of the history.
- The individual `XxxRpc` constants in `@beep/acp/rpc` are module-private.
  Use the groups (`AgentRpcs`, `ClientRpcs`, `CompatAgentRpcs`,
  `CompatClientRpcs`) and the method tables.
- Client handlers receive `(request, context: AcpRequestContext)`; agent
  methods take and return `@beep/acp/compat` types; `make` takes an
  `AcpStdio`; the elicitation handler returns the flat
  `CreateElicitationResponse` (the client nests it for the legacy
  `session/elicitation` methods); the new `protocolGeneration` option defaults
  to `"negotiate"`.
- Errors: `AcpProtocolParseError` carries `operation` and diagnostics instead
  of `detail`, and `AcpProtocolParseError.new` is removed;
  `AcpTransportError.detail` is optional and the error has a real `message`;
  `AcpProcessExitedError` gains `signal`, `pid` and `stderr`; the new
  `AcpInputStreamEndedError` joins the `AcpError` union, so exhaustive matches
  need an arm for it.
- Typed RPC request ids are numbers starting at `RPC_REQUEST_ID_START`
  (`2 ** 30`); inbound ids are echoed verbatim (a string id is no longer
  answered with `id: null`).

The package is private, so these changes ship without a changeset.

## Provenance and design decisions

The protocol, client, agent, error model, compat layer, RPC groups and many
tests are ported from t3code `packages/effect-acp` at commit
`31dcc7c51309697af5fd5584d507a1359e0fb62f` (MIT, Copyright (c) 2026 T3 Tools
Inc.; see `THIRD_PARTY_NOTICES.md`). The behaviour follows t3; the code
follows this repository's laws (schema-first models, `Effect.fn` spans,
`effect/HashMap` and `HashSet`, `LiteralKit`, typed errors).

| ID | Decision | Reason | Reversal |
| --- | --- | --- | --- |
| D1 / O1 | One PR on `feat/acp-t3code-port`. The client and agent are ported once, straight to the dual-generation design. (Overrides the planned two-PR split.) | No interim hardening code that the next stage would replace. | Split a follow-up if review cost dominates. |
| D2 / O2 | Pin `schema-v2.0.0-alpha.3` and `schema-v1.21.0`. | Parity with the ported t3 runtime, tests and recorded fixtures. | Follow-up PR bumps to alpha.9 / v1.26.0 with `generate -- --refresh`. |
| D3 | `Schema` = v2, `SchemaV1` = v1.21, `Compat` = normalized client surface; no v1-name aliases in `Schema`. | 223 names collide; aliases such as `LoadSessionRequest` meaning v2 `ResumeSessionRequest` are a trap. | Add aliases if a consumer needs them. |
| D4 | `AcpAgent` is v2-only. The ai-provider-cli grok and cursor fixtures are raw v1 peers on `makeAcpPatchedProtocol`. | No production consumer of the agent; raw peers exercise the real generation-1 client path. | A test-only v1 agent built from `RpcServer` and the v1 groups. |
| D5 | Delete `AcpTerminal.models.ts`, `./terminal`, the `Terminal` namespace and the agent's fs/terminal client calls; the client keeps the v1 handlers. | v2 has no client fs/terminal methods; upstream deleted the module. | Reintroduce as a client terminal host kit. |
| D6 | Keep the beep file names, `Json`, the object-form `layerChildProcess({ handle, ... })` and `layer({ stdio, ... })`, `HashSet` `serverRequestMethods`, curried `request`/`notify`, `AcpExtensionRegistrars` (now with `context`), `AcpProtocolLoggingOptions`, `AcpProtocolLogEvent`. | Keeps inventory keys, Markdown paths and the ai-provider-cli call site stable. | — |
| D7 | Typed RPC ids are numbers from `2 ** 30`; ext ids are numbers from 1; inbound ids pass through verbatim; `AcpRequestContext.requestId` is the raw id. | int32-safe ids for strict peers; fixes the `"req-1" -> id: null` bug. | — |
| D8 | Inbound extension requests run forked in a scoped `FiberSet`, at most 64 at once; past the bound a request is answered `-32603` at once, so the reader never waits for a permit. Each notification handler runs on its own fiber, and the reader waits for it until it finishes or sends a request on the same connection; at most 64 handlers may wait on the peer that way, past which the handler's request fails with `AcpTransportError`. Handlers still start in arrival order. (Deviation from t3, which runs both inline.) | Removes the reentrancy deadlocks when an extension or notification handler awaits an outbound request. | Revert to inline dispatch and use RpcServer-based fixtures. |
| D9 | Server, client and outgoing queues stay `bounded(1024)`; notifications use a `sliding(32)` queue (t3 parity); the 16 MiB line cap and the client's 256-entry pending-notification cap stay. When the stdout writer fails, senders parked on the full outgoing queue fail with the writer's error. | Removes the 1,024-notification deadlock without unbounded memory, and no production consumer drains `incoming`. | Tune the capacities. |
| D10 | Keep the NDJSON frame decoder and the escaped-key guard; skip whitespace-only lines; a protocol-shaped `Die` becomes `Fail`. | The V8 escaped-key bug reproduces locally; blank lines are harmless. | — |
| D11 | Product-neutral strings: `_acp_unknown`, client info `{ name: "@beep/acp", version: "unknown" }`, `x/*` test methods, MCP server id `test-server`. | Package law. | — |
| D12 | `XxxRpc` constants are module-private; only groups and method tables are exported. | No consumer imports them; fewer exports to document. | Re-export when needed. |
| D13 | `Compat` is authored as schemas; the v1/v2 projections live in `src/internal/normalize.ts` and decide with `S.is` and `Match`, without casts. | Zero schema-first inventory growth; removes about 70 type assertions present upstream. | — |
| D14 / O3 | No changeset and no goal packet; the decision record lives in the PR body and this section. | Private package. | — |
| D15 | Codegen kit transforms are opt-in; ecfr, govinfo and runpod output stays byte-identical. | Kit law. | — |
| D16 | `AcpClientOptions.protocolGeneration` (`negotiate` by default). ai-provider-cli picks the mode per provider; see the table below. | Each managed path is written against the methods of one protocol generation. | Per provider, below. |
| D17 / O4 | A v2 idle with `stopReason: "error"` still resolves `prompt`. A generation-1 client fails `deleteSession`, `listProviders`, `setProvider` and `disableProvider` locally. `PROTOCOL_METHODS` is not generated; there is no `-32800` constructor. | t3 parity. | Gate generation-1 calls on advertised capabilities; revisit the error idle with the session runtime. |
| O5 | `provider-acp` and `provider-acp-registry` are not ported. | Scope. | Follow-up PRs. |

D16 per provider in `@beep/ai-provider-cli`
(`AiProviderCliSession.stdio.service.ts`, `openStdio`):

| Provider | `protocolGeneration` | Reason | Reversal |
| --- | --- | --- | --- |
| grok | `"v1"` | The managed Grok path is written against generation 1: `authenticate` with `cached_token`, the legacy `models` readback and the v1 `stopReason`. Generation 2 removed the first two, so a generation-2 answer would break every managed Grok open. `"v1"` sends the same pure v1 `initialize` as before the port. | Switch to `"negotiate"` once the managed Grok path supports generation 2. |
| cursor | `"v1"` | The managed Cursor path needs generation 1: `session/set_mode`, which generation 2 fails locally, and the legacy `models` readback. | Switch to `"negotiate"` once the managed Cursor path supports generation 2. |
| codex | n/a (`"negotiate"` is passed but unused) | Codex never calls `agent.initialize`; it speaks its own app-server methods through `raw.request` and `raw.notify`. | — |
| claude | n/a | Claude runs through its own stream-json transport (`openClaude`), not the ACP client. | — |

A live smoke on 2026-10-21 ran the ported client against the real `grok`
(`grok-4.7`) and `cursor-agent` binaries. Both answered a negotiating
`initialize` with `protocolVersion: 1`, and `initialize`, `authenticate`,
`session/new`, `session/set_mode` and `prompt` all completed. Negotiation
would therefore work today; the pin rules out a later generation-2 answer
moving these paths onto methods they do not support. The grok and cursor
test fixtures answer `initialize` only for a pure v1 request
(`protocolVersion: 1`, no `info` or `capabilities`), and a session test
asserts the exact handshake params each provider sends.

Further deviations from t3, each deliberate:

- Error fields are `Option`s (`OptionFromOptionalKey`), `cause` stays optional
  everywhere, and `AcpRequestDiagnostics` is a schema, not an interface.
- The codegen walk is schema-aware: t3's generator deletes a property literally
  named `anyOf`, so t3's `TitledMultiSelectItems` is `Never`; here it is a real
  struct. Pattern escaping uses `effect/RegExp.escape`.
- Generation-1 updates go through the same validating normalizers as
  generation 2; normalization keeps rest keys; a malformed idle `error` is
  dropped.
- `callRpc` is a `dual` with data-first order `(effect, method)`.
- Peer `@effect/rpc/*` frames (`Eof`, `Ping`, `Ack`, `Interrupt`) are read as
  ordinary JSON-RPC notifications or requests, not as effect-rpc control
  messages, so a peer cannot close the writer or interrupt typed handlers with
  them. The frame decoder differs from effect's NDJSON parser here on purpose.
- Typed requests carry JSON-RPC members only (`jsonrpc`, `method`, `params`,
  `id`); effect-rpc trace fields and headers never reach the wire.
- A typed request handler that dies answers `-32603` with a generic message;
  the defect is logged, never sent. A request that the RPC server rejects
  (for example a reused in-flight id) is skipped with a warning instead of
  stopping the server.
- Classifying a connection's termination is bounded at 5 seconds and falls
  back to `AcpInputStreamEndedError`, so a peer that closes stdout without
  exiting cannot park callers. Termination also interrupts running extension
  request handlers.
- Decode-failure warnings are deduplicated by kind with array indices folded,
  at most 64 kinds per connection.
- A generation-1 prompt result outside the v1.21 schema keeps its string
  `stopReason` (and `_meta`, and `usage` when valid); `end_turn` is used only
  when `stopReason` is missing or not a string.
- A re-sent `UnknownContent` block goes on the wire as the original block it
  carries; a block with no wire form fails locally with `-32602`. The
  `_acp_unknown` sentinel is never sent.
- ai-provider-cli classifies `AcpProcessExitedError` and
  `AcpInputStreamEndedError` as a `closed` runtime ("Native runtime ended
  before the request completed") instead of a `transport` failure. Both mean
  the native process or its output ended, which the Claude path already
  reports as `closed`; other ACP failures stay `transport` with only the
  JSON-RPC code. To reverse, drop the `EndedRuntime` arm in
  `transportFailure` (`AiProviderCliSession.profile.service.ts`).

## Development

```bash
bun run build
bun run check
bun run test
bun run test:integration
bun run generate:check
bun run lint:fix
```

Unit tests stay outside `test/integration`; integration tests live under
`test/integration` and spawn `test/fixtures/acp-mock-peer.ts` (a v2 agent).
Tests import package source through `@beep/acp/*` aliases; relative imports
are only for local helpers and fixtures.

## License

MIT
