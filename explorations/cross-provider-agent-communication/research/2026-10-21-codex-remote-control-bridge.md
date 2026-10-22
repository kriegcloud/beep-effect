# 2026-10-21: Codex bridge to the attorney PC

Qualified route: a plain `codex app-server` WebSocket listener on `tom-pc-1`,
bound to loopback, reached through an SSH port-forward from the workstation and
authenticated with a capability token. From the workstation one command queues a
prompt to a Codex thread on the PC and returns its reply. The `codex
remote-control` relay (what ChatGPT suggested) is refuted as a CLI transport.

Operator ruling S42 (2026-10-21) asked agents to automate PC-side steps on the
attorney's Windows PC instead of relaying them. Scope here: the Codex thread
surface only; GUI steps stay on the existing SSH plus interactive-task route.

## Measured facts

| Item | Observation (2026-10-21, UTC) |
| --- | --- |
| PC Codex CLI | codex-cli 0.160.1 (npm `@openai/codex`, Node 24), `codex remote-control {start,stop,pair}` present |
| PC Codex Desktop | Store package `OpenAI.Codex 26.1016.*`, two bundled `codex.exe` app-servers under `%LOCALAPPDATA%\OpenAI\Codex\bin\<hash>\`, stdio only: no TCP listener (`netstat -ano`); no CLI-managed daemon directories in `%USERPROFILE%\.codex` |
| Workstation Codex CLI | codex-cli 0.163.0; its managed daemon runs `codex app-server --remote-control --listen unix:// --managed-daemon` with `settings.json` `remoteControlEnabled: true` and no network bind |
| `codex remote-control pair --json` | `{pairingCode, manualPairingCode, environmentId, expiresAt}`: registers an environment with OpenAI's relay for ChatGPT or Codex app clients; the relay-hosted thread id has the `remote-control:env_…` host form |
| `codex queue --remote` | accepts `ws://`, `wss://`, `unix://` only; no relay client exists in the CLI |
| Listener | `codex app-server --listen ws://127.0.0.1:48123 --ws-auth capability-token --ws-token-sha256 <digest>`; `netstat -ano`: `TCP 127.0.0.1:48123 LISTENING`; banner: "binds localhost only (use SSH port-forwarding for remote access)" |
| Tailnet bind | `--listen ws://<tailnet-ip>:48123` also came up LISTENING on the Tailscale address only and was reachable from the workstation (the PC's `Tailscale-In` rule allows inbound on its Private-profile interface), but the client refuses it: `--remote-auth-token-env requires a wss:// or loopback ws:// remote`. Reverted to loopback |
| Auth | no header: HTTP 401; wrong token: `HTTP error: 401 Unauthorized`; right token: connected |
| `codex queue` by UUID | `Queued message … for thread …`; the idle thread started a turn within 2 s; rollout `task_complete.last_agent_message = "PONG"`, 2.3 s |
| One-shot client | `codex-remote-ask.ts`: resume with explicit policy, `turn/start`, wait `turn/completed` (with a `thread/read` fallback that runs after the deadline on its own 5 s budget); printed `{"status":"completed","durationMs":3887,"reply":"PONG"}`; 5 s wall clock. Apart from that read and `turn/interrupt` (5 s each), every RPC is bounded by the remaining budget; on timeout or error it sends `turn/interrupt` for the turn it started before exiting (over a fresh connection when the socket is gone); the timeout, busy-thread and socket-loss paths were proven against a local 0.163.0 app-server |
| Effective policy | server echoed `approvalPolicy: never`, `sandbox: readOnly (networkAccess false)`, model `gpt-6.1-sol` (the PC config has no model key); `remoteControl/status/changed = disabled` on this server |

Receipts: the probe thread id, the task wrapper log and the rollout path are in
the orchestrator's side-session notes, not in this public packet. The scripts
are in [spike/codex-remote-bridge](spike/codex-remote-bridge/README.md).

## Reproducible command shape

Start the listener on the PC (SSH; one-shot interactive task so the server
outlives the SSH session; a trigger dated in the past never fires again):

```bash
ssh -o BatchMode=yes <pc-user>@tom-pc-1 'schtasks /create /tn CodexWsBridge /tr "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File $env:USERPROFILE\.codex\remote-ws\start-ws.ps1" /sc once /sd 01/01/2000 /st 00:00 /it /f; schtasks /run /tn CodexWsBridge; Start-Sleep 4; netstat -ano | findstr ":48123"'
```

Tunnel, ask, read the reply (workstation):

```bash
ssh -f -N -M -S ~/.ssh/cm-tom-pc-bridge -o BatchMode=yes -o ExitOnForwardFailure=yes -L 127.0.0.1:48123:127.0.0.1:48123 <pc-user>@tom-pc-1
CODEX_TOMPC_WS_TOKEN="$(cat ~/.config/beep/tom-pc-codex-ws.token)" bun run explorations/cross-provider-agent-communication/research/spike/codex-remote-bridge/codex-remote-ask.ts --url ws://127.0.0.1:48123 --token-env CODEX_TOMPC_WS_TOKEN --thread <uuid> --text "probe: reply with the single word PONG and take no action"
```

`--new --cwd 'C:\PracticeKG\bridge-probe' --name "<thread name>"` creates a
thread instead of resuming one. The stock CLI also works for the send leg,
by UUID only:

```bash
CODEX_TOMPC_WS_TOKEN="$(cat ~/.config/beep/tom-pc-codex-ws.token)" codex queue --remote ws://127.0.0.1:48123 --remote-auth-token-env CODEX_TOMPC_WS_TOKEN --thread <uuid> --message "<text>"
```

`codex queue` returns after queueing; read the reply with the ask client,
`thread/read`, or the rollout under `%USERPROFILE%\.codex\sessions\` over SSH.

Stop (PC): `Stop-Process -Id (Get-Content $env:USERPROFILE\.codex\remote-ws\app-server.pid)`,
then `schtasks /end /tn CodexWsBridge; schtasks /delete /tn CodexWsBridge /f`.
Close the tunnel through its control socket, never with `pkill -f` (a
pattern that contains the port matches the compound shell that runs it):
`ssh -S ~/.ssh/cm-tom-pc-bridge -O exit <pc-user>@tom-pc-1`. The listener was
stopped and the task removed at the end of this probe; the wrapper stays in
`%USERPROFILE%\.codex\remote-ws\`.

## Token handling and rotation

- The token is 32 random bytes as hex, written once, newline-free, to
  `~/.config/beep/tom-pc-codex-ws.token` (mode 0600) on the workstation
  (`openssl rand -hex 32 | tr -d '\n' > <file>`) and read into an environment
  variable at call time; it is never in argv, logs, chat or the repo.
- The PC holds only its SHA-256 digest (`--ws-token-sha256`), inside the wrapper
  script in `%USERPROFILE%\.codex\remote-ws\` (directory ACL: the PC user and
  SYSTEM only). No token file exists on the PC.
- Digest: `printf %s "$(cat ~/.config/beep/tom-pc-codex-ws.token)" | sha256sum |
  cut -d' ' -f1`, the bytes exactly as the client sends them. Hashing a token
  file that ends in a newline yields a digest that never matches (every
  connection gets 401).
- Rotate: generate a new newline-free token file on the workstation, compute
  its digest as above, replace the digest in the wrapper over SSH, restart the
  listener. Revoke: stop the listener; delete the token file.
- No pairing exists on this route. `codex remote-control pair` is relay
  pairing for ChatGPT clients and is not used.
- The agent service account cannot write the 1Password vault; if the token
  should live there, the operator adds it through the documented layout script
  and the client reads it with `op read` at call time.

## Security posture

- Bind: loopback only on the PC. Exposure path: SSH (key auth, port 22 already
  firewalled to Tailscale addresses) plus the bearer token. Nothing new listens
  on the tailnet; Tailscale Serve was left untouched because that host runs a
  public Funnel and a misplaced `wss://` port would publish the bridge.
- Agent mode of a bridge thread: whatever the caller passes. The PC's
  `config.toml` defaults are `approval_policy = "never"` and `sandbox_mode =
  "danger-full-access"`, so a thread started without explicit policy inherits
  full access. The ask client always sends `approvalPolicy` and `sandbox`, reads
  them back from the `thread/start` or `thread/resume` response, and exits
  without running a turn when they differ (the explicit-policy precondition
  from the 2026-10-09 decision). On a client timeout or a failed RPC it sends
  `turn/interrupt` (bounded to 5 s) for the turn it started before exiting.
  A dropped tunnel is the exception: the interrupt cannot travel over the
  dead socket and the app-server does not cancel a turn when a connection
  drops, so the turn keeps running on the PC. The client then makes one
  bounded reconnect attempt to send the interrupt and otherwise prints
  `interruptNotPossible` with the thread and turn ids; recovery is to re-open
  the tunnel and send `turn/interrupt {threadId, turnId}` (for example with
  `codex-ws.ts --requests-file`).
- Tool reach: the thread inherits the PC config's MCP servers and plugins
  (`codex_apps`, `node_repl`, `cua_repl`, `box`), which include computer use.
  The sandbox mode does not gate MCP tool calls and `never` means no human
  approval. Treat prompts sent through this bridge as able to act on the
  attorney's desktop; keep them narrow until a hardened listener config (MCP
  servers disabled by `-c` overrides) is qualified.
