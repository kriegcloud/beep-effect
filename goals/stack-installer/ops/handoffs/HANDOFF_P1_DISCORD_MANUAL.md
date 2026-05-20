# Handoff P1 - Discord Vertical, Manual Mode

Status: macOS proof complete; Windows proof still pending; full P1 not closed.

## Mission

Implement and prove the Discord-only Manual Mode vertical for macOS and
Windows. Do not implement AI Mode in this phase.

## Current Gate Position

- macOS proof has been completed and audited on the coordinator checkout.
- Windows proof is still required for full P1 closure.
- P1C may now start under the explicit temporary Windows missing-proof waiver
  recorded in `../../history/outputs/p1-pr-readiness-review.md`.
- Do not treat that waiver as Windows success.

## Required Startup

- Read `../../SPEC.md`.
- Read `../../PLAN.md`.
- Read `../manifest.json`.
- Read `../../history/outputs/p0-current-state.md`.
- Read `../../history/outputs/p1-discord-vertical-manual.md`.
- Read the relevant research notes before running live proof.

## Implemented Surfaces

- App package: `apps/stack-installer` / `@beep/stack-installer`
- Live app-local proof harness:
  `apps/stack-installer/src/proof/P1ManualProof.ts`
- Bun proof entrypoint:
  `apps/stack-installer/src/proof/run-p1-manual-proof.ts`
- Tauri command: `run_p1_manual_proof`
- Live drivers:
  - `packages/drivers/onepassword-cli`
  - `packages/drivers/ai-provider-cli`
  - `packages/drivers/discord`
- Installer-owned live validation contracts:
  - `@beep/installer-domain`
  - `@beep/installer-use-cases`
  - `@beep/installer-server`

## Fresh-Machine Inputs

Each macOS and Windows run needs:

- target platform: `macos` or `windows`
- operator label for the proof manifest
- Discord guild ID
- Discord channel ID
- Discord channel display name
- Discord bot token stored in 1Password
- 1Password reference shaped like `op://vault/item/field`
- deterministic test message content

Never paste a plaintext Discord bot token into the app, CLI request, manifest,
screen recording notes, issue comments, or commit messages.

## Preflight

Run these from the checkout:

```bash
git status --short --branch
bun install
bun run config-sync:check
(cd apps/stack-installer && bun run build)
(cd apps/stack-installer/src-tauri && cargo check)
```

Then verify local operator state without recording secret values:

```bash
command -v op
command -v claude
command -v codex
op whoami
claude auth status
codex login status
```

The current P1 driver probes exactly those provider status commands. If either
provider command returns a non-zero exit code, P1 should record a failed
provider validation instead of treating the machine as complete.

## CLI Proof Path

Create an ignored local output directory per target:

```bash
mkdir -p output/stack-installer/p1-live/macos
mkdir -p output/stack-installer/p1-live/windows
```

Use the Bash-compatible template on macOS, Git Bash, or WSL. Use the
PowerShell template on native Windows. Change `STACK_INSTALLER_PLATFORM`,
`STACK_INSTALLER_OPERATOR_LABEL`, and `STACK_INSTALLER_TEST_MESSAGE` for the
target run. Keep `STACK_INSTALLER_DISCORD_BOT_TOKEN_REFERENCE` as an
`op://...` reference, never a token value.

Use these platform values:

| Target | `STACK_INSTALLER_PLATFORM` | `STACK_INSTALLER_OPERATOR_LABEL` | `STACK_INSTALLER_TEST_MESSAGE` |
| --- | --- | --- | --- |
| macOS | `macos` | `operator-macos-001` | `Stack Installer P1 macOS proof` |
| Windows | `windows` | `operator-windows-001` | `Stack Installer P1 Windows proof` |

