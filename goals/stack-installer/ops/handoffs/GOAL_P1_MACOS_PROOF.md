# Goal P1 macOS Proof

Status: ready for `/goal`.

## Short Goal Command

Use this command instead of pasting the full objective inline:

```text
/goal follow the instructions in goals/stack-installer/ops/handoffs/GOAL_P1_MACOS_PROOF.md
```

## Mission

Complete the Stack Installer macOS P1 fresh-machine proof on the buddy MacBook
Pro. This goal stops at macOS proof completion only; it does not close full P1,
Windows proof, P2 AI Mode, recovery, portability, signing, distribution, or V1.

The successful output is a locally returned and coordinator-audited macOS proof
bundle:

```text
output/stack-installer/p1-live/stack-installer-p1-macos.tgz
output/stack-installer/p1-live/macos/
```

## Required Startup

- Read `../../SPEC.md`.
- Read `../../PLAN.md`.
- Read `../manifest.json`.
- Read `HANDOFF_P1_DISCORD_MANUAL.md`.
- Confirm the coordinator checkout is on `feat/stack-installer-p1-live` and
  note the current `HEAD`.
- Confirm `output/stack-installer/p1-live/` remains ignored and do not commit
  raw proof artifacts.

## Operating Decisions

- Use the current coordinator checkout as the source of truth.
- Hand the Mac operator a local source archive from the current `HEAD`; do not
  require GitHub clone access for this run.
- Use the repo proof bundle path, not a signed or notarized macOS app.
- Use the operator's MacBook Pro with missing tools installed only as needed.
- Use the user's accounts for 1Password, Claude, Codex, and Discord proof
  resources, then clean up or sign out after proof capture.
- Transfer the audited macOS bundle back locally by AirDrop, USB, or local file
  share. Do not use Taildrop or the token upload endpoint unless local transfer
  fails.
- Use built-in macOS screen recording and keep the recording scoped to proof
  commands and sanitized output.

## Coordinator Setup

Create ignored handoff material under `output/stack-installer/p1-live/`:

- a source archive from the current branch `HEAD`
- a short Mac operator runbook derived from `HANDOFF_P1_DISCORD_MANUAL.md`
- no plaintext secrets, no upload tokens, and no raw proof contents in tracked
  files

Collect the runtime values from the user out-of-band:

- Discord guild ID
- Discord channel ID
- Discord channel display name
- Discord bot token 1Password reference shaped like `op://vault/item/field`
- deterministic test message, defaulting to `Stack Installer P1 macOS proof`
- operator label, defaulting to `operator-macos-001`

## Mac Operator Flow

On the MacBook Pro:

1. Expand the source archive and enter the repo checkout.
2. Install missing prerequisites only as needed: Git or Xcode Command Line
   Tools, Bun, Rust/Cargo for `cargo check`, 1Password CLI, Claude Code, and
   Codex CLI.
3. Authenticate `op`, `claude`, and `codex` with the user's accounts.
4. Run the preflight from `HANDOFF_P1_DISCORD_MANUAL.md`.
5. Run `p1:proof:capture` with `targetPlatform` set to `macos` and the Discord
   bot credential passed only as an `op://...` reference.
6. Save a built-in macOS screen recording as
   `output/stack-installer/p1-live/macos/screencast.mov`.
7. Run `p1:proof:checksums -- --platform macos`.
8. Run `p1:proof:audit -- --platform macos`.
9. Package `output/stack-installer/p1-live/macos/` as
   `output/stack-installer/p1-live/stack-installer-p1-macos.tgz`.
10. Transfer only that audited bundle back to the coordinator machine through
    the chosen local private handoff path.

## Coordinator Validation

After receiving `stack-installer-p1-macos.tgz`, place it under:

```text
output/stack-installer/p1-live/
```

Then run:

```bash
cd apps/stack-installer
bun run p1:proof:intake -- --output-root ../../output/stack-installer/p1-live
bun run p1:proof:audit -- --platform macos
bun run p1:proof:status -- --output-root ../../output/stack-installer/p1-live
```

Expected result:

- `p1:proof:intake` extracts `output/stack-installer/p1-live/macos/`.
- `p1:proof:audit -- --platform macos` passes.
- `p1:proof:status` reports macOS required files present.
- Windows remains missing and is the expected remaining P1 blocker.

## Completion Criteria

Mark this `/goal` complete only when all are true:

- the Mac proof bundle exists under the coordinator output root
- the extracted `macos/` proof directory exists
- `proof.json`, `commands.txt`, `sha256sums.txt`, and `screencast.*` are
  present under the Mac proof directory
- the coordinator-side macOS audit passes
- no plaintext Discord token, 1Password secret, provider credential, upload
  token, or account password appears in tracked files, chat, comments, or
  proof summaries

## Stop Conditions

- Stop if a plaintext secret would be pasted into a command, app input,
  screencast, repo file, PR comment, or chat.
- Stop if the proof result contains a likely plaintext Discord token.
- Stop if the Mac cannot authenticate `op`, `claude`, or `codex`.
- Stop if Discord liveness cannot send the P1 test message.
- Stop if the implementation drifts into AI Mode, MCP runtime, recovery,
  portability, signing, notarization, auto-update, telemetry, or distribution.
- Do not mark full P1 complete; Windows proof and the post-proof PR readiness
  review remain pending.