- Identity: turns run under the attorney's signed-in ChatGPT account on the PC
  and spend that plan's quota; the default model there was `gpt-6.1-sol`.
- Ownership: the Codex Desktop's own threads (including the relay-hosted
  `CHATGPT_TOM_PC`) live in the Desktop's bundled runtime. Do not resume them
  from this listener: two runtimes would write one rollout. Create bridge
  threads with `--new` or reuse the named probe thread.

## Gotchas

- `--remote-auth-token-env` is refused for non-loopback `ws://`; use the SSH
  tunnel or a real `wss://` front.
- `codex queue --thread <name>` from the Linux client fails against the Windows
  server (`thread/list` decode: `AbsolutePathBuf deserialized without a base
  path`); use the UUID, which goes straight to `thread/queue/add`.
- Turn notifications stream only on the connection that started or resumed the
  thread; a passive subscriber sees status changes but no `turn/*` or `item/*`.
  The ask client resumes first, then starts the turn.
- `thread/read` with `includeTurns: true` still works on 0.160.1 and returns
  the agent messages, but the server flags it deprecated in favour of
  `thread/turns/list` and `thread/items/list`.
- A `schtasks /sc once /st 23:59` trigger fires that night; use `/sd 01/01/2000
  /st 00:00` (verified: task runs on `/run`, Next Run Time `N/A`).