```bash
export STACK_INSTALLER_PLATFORM=macos
export STACK_INSTALLER_OPERATOR_LABEL=operator-macos-001
export STACK_INSTALLER_DISCORD_GUILD_ID=000000000000000000
export STACK_INSTALLER_DISCORD_CHANNEL_ID=000000000000000000
export STACK_INSTALLER_DISCORD_CHANNEL_DISPLAY_NAME=ai-stack-installer
export STACK_INSTALLER_DISCORD_BOT_TOKEN_REFERENCE='op://Private/Discord Bot/token'
export STACK_INSTALLER_TEST_MESSAGE='Stack Installer P1 macOS proof'

export STACK_INSTALLER_REQUEST_JSON="$(bun --print '
JSON.stringify({
  targetPlatform: process.env.STACK_INSTALLER_PLATFORM,
  operatorLabel: process.env.STACK_INSTALLER_OPERATOR_LABEL,
  discordGuildId: process.env.STACK_INSTALLER_DISCORD_GUILD_ID,
  discordChannelId: process.env.STACK_INSTALLER_DISCORD_CHANNEL_ID,
  discordChannelDisplayName: process.env.STACK_INSTALLER_DISCORD_CHANNEL_DISPLAY_NAME,
  discordBotTokenReference: process.env.STACK_INSTALLER_DISCORD_BOT_TOKEN_REFERENCE,
  testMessageContent: process.env.STACK_INSTALLER_TEST_MESSAGE
})
')"

cd apps/stack-installer
bun run p1:proof:capture -- --request-json "$STACK_INSTALLER_REQUEST_JSON"
```

Native Windows PowerShell template:

```powershell
$env:STACK_INSTALLER_PLATFORM = "windows"
$env:STACK_INSTALLER_OPERATOR_LABEL = "operator-windows-001"
$env:STACK_INSTALLER_DISCORD_GUILD_ID = "000000000000000000"
$env:STACK_INSTALLER_DISCORD_CHANNEL_ID = "000000000000000000"
$env:STACK_INSTALLER_DISCORD_CHANNEL_DISPLAY_NAME = "ai-stack-installer"
$env:STACK_INSTALLER_DISCORD_BOT_TOKEN_REFERENCE = "op://Private/Discord Bot/token"
$env:STACK_INSTALLER_TEST_MESSAGE = "Stack Installer P1 Windows proof"

$stackInstallerRequestJson = @{
  targetPlatform = $env:STACK_INSTALLER_PLATFORM
  operatorLabel = $env:STACK_INSTALLER_OPERATOR_LABEL
  discordGuildId = $env:STACK_INSTALLER_DISCORD_GUILD_ID
  discordChannelId = $env:STACK_INSTALLER_DISCORD_CHANNEL_ID
  discordChannelDisplayName = $env:STACK_INSTALLER_DISCORD_CHANNEL_DISPLAY_NAME
  discordBotTokenReference = $env:STACK_INSTALLER_DISCORD_BOT_TOKEN_REFERENCE
  testMessageContent = $env:STACK_INSTALLER_TEST_MESSAGE
} | ConvertTo-Json -Compress

Set-Location apps/stack-installer
bun run p1:proof:capture -- --request-json "$stackInstallerRequestJson"
```

Run the capture wrapper from `apps/stack-installer` with a request like:

```bash
bun run p1:proof:capture -- --request-json '{"targetPlatform":"macos","operatorLabel":"operator-macos-001","discordGuildId":"000000000000000000","discordChannelId":"000000000000000000","discordChannelDisplayName":"ai-stack-installer","discordBotTokenReference":"op://Private/Discord Bot/token","testMessageContent":"Stack Installer P1 macOS proof"}'
```

The capture wrapper writes:

- `output/stack-installer/p1-live/macos/proof.json`
- `output/stack-installer/p1-live/windows/proof.json`
- `output/stack-installer/p1-live/<platform>/commands.txt`
- `output/stack-installer/p1-live/<platform>/sha256sums.txt`

The proof JSON must contain the 1Password reference and Discord message ID,
but must not contain the resolved bot token or any other plaintext secret.

After adding `screencast.*` to the same output directory, refresh checksums
without sending another Discord proof message:

```bash
bun run p1:proof:checksums -- --platform "$STACK_INSTALLER_PLATFORM"
```

On native Windows PowerShell:

