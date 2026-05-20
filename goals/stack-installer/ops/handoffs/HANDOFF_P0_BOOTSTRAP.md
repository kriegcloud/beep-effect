# Stack Installer P0 Bootstrap Handoff

## Copy-Paste Prompt For A Fresh Codex / Claude Code Session

You are starting a fresh session in `/home/elpresidank/YeeBois/projects/beep-effect`.

Your mission is **not** implementation. Your mission is to create the initiative
packet for `stack-installer` — a new sibling initiative under `goals/` —
that captures the locked design decisions below in the same full ceremony used
by `goals/ai-metrics-stack`. Pre-fill P0 as completed; leave later phases
as scaffolds with placeholder outputs.

Do not implement Tauri code, verb registries, skill bundles, or any product
code in this session. This session produces the packet only.

## Required Startup

1. Read `AGENTS.md` and `CLAUDE.md` if present at the repo root.
2. Read `goals/README.md` for vocabulary and lifecycle rules.
3. Read `goals/ai-metrics-stack/` end-to-end as the shape reference:
   - `README.md`, `SPEC.md`, `PLAN.md`
   - `ops/manifest.json`
   - `ops/handoffs/HANDOFF_P0-P6.md` and `HANDOFF_FRESH_REVIEW.md`
   - representative outputs under `history/outputs/`
   - representative research under `research/`
4. Skim `goals/agentic-professional-runtime/` for cross-reference framing
   only. The stack installer is a sibling, not a child; do not couple to APR.
5. Read architecture doctrine needed to anchor slice-topology language:
   - `standards/ARCHITECTURE.md`
   - `standards/architecture/GLOSSARY.md`
   - `standards/architecture/DECISIONS.md`
   - `standards/architecture/01-hexagonal-vertical-slices.md`
   - `standards/architecture/07-non-slice-families.md`
   - `standards/architecture/13-onboarding-the-minimum-viable-slice.md`
6. Read `goals/canonical-slice-factory/SPEC.md` and `README.md` because
   this initiative is its first non-architecture-lab consumer.

## Product Thesis (Locked)

A non-technical lawyer or financial advisor wants to use the latest AI tooling
in a secure and reliable way tailored to their OS, existing platforms, and
subscriptions. This installer helps them set up and glue everything together
so that by the end they have Claude or Codex configured in a harness with
basic tooling and security measures, positively impacting their productivity
with "the AI Stack." The installer doubles as an ongoing AI Stack manager for
repair, channel-add, and credential rotation.

## Locked Decisions (Decision Log Seed)

These came out of a grill session. Capture them verbatim in
`history/outputs/p0-current-state.md` and reflect them in `SPEC.md`'s
"Non-Negotiable Contract" and `DECISIONS.md`-style section.

1. **Sibling initiative.** Lives at `goals/stack-installer/`. Not a
   child of any existing initiative.
2. **AI Stack manager identity.** Installer is both a first-run flow and an
   ongoing AI Stack manager surface (dashboard, repair, channel-add, credential
   rotation). Not a workspace app.
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
   secrets. Account creation and credential origination are always human-driven.
   1Password is the secret bus. Credential parameters in the verb registry are
   typed as 1Password references at the type level — no verb accepts a
   plaintext credential.
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
14. **AI Mode consent.** Durable manifest-stored preference, not install-scoped.
    Handoff is a first-class step with one-screen consent in plain language.
    Reversible globally (settings) and per-step (escape buttons). Re-consent
    required when capability set materially expands. Consent text and skill
    system prompt regenerate from a single source-of-truth in the verb registry.
15. **Verb registry topology.** Slice-per-category package family inside the
    existing `beep-effect` monorepo, following `standards/ARCHITECTURE.md`.
    Slice families to scaffold (only as roles emerge):
    - `installer/dependencies` — OS deps, build chains, package managers, CLIs
    - `installer/providers` — AI provider auth, credential modes, validation
    - `installer/channels` — chat channels (Discord v1; pattern-ready)
    - `installer/security` — 1Password, SSH agent, commit signing, secret bus
    - `installer/runtime` — Claude/Codex Desktop config, MCP wiring, skills
    - `installer/workspace` — first-session experience, end-to-end gate
    Single MCP-executor server exposes verbs as MCP tools. Skill bundles
    (Claude `SKILL.md` and Codex `AGENTS.md`) regenerate from the registry via
    a `tooling/tool` package. Tauri app composes verb-registry slices and lives
    at `apps/stack-installer/` (or similar — follow existing app conventions).
    `beep architecture` (from canonical-slice-factory) is the contributor entry
    point for new verbs.
