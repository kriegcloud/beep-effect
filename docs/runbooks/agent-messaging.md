# Local agent messaging

`bun run beep agent-message` connects explicitly owned managed workers through a
private SQLite mailbox. The first implementation supports queued direct messages.
It does not attach to an arbitrary open Desktop conversation or elect an
orchestrator. Provider-specific capabilities and evidence remain separate.

This is an experimental managed route. The bridge goal records a successful
autonomous Codex/Grok and Codex/Claude send, reply and acknowledgment exchanges
with settled native turns, persisted grant budgets and owned cleanup. Claude
also passed queued acceptance during an active native turn and subsequent drain. Consult the [per-mode evidence](../../goals/agent-session-bridges/research/NATIVE-QUALIFICATION.md)
before treating another provider or application surface as qualified.

The operator controls enrollment and grants. Each provider receives only a scoped
stdio MCP server with send, reply, inbox, acknowledge, inspect and discover tools.
Peer text carries no launch, merge, policy-change or spending authority.

## Owned state and startup

Choose an absolute private directory outside the repository, such as a dedicated
child of `~/.cache/beep/agent-messaging`. Keep the directory mode `0700` and profile
and grant files `0600`. The CLI refuses a symlink or group/world-accessible state
root, database, profile or grant file. Raw transcripts and credentials never belong
in a tracked goal packet.

Start by inspecting the command help:

```sh
bun run beep agent-message --help
bun run beep agent-message serve --help
```

`serve` requires an explicit state directory, private launch profile, private
`--grant-file`, endpoint, participant, owner, repository scope and positive
generation. The grant file must bind this worker's endpoint, owner, generation
and repository scope; its optional conversation scope constrains messages
delivered to the native model. Allowed recipients constrain outbound messages.
A profile uses the
`ManagedLaunchProfile` contract in `@beep/ai-provider-cli`. Its executable,
arguments, environment and MCP servers are trusted host configuration; never build
one from peer message text. It must select an existing subscription and the
approved model. Each worker gets its own profile root and disposable workspace.
Do not inherit interactive hooks, plugins, API keys or unrelated MCP servers.
For Grok, the profile's `sandboxWritablePaths` must contain only this command's
canonical state directory. Its named native sandbox extends the read-only profile
with that mailbox allowance. It does not make the repository writable.

The driver starts and verifies its native session before registering the endpoint.
Managed `serve` then registers and validates its host-issued receiving grant
before dispatch. Out-of-scope queued messages fail before any native prompt and
release their claim, so they cannot inject context or leave an ambiguity hold.
If the receiving grant expires or is replaced, the current claim receives a
definite failed receipt with an `invalidGrant` detail, then `serve` exits. Later
queued messages remain untouched by that worker; normal generation replacement
and reconciliation rules govern them.
MCP startup may happen before registration; tool calls remain unauthorized until
the host registers a current grant. The grant binds one endpoint generation and
owner to a repository scope, allowed recipient list, expiry and persistent message
budget. An optional conversation scope restricts it to one host-selected task;
omitting that scope grants access across conversations within the other limits.
Register its private JSON file with:

```sh
bun run beep agent-message grant --state-dir "$STATE_DIR" --file "$GRANT_FILE"
```

`STATE_DIR` and `GRANT_FILE` above are operator-supplied absolute paths. The grant
file is an identifier for persisted authority, not a way for a model to mint a new
grant. Re-registering the same grant does not reset its spent budget. The model
cannot choose its sender identity through tool parameters.

## Sending and observing

Use `list` to inspect enrollment evidence. A handshake advertises capability;
actual delivery and participant acknowledgement supply stronger evidence for a
particular message. Enrollment does not prove native Desktop attachment.

The operator `send --file` command accepts a JSON `Envelope` with stable message
and idempotency IDs, conversation, scoped sender and direct recipient, timestamps,
body and the target's current capability/policy fingerprints. `reply --file`
requires `replyTo` and validates the original conversation and both participants.
An equal-ID/equal-content retry returns the original acceptance. Different content
with the same identity fails.

Models normally use the scoped tools instead of constructing full envelopes. The
host fills their authenticated sender, policy fingerprints, timestamps and expiry.
The reply tool derives its recipient and conversation from the original message.
Messages and grants are checked transactionally against current generations.

```sh
bun run beep agent-message list --state-dir "$STATE_DIR"
bun run beep agent-message send --state-dir "$STATE_DIR" --file "$ENVELOPE_FILE"
bun run beep agent-message inspect --state-dir "$STATE_DIR" --message-id "$MESSAGE_ID"
bun run beep agent-message watch --state-dir "$STATE_DIR" --message-id "$MESSAGE_ID"
```

`watch` emits durable receipt rows as JSON lines until interrupted. `inbox` reads
queued messages; `acknowledge` records explicit recipient consumption. Operator
commands have host authority and must not be exposed as general model tools.

## Delivery and recovery

Acceptance commits before dispatch. A claim records the owner, attempt and lease
before native inference, outside the SQLite transaction. Competing dispatchers
cannot claim the same active endpoint. The provider call has a bounded lifetime.

