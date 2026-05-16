# P0 Current State

## Status

Completed on 2026-05-14.

## Implemented Surfaces

The initiative packet exists at `initiatives/stack-installer/`.

Created packet surfaces:

- `README.md`
- `SPEC.md`
- `PLAN.md`
- `ops/manifest.json`
- `ops/handoffs/`
- `history/outputs/`
- `research/`

No product code exists yet. P0 intentionally does not implement a Tauri app,
installer slice packages, verb registry, MCP executor, skill bundles, provider
adapters, or distribution pipeline.

## Verified Before Packet Creation

Packet creation was grounded in:

- repo root `AGENTS.md` and `CLAUDE.md`
- `initiatives/README.md` lifecycle and vocabulary
- `initiatives/ai-metrics-stack` packet shape
- `initiatives/canonical-slice-factory` slice creation posture
- live UI baseline at `packages/foundation/ui-system/ui` / `@beep/ui`
- architecture doctrine for sibling slice roots and package naming
- bootstrap handoff archived at
  `ops/handoffs/HANDOFF_P0_BOOTSTRAP.md`

## Original Locked Decisions

These decisions came from the grill session that produced the bootstrap
handoff. They are preserved here as the P0 decision seed.

1. **Sibling initiative.** Lives at `initiatives/stack-installer/`. Not a
   child of any existing initiative.
2. **AI Stack manager identity.** Installer is both a first-run flow and an
   ongoing AI Stack manager surface (dashboard, repair, channel-add,
   credential rotation). Not a workspace app.
3. **Persona.** Non-technical lawyer or financial advisor with minimal
   technical skill, fresh OS, existing professional subscriptions.
4. **Hybrid daily-driver surface.** Claude Desktop or Codex Desktop is the
   primary surface; one OpenClaw channel is secondary; future APR runtime app
   is a downstream consumer; terminal is plumbing the user never opens.
5. **AI Mode is an interactive AI workflow.** The agent prefers a pre-baked
   verb registry as a happy path but can converse with the user, troubleshoot,
   debug, and explore alternatives. Verb registry is the vocabulary the agent
   reaches for first, not a cage.
6. **AI Mode UX = approval-first + escape-to-chat.** Default per-step UI is
   structured approval modals with terse action streaming and reasoning hidden
   behind disclosure. A persistent "Ask Claude" affordance opens a scoped chat
   panel when prose is needed. Manual mode mirrors the same UI shape.
7. **Credential boundary (non-negotiable).** The AI never sees plaintext
   secrets. Account creation and credential origination are always
   human-driven. 1Password is the secret bus. Credential parameters in the
   verb registry are typed as 1Password references at the type level - no verb
   accepts a plaintext credential.
8. **Provider parity.** Identical user-facing AI Mode flow across Claude and
   Codex. Shared verb-registry + MCP-executor core. Two thin provider adapters
   (instruction bundle generator + native-event-to-UI translator). Provider
   choice is locked early in the installer flow.
9. **Layered validation.** Every verb declares a typed validation tier:
   `existence | version | config | liveness | user-confirmation`. Default to
   liveness wherever feasible. `Indeterminate` is a first-class result, not a
   failure. Validators are idempotent, re-runnable, persisted to a local event
   log, and agent-readable for AI Mode reasoning.
10. **Manifest + ephemeral state.** Durable `AIStackManifest` (schema-first
    Effect-TS, human-readable JSON, OS-conventional location, exportable)
    captures intent. Ephemeral local state holds progress, retries, event log.
    Resumability = manifest + live validation diff. First-run and steady-state
    share the same data flow.
11. **Platforms.** macOS + Windows parity for v1. Linux best-effort/unpromised.
    Verbs are OS-agnostic in contract, OS-dispatched in implementation.
    `PackageManager` capability abstracts brew/winget/apt; OS-specific build
    chains are dispatched directly. WSL2 is the default recommendation for
    non-technical Windows users with native Windows as fallback.
12. **Channels.** Discord only for v1. The channel-verb pattern is designed to
    be n-channel; only Discord ships in v1. iMessage, Microsoft Teams, Slack,
    Signal, Telegram, WhatsApp, Google Chat: post-v1, verb-registry contracts
    open for contribution.
13. **Provider account auth.** Subscription (native `claude login` /
    `codex login`) is the default for the persona. API-key with 1Password
    injection is the power-user path. Credential mode is recorded in the
    manifest; AI Mode authentication inherits the credential mode. Provider
    validator is the gate that unlocks AI Mode itself.