16. **Five anchoring proofs + distribution-readiness phase.** Each phase exits
    on a falsifiable evidence checkpoint. Recorded screencasts are required
    evidence where the user is the proof:
    - **P0 — Initiative Bootstrap.** Packet created, decisions captured, slice
      topology named, manifest schema sketched. Status on creation: completed.
    - **P1 — Discord Vertical, Manual Mode.** Fresh-OS run-through on macOS
      and Windows. Operator completes provider auth + 1Password + Discord
      setup + end-to-end test message. No AI Mode yet. Evidence: screencasts
      from both OSes, sanitized manifest, CI green for vertical's verbs.
    - **P2 — AI Mode Parity.** Same flow with AI Mode enabled. Skill + MCP +
      provider adapters wired. Evidence: screencasts in AI Mode on both
      providers (Claude + Codex), agent's structured action log, and a
      **byte-identical-manifest gate** (modulo timestamps) between P1 and P2
      runs proving the two modes share a single source of truth.
    - **P3 — Recovery.** Salted-broken-state machine: (a) wrong Node version
      pre-installed, (b) Discord bot exists but token is invalid, (c)
      1Password reference missing. AI Mode invoked, divergence closed.
      Evidence: screencast per scenario, before/after validator output.
    - **P4 — Portability.** Manifest export on Machine A, import on Machine B
      (different OS — macOS export, Windows-WSL import). Full validator suite
      green on B without re-running setup. Evidence: paired manifests, paired
      validator logs.
    - **P5 — Distribution Readiness.** Signed macOS notarized binary, Windows
      code-signed binary, auto-update mechanism wired, telemetry opt-in
      respected, crash reporting + feedback channel functional, CI builds for
      both targets. V1 completion gate.
17. **Packet ceremony.** Full ai-metrics-stack shape: `README.md`, `SPEC.md`,
    `PLAN.md`, `ops/manifest.json`, `ops/handoffs/*.md`, `history/outputs/*`,
    `research/*`. Status-tracked phases, machine-readable manifest with
    `commandGates`, completion criteria explicit, owning surfaces enumerated.
18. **Pre-filled P0.** On packet creation, P0 is `completed`. `history/outputs/
    p0-current-state.md` summarizes the grill and locks the decisions.

## Required Artifact Tree

Create exactly this tree under `goals/stack-installer/`:

```
goals/stack-installer/
├── README.md
├── SPEC.md
├── PLAN.md
├── ops/
│   ├── manifest.json
│   └── handoffs/
│       ├── README.md
│       ├── HANDOFF_P0_BOOTSTRAP.md          (this prompt, archived)
│       ├── HANDOFF_P1_DISCORD_MANUAL.md     (stub)
│       ├── HANDOFF_P2_AI_MODE.md            (stub)
│       ├── HANDOFF_P3_RECOVERY.md           (stub)
│       ├── HANDOFF_P4_PORTABILITY.md        (stub)
│       ├── HANDOFF_FRESH_REVIEW.md          (stub modeled on ai-metrics-stack)
│       └── HANDOFF_V1_RELEASE.md            (stub)
├── history/
│   └── outputs/
│       ├── p0-current-state.md              (filled — grill summary)
│       ├── p1-discord-vertical-manual.md    (placeholder)
│       ├── p2-ai-mode-parity.md             (placeholder)
│       ├── p3-recovery.md                   (placeholder)
│       ├── p4-portability.md                (placeholder)
│       └── p5-distribution-readiness.md     (placeholder)
└── research/
    ├── README.md                            (index)
    ├── tauri-2-architecture.md              (stub)
    ├── claude-code-codex-capability-matrix.md  (stub)
    ├── discord-oauth-and-bot-setup.md       (stub)
    ├── 1password-cli-integration.md         (stub)
    ├── os-bootstrapping-and-signing.md      (stub — macOS notarization,
    │                                          Windows code-signing, WSL2
    │                                          install, Full Disk Access)
    └── verb-registry-schema-sketch.md       (stub)
```

## File-By-File Content Requirements

### `README.md`