```powershell
bun run p1:proof:checksums -- --platform $env:STACK_INSTALLER_PLATFORM
```

Then audit the artifact directory locally:

```bash
bun run p1:proof:audit -- --platform "$STACK_INSTALLER_PLATFORM"
```

On native Windows PowerShell:

```powershell
bun run p1:proof:audit -- --platform $env:STACK_INSTALLER_PLATFORM
```

Use `--output-dir` instead of `--platform` only when the capture command
intentionally wrote to a non-default artifact directory.

The audit fails if required files are missing, checksums are stale, any
validation event is not `passed`, Claude/Codex are not configured, the
1Password token-reference event is missing, the Discord message ID is missing,
text artifacts contain a likely plaintext Discord token, or manifest
credentials are not `op://...` references.

After both platform directories are present, run the combined P1 audit:

```bash
bun run p1:proof:status -- --output-root ../../output/stack-installer/p1-live
bun run p1:proof:audit-all -- --output-root ../../output/stack-installer/p1-live
```

## Desktop Proof Path

Run the desktop shell:

```bash
cd apps/stack-installer
bun run dev:tauri
```

Use the P1 live form, enter only the 1Password reference for the bot token,
run the proof, and capture the sanitized result shown by the app.

## Required Artifacts

Store raw artifacts under ignored `output/stack-installer/p1-live/<platform>/`
until they are reviewed and sanitized:

- `proof.json`
- `screencast.*`
- `commands.txt`
- `sha256sums.txt`

Only commit documentation summaries and sanitized evidence paths. Do not commit
raw screencasts unless they have been reviewed for secrets, personal account
details, and tokens.

## Artifact Return To Coordinator Checkout

After the per-platform audit passes on the fresh machine, transfer only the
audited platform directory back to the coordinator checkout. Keep the artifacts
out of commits; `output/` is the working evidence inbox for final audit.

If using Taildrop on the coordinator machine, ensure the local Tailscale
operator is configured before receiving files:

```bash
sudo tailscale set --operator=$USER
tailscale file get output/stack-installer/p1-live
```

If Taildrop is unavailable, use another approved private transfer channel and
place the received bundles under `output/stack-installer/p1-live/`.

If the coordinator provides a temporary tailnet upload endpoint, use only the
endpoint and one-time token supplied by the coordinator for this proof window.
Pass the token in an `Authorization: Bearer ...` header, not in the URL. Keep
the token out of chat, commits, shell history captures, and screencasts. Upload
only the approved bundle file for the current platform:

For the current proof window, the coordinator has verified the upload endpoint
through both the raw tailnet address and MagicDNS:

```text
http://<coordinator-tailscale-ip>:8765
http://<coordinator-magic-dns-name>:8765
```

If a future proof window restarts the upload endpoint, prefer the values in the
coordinator-local `output/stack-installer/p1-live/proof-upload-commands.txt`.

Coordinator start template:

```bash
node goals/stack-installer/ops/start-proof-upload-window.mjs \
  --host '<coordinator-tailscale-ip>' \
  --port 8765 \
  --output-root output/stack-installer/p1-live \
  --advertised-url 'http://<coordinator-magic-dns-name>:8765' \
  --replace-existing
```

Use `--reuse-token` with `--replace-existing` when restarting the upload
server for a coordinator-side helper update while an operator may already have
the current token. Omit `--reuse-token` when intentionally rotating the proof
window token.

Coordinator status template:

```bash
node goals/stack-installer/ops/proof-upload-status.mjs \
  --host '<coordinator-tailscale-ip>' \
  --port 8765 \
  --alternate-url-base 'http://<coordinator-magic-dns-name>:8765' \
  --output-root output/stack-installer/p1-live \
  --fail-on-missing
```

This status command reports upload server health, returned bundle presence,
platform artifact directories, private upload files, and the detached proof
watcher files/state when the detached watcher has been started. When
`--alternate-url-base` is provided, it also verifies the MagicDNS health,
landing, status, commands, and next-actions paths without printing the token.