- `turn/start` on a thread whose turn is still running does not open a new
  turn: it appends the input to the active turn (steer semantics) and returns
  that turn's id. The ask client refuses with exit 9 when the resumed thread
  reports status `active`; use `codex queue` for follow-ups to a busy thread.
- `thread/read` with `includeTurns` hydrates history and can label a turn that
  is still running as `interrupted` with no `completedAt`. The client's fallback
  treats only `completed`, or a terminal status with `completedAt`, as finished.
- `codex remote-control start` exposes nothing to bind: it is the relay flag
  plus a unix control socket. Starting it on the PC was not done; it would add
  a second relay-exposed daemon next to the Desktop's.

## What the relay requires (refutation)

`codex queue --thread CHATGPT_TOM_PC` on the workstation fails because that
thread is hosted by the Codex Desktop runtime on the PC and reached only through
OpenAI's remote-control relay. Participation needs a paired ChatGPT or Codex app
client (`pair` emits codes for that client); the CLI has no relay transport and
the Desktop's app-server listens on stdio only. The ChatGPT computer-use project
remains GUI-only. The direct bridge above is the CLI-reachable alternative.

## Neighbouring route: `chatgpt-session` (GUI tasks through ChatGPT Desktop)

The orchestrator reported, while this probe ran, that the ChatGPT remote
computer-use session for the PC is agent-drivable from the workstation. It is a
different transport from the bridge above and was qualified by another session
(2026-10-21); it is recorded here for routing, not re-proved.