The serve loop retries classified SQLite lock timeouts for recovery, claiming and
completion writes, up to eight retries at 250 ms spacing after the initial attempt.
Completion retries retain the known native result and never resubmit the prompt.
If the budget is exhausted, the owned session stays alive and the claim stays
fenced; the local result is discarded and later lease recovery can leave an
ambiguity hold. Other storage and policy errors terminate the command.

Acknowledgement proves participant consumption; it does not prove the provider
turn has finished or its work succeeded. Acknowledging during an active turn keeps
the dispatch fence until a known terminal result. An uncertain call retains that
fence even if it already acknowledged. An expired in-flight attempt becomes
`ambiguous`, with its original owner retained. `recover` records recovery facts
without resending uncertain work. A delivered message that reaches its expiry
without acknowledgement also becomes an owned ambiguity.

If acknowledgement precedes an uncertain native completion, receipt history
retains the acknowledgement and adds an ambiguity diagnostic. A confirmed result
for that exact active attempt can reconcile the hold. Replaying a completion for
an already settled attempt cannot re-open it.

An ambiguity requires evidence from the original owned runtime and its receipts.
The operator-only `resolve-ambiguity` command records a known terminal delivery
for that exact message, endpoint enrollment and dispatch attempt by comparing
against immutable terminal proof recorded by the original host adapter. It does
not query a provider or replay work. An operator assertion cannot create proof;
elapsed time, a replacement session or peer text is insufficient evidence. Do not delete rows,
reset quotas or change generations to bypass a hold.

Supply a private `0600` JSON file using the `AmbiguityResolution` contract:

```json
{
  "resolutionId": "owned-resolution-1",
  "messageId": "owned-message-1",
  "endpointId": "owned-recipient",
  "endpointGeneration": 1,
  "attemptGeneration": 1,
  "attemptOwnerId": "owned-dispatcher",
  "operatorId": "owning-operator",
  "disposition": "delivered",
  "evidence": "Original owned runtime terminal receipt and its recorded correlation",
  "runtimeEvidence": {
    "adapter": "codex",
    "sessionId": "original-owned-session",
    "messageId": "owned-message-1",
    "turnId": "original-native-turn",
    "outcome": "delivered",
    "stopReason": "completed"
  },
  "reason": "The owning operator established this exact attempt's terminal outcome"
}
```

```sh
bun run beep agent-message resolve-ambiguity --state-dir "$OWNED_STATE" --file "$RESOLUTION_FILE"
```

The store atomically retains the complete decision, timestamp and original
receipt sequence. An identical request returns the same receipt after a restart;
changed content or a second decision for the same attempt is rejected. An
ordinary ambiguous message becomes `delivered` or `failed`, without returning
to the send queue. A `failed` decision is rejected when that exact attempt already
has a confirmed `delivered` receipt; an expired ACK deadline cannot overturn
recorded delivery. Delivery still requires participant acknowledgement. If an
ACK was already recorded, it remains recorded while the native dispatch hold is
released.

The authenticated principal is the local OS owner of the private state directory
and private evidence file; `operatorId` is an audit label, never a credential.
Inspect the original immutable evidence first:

```sh
bun run beep agent-message settlement --state-dir "$OWNED_STATE" --message-id "$MESSAGE_ID"
```

`serve` records the terminal response before recording delivery completion. Each
settlement atomically retains the full original claim (message, owner, attempt,
lease), endpoint generation, original session, adapter and actual terminal
response correlation. The first settlement is immutable; identical writes are
idempotent and conflicting writes fail. Model text and operator input never
create a settlement. Reconciliation compares the complete submitted evidence to
that original record before releasing the hold.

The native contracts reflect the transports: Codex requires the observed
`turn/start` ID and the matching original thread/turn `completed` notification.
Claude requires a successful terminal `result` from the verified original
session associated with the serialized active prompt. Grok and Cursor require
the actual `end_turn` response to the original in-flight ACP `session/prompt`
request. All include the host's original `messageId`; this is request correlation,
not an invented provider result ID. Claude and ACP do not claim a native turn ID
that the adapter has not observed. A native error, timeout, interrupted stream,
subscription rejection or accepted submission produces no successful terminal
proof and cannot be recast as verified failure. The `injected` evidence variant
exists only for deterministic failure and rollback tests.

If the process dies after the settlement commit but before completion, the
original record survives and an authorized host can reconcile without another
inference. If it dies before a settlement commits, the attempt stays uncertain.
A store from an older runtime, including either retained live ambiguity hold,
has no qualifying original settlement: `settlement` reports the missing proof,
and `resolve-ambiguity` refuses to release it. Startup does not fabricate or
backfill evidence, and there is no operator command to insert native proof.

This operation is absent from peer commands and model-accessible MCP tools.
It has no automatic startup behavior: existing holds are unchanged unless their
owning operator explicitly submits a valid decision.