14. **AI Mode consent.** Durable manifest-stored preference, not
    install-scoped. Handoff is a first-class step with one-screen consent in
    plain language. Reversible globally (settings) and per-step (escape
    buttons). Re-consent required when capability set materially expands.
    Consent text and skill system prompt regenerate from a single
    source-of-truth in the verb registry.
15. **Verb registry topology.** Slice-per-category package family inside the
    existing `beep-effect` monorepo, following `standards/ARCHITECTURE.md`.
    Slice families to scaffold (only as roles emerge):
    - `installer/dependencies` - OS deps, build chains, package managers, CLIs
    - `installer/providers` - AI provider auth, credential modes, validation
    - `installer/channels` - chat channels (Discord v1; pattern-ready)
    - `installer/security` - 1Password, SSH agent, commit signing, secret bus
    - `installer/runtime` - Claude/Codex Desktop config, MCP wiring, skills
    - `installer/workspace` - first-session experience, end-to-end gate
    Single MCP-executor server exposes verbs as MCP tools. Skill bundles
    (Claude `SKILL.md` and Codex `AGENTS.md`) regenerate from the registry via
    a `tooling/tool` package. Tauri app composes verb-registry slices and lives
    at `apps/stack-installer/` (or similar - follow existing app conventions).
    `beep architecture` (from canonical-slice-factory) is the contributor entry
    point for new verbs.
16. **Five anchoring proofs + distribution-readiness phase.** Each phase exits
    on a falsifiable evidence checkpoint. Recorded screencasts are required
    evidence where the user is the proof:
    - **P0 - Initiative Bootstrap.** Packet created, decisions captured, slice
      topology named, manifest schema sketched. Status on creation: completed.
    - **P1 - Discord Vertical, Manual Mode.** Fresh-OS run-through on macOS
      and Windows. Operator completes provider auth + 1Password + Discord setup
      + end-to-end test message. No AI Mode yet. Evidence: screencasts from
      both OSes, sanitized manifest, CI green for vertical's verbs.
    - **P2 - AI Mode Parity.** Same flow with AI Mode enabled. Skill + MCP +
      provider adapters wired. Evidence: screencasts in AI Mode on both
      providers (Claude + Codex), agent's structured action log, and a
      **byte-identical-manifest gate** (modulo timestamps) between P1 and P2
      runs proving the two modes share a single source of truth.
    - **P3 - Recovery.** Salted-broken-state machine: (a) wrong Node version
      pre-installed, (b) Discord bot exists but token is invalid, (c)
      1Password reference missing. AI Mode invoked, divergence closed.
      Evidence: screencast per scenario, before/after validator output.
    - **P4 - Portability.** Manifest export on Machine A, import on Machine B
      (different OS - macOS export, Windows-WSL import). Full validator suite
      green on B without re-running setup. Evidence: paired manifests, paired
      validator logs.
    - **P5 - Distribution Readiness.** Signed macOS notarized binary, Windows
      code-signed binary, auto-update mechanism wired, telemetry opt-in
      respected, crash reporting + feedback channel functional, CI builds for
      both targets. V1 completion gate.
17. **Packet ceremony.** Full ai-metrics-stack shape: `README.md`, `SPEC.md`,
    `PLAN.md`, `ops/manifest.json`, `ops/handoffs/*.md`,
    `history/outputs/*`, `research/*`. Status-tracked phases,
    machine-readable manifest with `commandGates`, completion criteria
    explicit, owning surfaces enumerated.
18. **Pre-filled P0.** On packet creation, P0 is `completed`.
    `history/outputs/p0-current-state.md` summarizes the grill and locks the
    decisions.

## P0 Doc-Grill Amendments

- Decision #15 is corrected to doctrine-native sibling slice slugs:
  `installer-dependencies`, `installer-providers`, `installer-channels`,
  `installer-security`, `installer-runtime`, and `installer-workspace`.
  Package paths follow `packages/installer-<category>/<role>`, with names such
  as `@beep/installer-dependencies-domain`.
- Decision #19 is added: `@beep/stack-installer` uses `@beep/ui` as its UI
  baseline. The app imports `@beep/ui/styles/globals.css`, wraps UI with
  `AppThemeProvider`, and uses the shared base-nova/Base UI/shadcn/Tailwind
  v4/Phosphor/MUI-Pigment compatible baseline instead of duplicating shadcn
  locally.
- The MCP executor is recorded as app-local runtime adapter code under
  `apps/stack-installer`; it is not a tooling package and not a generic God
  Layer.
- The verb registry is recorded as slice-owned contracts and server
  implementations. App and tooling surfaces compose generated registry
  artifacts but do not own installer category semantics.