- Where: `~/.local/bin/chatgpt-session` (a symlink to a standard-library Python
  CLI under `~/.local/share/chatgpt-session-bridge/`, with its own README,
  `qualification.json` and `qualified-sessions.json`). It speaks to the running
  ChatGPT Desktop app's bundled app-tools over the app's same-user Unix socket
  (`list_threads`, `read_thread`, `create_thread`, `send_message_to_thread`),
  so Desktop must be open on the workstation and the PC connected. No port,
  service or credential was added.
- Command: `chatgpt-session send CLAUDE_TOM_PC_BRIDGE --prompt '<task>' --wait 120`
  (or `--prompt-file <utf-8 file>`). `list --match TOM_PC`, `projects`,
  `read <title|uuid> [--host <hostId>] --turns N [--outputs]` and `create
  --project <id> --title … --prompt …` exist; `create` pins `gpt-6.1-sol`
  medium and does not enrol the new session for sending.
- What it targets: the Desktop-hosted remote-control thread named
  `CLAUDE_TOM_PC_BRIDGE` on the PC's `remote-control:env_…` host, which runs
  `danger-full-access` / approval `never` with native Computer Use. Only that
  one qualified session may be sent to; sends to `CHATGPT_TOM_PC` are refused
  locally. The tool fails closed after a Desktop restart, when the target is not
  idle, when another sender holds the lock, and when the remote agent reports
  the permission-regression marker; it never retries a submission.
- What it returns: JSON text. With `--wait` the completed turn's agent messages
  (matched by a per-request marker), status (`completed`, `pending`,
  `needs-attention`) and tool-call status; without `--wait` only the
  acknowledgement. Screenshots are taken and seen by the remote agent but their
  pixels are not downloaded; the reply carries the agent's textual
  description, and the Desktop sidebar shows the remote chat titles.
- Boundary: the prompt is wrapped in a guard that asks the remote agent to
  verify its own permissions first; the bridge does not attest the remote
  sandbox per action. It is a GUI delegation surface on the attorney's desktop
  and inherits the computer-use caveat above tenfold: prompts must carry their
  own limits.

Routing rule between the two: text-only prompts and replies to a Codex thread on
the PC (no GUI) use the loopback app-server bridge in this note; tasks that need
the screen use `chatgpt-session send CLAUDE_TOM_PC_BRIDGE`; shell work stays on
SSH and console-session launches on the one-shot interactive task.

## Follow-ups

- Hardened listener profile: start with `-c` overrides that disable MCP servers
  and plugins for inert bridge threads; verify with `thread/start` read-back.
- Same-platform name lookup (`codex queue --thread <name>` run on the PC) is
  untested; it would need the token on the PC.
- `codex queue` delivery to a busy thread is not measured: whether
  `thread/queue/add` holds the message as a follow-up until the running turn
  ends. Direct `turn/start` on a busy thread is measured (it steers into the
  running turn; see the `turn/start` entry under Gotchas). The 2026-10-09
  spike covers the managed case.

Sources: installed CLI help (`codex app-server --help`, `codex queue --help`,
`codex remote-control --help`, 0.160.1 and 0.163.0), the generated v2 protocol
schema (`codex app-server generate-json-schema`), and
[Codex app-server](https://developers.openai.com/codex/app-server).