Mirror `goals/ai-metrics-stack/README.md` shape. Required sections:
- **Status:** Active
- **Overview:** 2–3 paragraphs framing the persona, the AI Stack manager
  identity, and the v1 scope (Discord-only, macOS + Windows).
- **Read This First:** linked list of SPEC, PLAN, manifest, ops/handoffs, key
  history outputs, key research docs.
- **Current Progress:** P0 completed; P1–P5 pending. Mirror the per-phase
  bullet list shape.
- **Completion Standard:** enumerate the five anchoring proofs + signing/
  distribution gate as explicit checkboxes.

### `SPEC.md`

Mirror `goals/ai-metrics-stack/SPEC.md` shape. Required sections:
- **Status, Owner, Created/Updated**
- **Purpose** — the lawyer/advisor problem in plain terms.
- **Scope** — in scope and out of scope (e.g., out: WhatsApp Business
  verification, full APR workspace UI, autonomous agent execution without
  approval, plaintext credential handling).
- **Architectural Boundaries** — name the slice families (Decision #15),
  the canonical-slice-factory dependency, the Tauri app boundary, the
  MCP-executor server boundary, the relationship to existing drivers
  (`@beep/postgres`, `@beep/drizzle` — likely not used in v1) and tooling.
- **Canonical Decisions** — bullet list of the 18 locked decisions above,
  phrased as durable doctrine, not as grill answers.
- **Privacy & Credential Contract** — codify Decision #7 explicitly: no
  verb accepts a plaintext credential parameter; all credentials are
  1Password references; account creation is human-driven; native provider
  credential stores (Claude/Codex login) are tolerated for subscription
  mode but not extended to other secrets.
- **Validation Contract** — Decision #9: five tiers, liveness default,
  indeterminate first-class, agent-readable, event-log-persisted.
- **Manifest Contract** — Decision #10: schema-first, OS-conventional path,
  human-readable JSON, exportable, intent-vs-reality diff drives resumption.
- **Platform Matrix** — Decision #11: macOS + Windows parity, Linux
  best-effort, WSL2 default on Windows. Tauri build targets and signing
  requirements per OS.
- **AI Mode Contract** — Decisions #5, #6, #8, #14: interactive agent,
  approval-first UX, provider parity, durable consent preference.
- **Channel Contract** — Decision #12: Discord-only v1, channel-verb pattern
  designed for n channels.
- **Completion Criteria** — the five anchoring proofs + distribution-
  readiness, each with explicit evidence requirements (screencasts, paired
  manifests, signed binaries, CI green).
- **Source-Of-Truth Order** — SPEC → ARCHITECTURE → manifest → PLAN →
  handoffs → research → ai-metrics-stack reference patterns.

### `PLAN.md`

Mirror `goals/ai-metrics-stack/PLAN.md`. One section per phase
(P0–P5), each with:
- Status (`completed` for P0, `pending` for P1–P5)
- Goal (one paragraph)
- Exit Criteria (checkboxes pointing to anchoring-proof evidence)
- Required Outputs (file paths under `history/outputs/`)
- Required Checks (CI/test/validator commands)
- Stop Conditions (what blocks the phase from being credited)

Include a "Required Checks" closing section listing repo-wide gates
(`bun run check`, `bun run lint`, `bun run test`, `bun run docgen`,
`bun run config-sync`) plus initiative-specific ones once slice packages
exist.

### `ops/manifest.json`

Mirror `goals/ai-metrics-stack/ops/manifest.json`. Required keys:
- `schemaVersion`, `initiative`, `currentSourceOfTruth`,
  `currentTargetPhase: "P1"`, `completionEvidence`
- `targets`: `{ primary: ["macos", "windows"], bestEffort: ["linux"] }`
- `defaults`:
  - `providerAuthMode: "subscription"`
  - `credentialBus: "1password"`
  - `aiModeDefault: "preference-not-install-scoped"`
  - `channelV1: "discord-only"`
  - `windowsRuntime: "wsl2-default-native-fallback"`
- `v1Completion`: `{ status: "in_progress", activeGate: "P1",
  closedGates: ["P0 packet bootstrap"], remainingGates: [...all five proofs +
  signing gate...], nonBlockingFollowUps: ["iMessage channel", "Teams
  channel", "Slack/Signal/Telegram/WhatsApp/Google Chat channels", "APR
  runtime app handoff", "additional MCP server integrations"] }`
- `owningSurfaces`: map slice families to anticipated package paths
  (`packages/installer/dependencies/*`, etc.) and the Tauri app path.
- `phases`: array P0..P5 with `id`, `name`, `status`, `output` (path under
  `history/outputs/`), and exit-criteria summary. P0 is `completed`.
- `proofMatrix`: array mapping each anchoring proof to its phase, evidence
  artifact paths, and current status.
- `commandGates`: stub commands for the verifications expected per phase
  (slice package checks, fresh-OS smoke wrappers, signing/notarization
  verification, manifest-parity gate). Use placeholders where the package
  paths don't exist yet.
- `knownGaps`: explicit not-yet-built surfaces (verb registry, Tauri app,
  MCP-executor server, skill bundle generator, provider adapters).
- `nextAction`: kick off P1 (Discord vertical, Manual Mode).

### `history/outputs/p0-current-state.md`

The most important pre-filled artifact. Mirror
`goals/ai-metrics-stack/history/outputs/p0-current-state.md` shape.
Required sections:
- **Status:** Completed on the creation date.
- **Implemented Surfaces:** the initiative packet itself; no code surfaces yet.
- **Verified Before Packet Creation:** the grill session that produced the
  18 locked decisions (link to handoff prompt, reference architecture docs
  read).
- **Locked Decisions:** all 18 decisions verbatim from this prompt.
- **Comprehensive Dependency Inventory:** include the full Tier 0 through
  Tier 13 dependency list captured below in this prompt under "Dependency
  Inventory To Capture." This list will eventually be decomposed into verbs;
  for P0 it's recorded as the design surface area.
- **Known Gaps:** no verb registry yet, no Tauri app yet, no skill bundles
  yet, no provider adapters yet, no MCP-executor server yet, distribution/
  signing pipeline not built.
- **Next Phase:** P1 — Discord vertical, Manual Mode.

### `history/outputs/p{1..5}-*.md`

Each is a brief placeholder (≤30 lines) stating "Status: pending. This file
will record evidence from phase P{N} once that phase is executed. See PLAN.md
for exit criteria."

### `ops/handoffs/README.md`

Mirror `goals/ai-metrics-stack/ops/handoffs/README.md`. List each
handoff with one-line purpose.

### `ops/handoffs/HANDOFF_P0_BOOTSTRAP.md`

Archive a copy of this current prompt verbatim so the bootstrap context is
preserved with the packet.

### Other `ops/handoffs/HANDOFF_P{1..5}_*.md` and `HANDOFF_FRESH_REVIEW.md` and `HANDOFF_V1_RELEASE.md`

Stub files (≤40 lines each) with:
- Mission paragraph
- Required Startup (reads — SPEC, PLAN, manifest, prior phase outputs)
- Stop conditions
- "Full prompt to be authored when P{prev} closes." marker

### `research/README.md`

Index of research docs with one-line purpose each. Mirror ai-metrics-stack
research index style.

### `research/*.md` stubs

Each ≤20 lines with:
- A title
- A one-paragraph statement of what the doc will eventually answer
- A "Status: stub" marker
- Optional: links to authoritative external references already known
  (e.g., Tauri 2 docs, Anthropic skills docs, Discord developer portal,
  1Password CLI docs)

## Dependency Inventory To Capture

Include this verbatim in `history/outputs/p0-current-state.md` under
"Comprehensive Dependency Inventory." Each entry will eventually decompose
into one or more verbs. v1 ships only the subset needed for the Discord
vertical, but the full surface area is captured here for traceability.

**Tier 0 — Native build toolchain (silent killers for non-technical users)**
- macOS: Xcode Command Line Tools (`xcode-select --install`)
- Windows: Visual Studio Build Tools (C++ workload)
- Windows: WSL2 + Ubuntu (default recommendation for non-technical users)
- Linux: `build-essential`, `pkg-config`, `libssl-dev`, Tauri webkit/gtk libs
- macOS: Homebrew
- Windows: winget (preinstalled on modern Win10/11) or Scoop

**Tier 1 — Things Claude Code itself benefits from materially**
- ripgrep (`rg`)
- GitHub CLI (`gh`)
- Modern terminal emulator (Ghostty / Warp / Windows Terminal)
- Modern shell (Zsh on macOS/Linux, PowerShell 7 on Windows)
- Starship prompt (optional)

**Tier 2 — Polyglot version management**
- mise (recommended); fnm / volta / asdf as alternatives

**Tier 3 — Python + uv**
- Python 3.12+
- uv (Astral)
- pipx (fallback)

**Tier 4 — Rust toolchain**
- rustup + stable Rust (required for Tauri; also powers many CLIs)

**Tier 5 — Editor / IDE**
- VS Code (default for non-technical users) + Claude Code extension
- Cursor (AI-forward alternative)
- JetBrains Toolbox + Claude Code plugin (advanced users)

**Tier 6 — Container runtime**
- macOS: OrbStack (preferred) or Docker Desktop
- Linux: Docker Engine + rootless mode
- Windows: Docker Desktop (WSL2 backend) or Podman Desktop
- Podman as license-free alternative

**Tier 7 — CLI quality-of-life (used by agents)**
- jq, yq, fd, fzf, bat, eza, delta, zoxide, httpie/xh, tldr

**Tier 8 — 1Password integration depth**
- 1Password desktop
- 1Password CLI (`op`)
- 1Password SSH agent (replaces ssh-agent, biometric-gated)
- 1Password git commit signing (SSH-based)
- `op run` / `op inject` patterns for `.env` substitution
- 1Password shell plugins
- 1Password browser extension auto-install + linking

**Tier 9 — Identity / Git hygiene (validation gates, not optional steps)**
- `git config --global user.name` / `user.email`
- SSH key generated or 1Password SSH agent configured
- GitHub SSH key uploaded (`gh ssh-key add`)
- GPG or SSH commit signing configured + verified by test signed commit
- Sensible defaults: `init.defaultBranch=main`, `pull.rebase=true`,
  `fetch.prune=true`, `rerere.enabled=true`

**Tier 10 — MCP server prerequisites**
- `npx` (comes with npm) and `uvx` (comes with uv)
- Playwright browsers (`npx playwright install`)
- Chrome (for Claude Chrome extension)
- mcp-inspector (debugging tool)

**Tier 11 — Channel-side (Discord only in v1; others as post-v1 verbs)**
- Discord developer portal account + bot app + token (v1)
- iMessage: macOS Full Disk Access (post-v1)
- Signal: `signal-cli` + JRE/JDK 21+ (post-v1)
- WhatsApp: Meta Business + WhatsApp Business API (post-v1)
- Microsoft Teams: Azure tenant + app registration (post-v1)
- Google Chat: Google Cloud project + Workspace admin (post-v1)
- Slack: workspace admin + app + OAuth (post-v1)
- Telegram: BotFather token (post-v1)

**Tier 12 — Environment & secrets ergonomics**
- direnv or mise's built-in env support
- dotenv-cli for one-off invocations

**Tier 13 — Networking / infrastructure (optional)**
- Tailscale (homelab / remote dev)
- cloudflared or ngrok (exposing local MCP servers / webhooks)

**Foundation development dependencies (baseline)**
- git, Node 24 (via mise/nvm), pnpm, npm, bun, docker

## Verification

After creating the packet:
1. `git status --short` — confirm only `goals/stack-installer/**`
   files are added.
2. `cat goals/stack-installer/ops/manifest.json | jq .` — confirm
   valid JSON.
3. `rg -n "P0|P1|P2|P3|P4|P5" goals/stack-installer/` — confirm phase
   IDs are consistent across files.
4. Run `bun run config-sync` if a workspace package was accidentally
   referenced; this packet adds no workspace packages, so this should be a
   no-op.
5. Read the created README, SPEC, PLAN, and manifest in order. Confirm
   they tell a coherent story from purpose → architecture → phased plan →
   completion criteria.

## Done Criteria For This Session

This session is done when:
- The full artifact tree above exists.
- `p0-current-state.md` contains all 18 locked decisions and the full
  dependency inventory.
- The manifest's `currentTargetPhase` is `P1` and P0 is `completed`.
- All stub files have a `Status: stub` or `Status: pending` marker so future
  sessions can find them.
- The next session knows to begin P1 (Discord vertical, Manual Mode) from
  `HANDOFF_P1_DISCORD_MANUAL.md` (even though that file is currently a stub).

Do not begin P1 in this session. Do not write Tauri code, verb-registry
packages, MCP servers, or skill bundles. The packet is the deliverable.