Before uploading from a proof machine, verify the endpoint is reachable:

```bash
curl -f 'http://<coordinator-tailscale-ip>:<port>/health'
curl -f 'http://<coordinator-magic-dns-name>:<port>/health'
```

Native Windows PowerShell:

```powershell
Invoke-WebRequest -Method Get -Uri 'http://<coordinator-tailscale-ip>:<port>/health'
Invoke-WebRequest -Method Get -Uri 'http://<coordinator-magic-dns-name>:<port>/health'
```

To inspect what the coordinator has received from a proof machine, use the
token-protected remote status endpoint:

```bash
curl -f \
  -H "Authorization: Bearer ${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" \
  'http://<coordinator-tailscale-ip>:<port>/status'
```

Native Windows PowerShell:

```powershell
Invoke-WebRequest `
  -Method Get `
  -Headers @{ Authorization = "Bearer $env:STACK_INSTALLER_PROOF_UPLOAD_TOKEN" } `
  -Uri 'http://<coordinator-tailscale-ip>:<port>/status'
```

To fetch the current coordinator-generated upload commands from a proof
machine, use the token-protected command endpoint:

```bash
curl -f \
  -H "Authorization: Bearer ${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" \
  'http://<coordinator-tailscale-ip>:<port>/commands'
```

Native Windows PowerShell:

```powershell
Invoke-WebRequest `
  -Method Get `
  -Headers @{ Authorization = "Bearer $env:STACK_INSTALLER_PROOF_UPLOAD_TOKEN" } `
  -Uri 'http://<coordinator-tailscale-ip>:<port>/commands'
```

To fetch the full current operator next-actions note from a proof machine, use
the token-protected next-actions endpoint:

```bash
curl -f \
  -H "Authorization: Bearer ${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" \
  'http://<coordinator-tailscale-ip>:<port>/next-actions'
```

Native Windows PowerShell:

```powershell
Invoke-WebRequest `
  -Method Get `
  -Headers @{ Authorization = "Bearer $env:STACK_INSTALLER_PROOF_UPLOAD_TOKEN" } `
  -Uri 'http://<coordinator-tailscale-ip>:<port>/next-actions'
```

```bash
curl -f --upload-file output/stack-installer/p1-live/stack-installer-p1-macos.tgz \
  -H "Authorization: Bearer ${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" \
  'http://<coordinator-tailscale-ip>:<port>/upload/stack-installer-p1-macos.tgz'
```

Native Windows PowerShell:

```powershell
Invoke-WebRequest `
  -Method Put `
  -InFile 'output\stack-installer\p1-live\stack-installer-p1-windows.zip' `
  -Headers @{ Authorization = "Bearer $env:STACK_INSTALLER_PROOF_UPLOAD_TOKEN" } `
  -Uri 'http://<coordinator-tailscale-ip>:<port>/upload/stack-installer-p1-windows.zip'
```

The coordinator must still run `p1:proof:intake` and `p1:proof:audit-all`
after upload. A successful upload is only a transfer event; it is not proof
completion. If upload fails, inspect the upload server log for redacted
request outcomes; it should never contain the one-time token or artifact
contents. The coordinator start script writes the token, command, log, and PID
files under the ignored output root with `0600` permissions. It also refreshes
local-only `README.operator-inbox.md` and `OPERATOR_NEXT_ACTIONS.md` handoff
notes under the ignored output root so the current endpoint and `/commands`
route are visible at the proof inbox.

From `apps/stack-installer` on macOS, Git Bash, or WSL:

```bash
cd ../..
tar -czf "output/stack-installer/p1-live/stack-installer-p1-${STACK_INSTALLER_PLATFORM}.tgz" \
  -C output/stack-installer/p1-live \
  "$STACK_INSTALLER_PLATFORM"
```

From `apps/stack-installer` on native Windows PowerShell:

```powershell
Set-Location ..\..
Compress-Archive `
  -Path "output\stack-installer\p1-live\$env:STACK_INSTALLER_PLATFORM" `
  -DestinationPath "output\stack-installer\p1-live\stack-installer-p1-$($env:STACK_INSTALLER_PLATFORM).zip" `
  -Force
```