- `initiatives/README.md` must list `stack-installer` as an active initiative.

## Comprehensive Dependency Inventory

Each entry will eventually decompose into one or more verbs. V1 ships only the
subset needed for the Discord vertical, but the full surface area is captured
here for traceability.

**Tier 0 - Native build toolchain (silent killers for non-technical users)**
- macOS: Xcode Command Line Tools (`xcode-select --install`)
- Windows: Visual Studio Build Tools (C++ workload)
- Windows: WSL2 + Ubuntu (default recommendation for non-technical users)
- Linux: `build-essential`, `pkg-config`, `libssl-dev`, Tauri webkit/gtk libs
- macOS: Homebrew
- Windows: winget (preinstalled on modern Win10/11) or Scoop

**Tier 1 - Things Claude Code itself benefits from materially**
- ripgrep (`rg`)
- GitHub CLI (`gh`)
- Modern terminal emulator (Ghostty / Warp / Windows Terminal)
- Modern shell (Zsh on macOS/Linux, PowerShell 7 on Windows)
- Starship prompt (optional)

**Tier 2 - Polyglot version management**
- mise (recommended); fnm / volta / asdf as alternatives

**Tier 3 - Python + uv**
- Python 3.12+
- uv (Astral)
- pipx (fallback)

**Tier 4 - Rust toolchain**
- rustup + stable Rust (required for Tauri; also powers many CLIs)

**Tier 5 - Editor / IDE**
- VS Code (default for non-technical users) + Claude Code extension
- Cursor (AI-forward alternative)
- JetBrains Toolbox + Claude Code plugin (advanced users)

**Tier 6 - Container runtime**
- macOS: OrbStack (preferred) or Docker Desktop
- Linux: Docker Engine + rootless mode
- Windows: Docker Desktop (WSL2 backend) or Podman Desktop
- Podman as license-free alternative

**Tier 7 - CLI quality-of-life (used by agents)**
- jq, yq, fd, fzf, bat, eza, delta, zoxide, httpie/xh, tldr

**Tier 8 - 1Password integration depth**
- 1Password desktop
- 1Password CLI (`op`)
- 1Password SSH agent (replaces ssh-agent, biometric-gated)
- 1Password git commit signing (SSH-based)
- `op run` / `op inject` patterns for `.env` substitution
- 1Password shell plugins
- 1Password browser extension auto-install + linking

**Tier 9 - Identity / Git hygiene (validation gates, not optional steps)**
- `git config --global user.name` / `user.email`
- SSH key generated or 1Password SSH agent configured
- GitHub SSH key uploaded (`gh ssh-key add`)
- GPG or SSH commit signing configured + verified by test signed commit
- Sensible defaults: `init.defaultBranch=main`, `pull.rebase=true`,
  `fetch.prune=true`, `rerere.enabled=true`

**Tier 10 - MCP server prerequisites**
- `npx` (comes with npm) and `uvx` (comes with uv)
- Playwright browsers (`npx playwright install`)
- Chrome (for Claude Chrome extension)
- mcp-inspector (debugging tool)

**Tier 11 - Channel-side (Discord only in v1; others as post-v1 verbs)**
- Discord developer portal account + bot app + token (v1)
- iMessage: macOS Full Disk Access (post-v1)
- Signal: `signal-cli` + JRE/JDK 21+ (post-v1)
- WhatsApp: Meta Business + WhatsApp Business API (post-v1)
- Microsoft Teams: Azure tenant + app registration (post-v1)
- Google Chat: Google Cloud project + Workspace admin (post-v1)
- Slack: workspace admin + app + OAuth (post-v1)
- Telegram: BotFather token (post-v1)

**Tier 12 - Environment & secrets ergonomics**
- direnv or mise's built-in env support
- dotenv-cli for one-off invocations

**Tier 13 - Networking / infrastructure (optional)**
- Tailscale (homelab / remote dev)
- cloudflared or ngrok (exposing local MCP servers / webhooks)

**Foundation development dependencies (baseline)**
- git, Node 24 (via mise/nvm), pnpm, npm, bun, docker

## Known Gaps

- No Tauri app exists.
- No installer slice package exists.
- No verb registry exists.
- No MCP executor adapter exists.
- No skill or instruction bundle generator exists.
- No Claude provider adapter exists.
- No Codex provider adapter exists.
- No manifest schema exists.
- No local validation event log exists.
- No Discord vertical implementation exists.
- No distribution or signing pipeline exists.

## Next Phase

P1 should implement the Discord vertical in Manual Mode only. It must prove
fresh-OS macOS and Windows setup before AI Mode work begins.