Admission retains the global pending ceiling and also bounds each destination
endpoint. The default store limits are 1,000 globally and 100 per endpoint;
factory callers may set both, and a lower global bound still wins. Configure
`maxPendingPerEndpoint < maxPending` when shared-capacity isolation is required;
a configuration with the endpoint limit equal to or larger than the global
limit explicitly provides no reserved headroom. A separate `maxStoredMessages`
ceiling (default 100,000) counts every retained message, terminal history included.
At that ceiling new admission stops, exact acceptance replay still works, and no
receipt or history is deleted. Retain and back up the stopped store; provision a
separate explicitly enrolled mailbox only for independent new work. Unresolved
original attempts cannot be replayed or cleared by moving to another store. This is a logical retained-message
storage bound, not a filesystem byte or WAL size guarantee. Each message has one
attempt and at most one immutable settlement and resolution; terminal history
cannot grow without new admitted messages. Unresolved attempts and delivered messages awaiting ACK count toward both limits. Exact
acceptance retries remain idempotent at capacity, and rejected admission does
not spend a launch grant's message budget.

A higher endpoint generation does not redirect old mail. Replacement refuses
active or ambiguous dispatches, as well as delivered messages awaiting
acknowledgement, and terminalizes unsent messages for the old
generation with a diagnostic receipt. New grants and messages then target the
new generation.

## Disposal and retained evidence

Stop only the workers and MCP children owned by this launch. Keep their mailbox
and receipts. The store uses SQLite WAL with FULL synchronization and refuses
unknown schema versions; process-crash tests do not establish power-loss behavior
for every filesystem.

For a stopped-writer backup, close all owned provider and SQLite scopes first,
then retain the database and any WAL/SHM sidecars together in another private
directory. For a live database, use SQLite's consistent backup facility. Never
copy only the main file while a WAL writer is active.

See the [router goal](../../goals/agent-message-router/SPEC.md) and
[bridge goal](../../goals/agent-session-bridges/SPEC.md) for the current acceptance
matrix, reproducible probes and the separately gated existing-app work.

## Existing T3-owned threads

`agent-message attach-t3 --state-dir <private-state> --profile-file <private-profile>`
attaches the mailbox to one explicitly owned visible T3 thread. It opens a scoped
HTTP client and worker; stopping that worker leaves the T3 app and native thread
running. The profile is separate from a managed CLI launch. It records the exact
host thread/project/workspace, provider instance, approved model and medium effort,
full-access/default host configuration, artifact/source/version baseline, private
OAuth file, endpoint ownership/generation and grant-bound peer wrapper. Native
session/policy observation remains a dated independent baseline: MCP does not
provide that native identity or effective permission readback.

Create a private executable wrapper that accepts only the six peer operations and
operation-specific arguments, fixes the state and grant files, and invokes
`agent-message peer <operation> --state-dir <fixed-state> --grant-file <fixed-grant>`.
Reject caller attempts to add state/grant/admin flags. The wrapper is a scoped
protocol return path, not OS isolation of a Full-access model. The underlying
Toolkit checks the persisted grant on every operation; file contents alone do not
mint authority. Register the host-issued grant after the bridge emits its enrolled
binding. Record the exact owned coordinator/worker as desktop-session register
units, including ownership and an orphan plan; this never changes the orchestrator
holder or merge authority.

Peer operations are `send --message-id --conversation-id --recipient --body`,
`reply --message-id --reply-to --body`, `acknowledge --message-id`, `inspect
--message-id`, `inbox`, and `discover`. These invoke the existing messaging handlers,
print their final encoded result and fail the command on returned tool failure.
There is no peer registration, grant issuance, sender selection or recovery API.

The first attachment slice submits queue mode only. Initial enrollment requires idle/completed
with no active run. Once enrolled, delivery may queue a distinct returned run
behind an active owned native turn; it never steers or merges content into that turn. A Beep claim commits before the T3 send; a stable hashed client
request key and private bounded checkpoint correlate the original attempt. Queue
acceptance is not consumption. Before any native submission, the envelope must match the receiving grant
conversation/repository/direct target and its explicitly allowed peer endpoints. This attached mode treats the
receiving grant allowedRecipients as a symmetric peer allowlist for inbound
senders as well as outbound destinations.
Foreign conversations and senders fail without exposing their text to T3. The
peer must ACK through its scoped wrapper and
the exact returned run must complete under matching host readback before delivery
settles. Preflight and postcheck are separate reads: T3 provides no atomic
expected-policy compare-and-send. Detected drift, timeout, lost receipt, stale run
or missing ACK retains ambiguity, with no blind external resend. A rejected preflight
is a definite failed attempt before submission. The checkpoint is reconciliation
evidence; it does not automatically recover or clear a durable ambiguity hold.

Reverse this composition by stopping its owned bridge worker, revoking its owned
OAuth client and retaining the private mailbox/checkpoint. Preserve the original
T3 conversations and independently observed native identities. Native T3 tools
have their own broader authorization; only actual peer/router traffic earns the
Beep grant enforcement claim. Separate Claude/ChatGPT Desktop attachment remains
unqualified.