Keep the `-Path` value pointed at the platform directory itself. Do not append
`\*`; the archive must preserve the top-level `windows` directory so
coordinator-side extraction creates `output/stack-installer/p1-live/windows/`.

On the coordinator checkout, copy the received bundle into
`output/stack-installer/p1-live/`, then run the intake helper:

```bash
cd apps/stack-installer
bun run p1:proof:intake -- --output-root ../../output/stack-installer/p1-live
```

When an operator is about to transfer bundles, the coordinator can run a bounded
watch instead of manually polling:

```bash
cd apps/stack-installer
bun run p1:proof:watch -- --output-root ../../output/stack-installer/p1-live --watch-attempts 120 --watch-interval-ms 5000
```

The watch command repeats intake plus `p1:proof:audit-all` until both platform
artifact directories pass audit, or until the attempt limit is exhausted.

For longer transfer windows, the coordinator can start the same watch as a
detached local helper from repo root:

```bash
node goals/stack-installer/ops/start-proof-watch-window.mjs \
  --output-root output/stack-installer/p1-live \
  --watch-attempts 2880 \
  --watch-interval-ms 5000 \
  --replace-existing \
  --preserve-log
```

The detached helper writes private `proof-watch.log`, `proof-watch.pid`, and
`proof-watch-command.txt` files under the ignored output root. The coordinator
status command above includes those watcher files and recent watcher log lines
so a long proof window can be checked without opening the private files by hand.
Use `--preserve-log` when extending an active transfer window so earlier
watcher evidence stays in the private log. With `--replace-existing`, the
starter stops the existing detached watcher process group before launching the
new watcher so stale child processes do not keep writing to the same log.

The intake helper safely extracts `stack-installer-p1-macos.tgz` and
`stack-installer-p1-windows.zip` only when the corresponding platform directory
is missing, then prints the current status. Manual extraction remains available
when needed:

```bash
mkdir -p output/stack-installer/p1-live
tar -xzf output/stack-installer/p1-live/stack-installer-p1-macos.tgz \
  -C output/stack-installer/p1-live
unzip -o output/stack-installer/p1-live/stack-installer-p1-windows.zip \
  -d output/stack-installer/p1-live
```

If a platform bundle is present but the extracted platform directory is still
missing, `p1:proof:status` prints the exact extraction command for that bundle.

After extraction, these directories must exist:

```text
output/stack-installer/p1-live/macos/
output/stack-installer/p1-live/windows/
```

Do not paste artifact contents into chat, issue comments, or PR comments. Share
the bundle through an approved private transfer channel, then run
`p1:proof:audit-all` from the coordinator checkout before summarizing evidence.

## Post-Proof PR Readiness Review

After both fresh-machine proof artifact sets exist and have been audited for
secret safety, run `$quality-review-fix-loop` before calling the branch PR
ready.

Review scope:

- `goals/stack-installer/**`
- `apps/stack-installer/**`
- P1 live drivers under `packages/drivers`
- the installer slice under `packages/installer/{domain,use-cases,server}`
- package manifests, tests, public exports, generated config references, and
  Tauri proof flow directly affected by P1

The review must additionally look for reuse opportunities and structural
improvements that make the modules flatter, more idiomatic, and cleaner while
following repo laws and patterns exactly. Reuse findings must name the existing
module or package being reused, or explain why package-local code remains the
correct home. Do not create vague `common`, `core`, `utils`, or `lib` homes.

P1 is PR ready only when the review loop records zero required blockers or
explicit waivers in `history/outputs/p1-pr-readiness-review.md`.

## Stop Conditions

- Stop if a verb would accept a plaintext credential.
- Stop if either macOS or Windows proof cannot be produced.
- Stop if implementation starts AI Mode before Manual Mode closes.
- Stop if the slice topology drifts from
  `packages/installer/{domain,use-cases,server}` without a new architecture
  decision.
- Stop if the proof result contains any plaintext secret.
