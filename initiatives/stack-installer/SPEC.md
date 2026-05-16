# Stack Installer Specification

## Status

**ACTIVE**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-14
- **Updated:** 2026-05-14

## Purpose

A non-technical lawyer or financial advisor should be able to install,
validate, repair, and maintain a practical AI Stack without becoming the
operator of a developer workstation. The installer configures Claude or Codex
inside a secure harness, wires basic professional tooling and one Discord
channel, and keeps enough validation state to explain what is installed, what
is broken, and what needs human approval.

## Scope

In scope:

- `apps/stack-installer` as the Tauri 2 + React app package
  `@beep/stack-installer`
- macOS and Windows v1 parity, with Linux best-effort
- Discord as the only v1 channel
- Claude and Codex provider parity for AI Mode
- Manual Mode and AI Mode over one shared manifest and validation spine
- 1Password references as the credential parameter type accepted by verbs
- schema-first manifest, validation events, and installer contracts
- installer slice package families under `packages/installer-<category>/<role>`
- app-local MCP executor runtime adapter code under `apps/stack-installer`

Out of scope for v1:

- WhatsApp Business verification and other non-Discord channels
- a full agentic professional runtime workspace UI
- autonomous agent execution without approval
- plaintext credential handling
- Tauri app implementation during P0
- verb registry package implementation during P0
- MCP server or skill bundle implementation during P0
- direct use of database drivers such as `@beep/postgres` or `@beep/drizzle`
  unless a later phase proves durable local storage needs them

## Non-Negotiable Contract

- The installer is an AI Stack manager, not a workspace app.
- The app shell lives at `apps/stack-installer` and publishes
  `@beep/stack-installer`.
- The app shell uses Tauri 2 + React, imports
  `@beep/ui/styles/globals.css`, and wraps UI in `AppThemeProvider`.
- The UI baseline is `packages/foundation/ui-system/ui` / `@beep/ui`:
  base-nova, Base UI, shadcn, Tailwind v4, Phosphor icons, and MUI/Pigment
  compatibility.
- Generic UI primitives belong in `@beep/ui`; stack-installer workflows,
  screens, and product-specific client state stay app-local or in future
  installer slice UI/client packages.
- Credential values are never plaintext parameters. Verbs accept typed
  1Password references only.
- AI Mode is interactive but approval-first. The agent may troubleshoot and
  converse, but registry verbs are the happy-path vocabulary.

## Architectural Boundaries

`apps/stack-installer` owns app shell composition, Tauri runtime integration,
provider selection, approval modals, action streaming, scoped chat, local
runtime adapters, and the MCP executor adapter. The MCP executor is app-local
runtime composition, not a repo-wide tooling package and not a God Layer.

Installer capabilities use sibling slices with doctrine-native slugs. P1A
implemented dependencies, security, providers, channels, and workspace as
dry-run role packages. P1 live harness work adds driver-backed validation
contracts to those slices; runtime remains deferred.

| Category | Slice slug | Example domain package |
| --- | --- | --- |
| Dependencies | `installer-dependencies` | `packages/installer-dependencies/domain` / `@beep/installer-dependencies-domain` |
| Providers | `installer-providers` | `packages/installer-providers/domain` / `@beep/installer-providers-domain` |
| Channels | `installer-channels` | `packages/installer-channels/domain` / `@beep/installer-channels-domain` |
| Security | `installer-security` | `packages/installer-security/domain` / `@beep/installer-security-domain` |
| Runtime | `installer-runtime` | `packages/installer-runtime/domain` / `@beep/installer-runtime-domain` |
| Workspace | `installer-workspace` | `packages/installer-workspace/domain` / `@beep/installer-workspace-domain` |

Each slice owns its domain language, verb/tool contracts, validators, typed
errors, and server implementations as role packages emerge. App and tooling
surfaces compose generated registry artifacts; they do not own installer
category semantics.

`initiatives/canonical-slice-factory` is the creation path for new installer
slices, concepts, and role packages. Use `bun run beep architecture` with the
canonical `--domain-kind` archetypes: `aggregates`, `entities`, and `values`.

`@beep/ui` owns shared UI primitives, themes, tokens, and generic composition
helpers. App-specific installer flows are not promoted to `@beep/ui` unless
they become product-agnostic primitives.

`@beep/postgres` and `@beep/drizzle` remain driver boundaries. The v1 installer
does not require them by default; local manifest/state storage should start
with a schema-first local file and event-log shape unless a later phase proves
a database boundary is necessary.

P1 live external boundaries are driver packages under `packages/drivers/*`:
`@beep/onepassword-cli`, `@beep/ai-provider-cli`, and `@beep/discord`.
Installer slice server packages consume those drivers; app/tooling code does
not inline external CLI or HTTP behavior.

`@beep/repo-cli` and `packages/tooling/tool/cli` may host repo automation,
scaffold generation, or validation helpers. They do not own the runtime MCP
executor and do not own slice verbs.

## Canonical Decisions

1. Sibling initiative. `stack-installer` lives at
   `initiatives/stack-installer/` and is not a child of another packet.
2. AI Stack manager identity. The product is both first-run flow and ongoing
   dashboard for repair, channel-add, and credential rotation.
3. Persona. The default user is a non-technical lawyer or financial advisor
   with minimal technical skill, a fresh OS, and professional subscriptions.
4. Hybrid daily-driver surface. Claude Desktop or Codex Desktop is primary,
   one OpenClaw channel is secondary, the future APR runtime app is downstream,
   and terminal usage is hidden.
5. AI Mode is an interactive AI workflow. The agent prefers registry verbs but
   can converse, troubleshoot, debug, and explore alternatives.
6. AI Mode UX is approval-first with escape-to-chat. Structured approvals are
   default; reasoning hides behind disclosure; scoped chat is always available.
7. Credential boundary. The AI never sees plaintext secrets. Account creation
   is human-driven. 1Password is the secret bus. Verb credentials are typed
   1Password references.
8. Provider parity. Claude and Codex share the same user-facing AI Mode flow,
   registry contracts, validation results, and manifest updates.
9. Layered validation. Verbs declare one of `existence`, `version`, `config`,
   `liveness`, or `user-confirmation`; liveness is the default where feasible.
10. Manifest plus ephemeral state. `AIStackManifest` captures intent in
    human-readable JSON; resumability is manifest plus live validation diff.
11. Platforms. macOS and Windows are parity targets. Linux is best-effort.
    WSL2 is the default Windows recommendation, with native Windows fallback.
12. Channels. Discord is the only v1 channel; the channel-verb pattern remains
    n-channel.
13. Provider account auth. Subscription/native login is default. API key with
    1Password injection is the power-user path. Provider validation unlocks
    AI Mode.
14. AI Mode consent. Consent is a durable manifest-stored preference,
    reversible globally and per step, and regenerated from registry source.
15. Verb registry topology. Slice slugs are `installer-dependencies`,
    `installer-providers`, `installer-channels`, `installer-security`,
    `installer-runtime`, and `installer-workspace`; package names follow
    `@beep/installer-<category>-<role>`.
16. Anchoring proofs. P0 through P5 exit only on falsifiable evidence,
    including recorded screencasts where the user workflow is the proof.
17. Packet ceremony. This packet uses the full initiative shape: `README.md`,
    `SPEC.md`, `PLAN.md`, `ops/manifest.json`, handoffs, history outputs, and
    research stubs.
18. Pre-filled P0. P0 is completed on packet creation and recorded in
    `history/outputs/p0-current-state.md`.
19. UI baseline. `@beep/stack-installer` uses `@beep/ui` as its UI baseline
    and must not create an app-local duplicate shadcn baseline.

## Privacy & Credential Contract

No verb accepts a plaintext credential parameter. Credential inputs are typed
as 1Password references, and validators must report missing or invalid
references without printing resolved secret values.

Account creation and credential origination are human-driven. Native provider
credential stores created by `claude login` or `codex login` are tolerated for
subscription mode, but that tolerance does not extend to Discord tokens,
webhook secrets, API keys, SSH keys, or other installation secrets.

The app may help the user open provider or channel auth flows, explain what is
needed, and validate the result. It must not ask an AI provider to collect,
store, transform, or display plaintext secrets.

## Validation Contract

Every verb declares a typed validation tier:

- `existence`
- `version`
- `config`
- `liveness`
- `user-confirmation`

Validators are idempotent, re-runnable, persisted to a local event log, and
agent-readable for AI Mode reasoning. `Indeterminate` is a first-class result,
not a failure. Verbs should default to `liveness` wherever a real liveness
probe is feasible.

## Manifest Contract

`AIStackManifest` is schema-first Effect TypeScript, persisted as
human-readable JSON in an OS-conventional location and exportable by the user.
It records intent: selected provider, credential mode, AI Mode consent,
platform facts, installed capabilities, configured channels, validation
expectations, and active repair state.

Ephemeral local state stores progress, retries, and validation events. First
run and steady state share the same data flow. Resumption compares manifest
intent with live validation reality and presents a diff instead of replaying
the whole installer.

## Platform Matrix

| Platform | V1 posture | Runtime posture | Distribution gate |
| --- | --- | --- | --- |
| macOS | parity target | native Tauri app, Homebrew, Xcode CLT where needed | signed and notarized binary |
| Windows | parity target | Tauri app, WSL2 default recommendation, native fallback | code-signed binary |
| Linux | best-effort | package-manager dispatched implementation | no v1 promise |

Verbs are OS-agnostic in contract and OS-dispatched in implementation.
`PackageManager` abstracts brew, winget, apt, and equivalents only where the
capability is genuinely package-manager shaped. OS-specific build chains are
dispatched directly.

## AI Mode Contract

AI Mode is interactive and approval-first. The agent reaches for registry
verbs as the happy path, streams terse action state, hides reasoning behind
disclosure, and opens a scoped "Ask Claude" style chat panel when prose is
needed.

Claude and Codex must present identical user-facing flow. Provider adapters are
thin: instruction bundle generation and native event-to-UI translation. The
provider choice is locked early in the installer flow.

Consent is durable in the manifest, reversible globally and per step, and
requires re-consent when the capability set materially expands. Consent copy
and skill system prompts regenerate from one registry source.

## Channel Contract

Discord is the only v1 channel. The registry and validation shape must be
ready for additional channel contributors, but iMessage, Microsoft Teams,
Slack, Signal, Telegram, WhatsApp, and Google Chat are post-v1.

## Completion Criteria

P0 is complete when this packet exists, the decisions are captured, the
corrected slice topology is named, and the manifest targets P1.

P1 is complete when fresh-OS macOS and Windows Manual Mode runs complete
provider auth, 1Password setup, Discord setup, and an end-to-end test message,
with screencasts, sanitized manifest, CI green for the vertical verbs, and a
post-proof PR readiness review/fix loop with zero required blockers or explicit
waivers. Local harness implementation alone is not sufficient to close P1.

P1C, the post-proof review/fix loop, may begin after audited macOS proof plus
either audited Windows proof or an explicit temporary Windows missing-proof
waiver. That waiver is sequencing-only. It does not count as Windows success
and does not close P1.

P1D is complete when the Tauri app becomes the primary operator surface for a
Linux-first proof run and completes one real machine-changing dependency
install or repair action through installer-owned code, with proof artifacts and
validation showing the before and after state.

P2 is complete when the same flow runs in AI Mode for Claude and Codex, with
screencasts, structured action logs, and a byte-identical-manifest gate modulo
timestamps between P1D and P2.

P3 is complete when AI Mode repairs salted broken states for wrong Node
version, invalid Discord token, and missing 1Password reference, with
screencasts and before/after validator output.

P4 is complete when a manifest exported on Machine A imports on Machine B
across OS boundaries and the full validator suite is green on B without
re-running setup, with paired manifests and validator logs.

P5 is complete when macOS and Windows binaries are signed, macOS is notarized,
auto-update is wired, telemetry is opt-in, crash reporting and feedback work,
and CI builds both targets.

## Source-Of-Truth Order

1. [SPEC.md](./SPEC.md)
2. [standards/ARCHITECTURE.md](../../standards/ARCHITECTURE.md) and
   architecture subdocs
3. [ops/manifest.json](./ops/manifest.json)
4. [PLAN.md](./PLAN.md)
5. [ops/handoffs](./ops/handoffs)
6. [research](./research)
7. `initiatives/ai-metrics-stack` only as packet-shape reference
