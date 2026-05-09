# P5b Real Pulumi Remote Apply

Date: 2026-05-07

Status: Phoenix backend deployed and verified on dankserver. Pulumi state
reconciliation completed on May 9, 2026 during P6a closeout.

## Delivered

- Added schema-first remote deployment config to `@beep/infra` for SSH host,
  SSH user, optional SSH agent socket, remote config root, tailnet FQDN, and the
  dedicated Phoenix tailnet HTTPS port.
- Resolved the dankserver install contract to
  `https://dankserver.tailc7c348.ts.net:8447` for Phoenix UI and OTLP trace
  export while keeping local smoke at `http://127.0.0.1:6006`.
- Moved the Phoenix tailnet route off port 8446 after headed Playwright
  verification showed that port already serves the `RP Recovery Dashboard`.
- Added native Pulumi `command.remote.Command` resources for:
  - host preflight
  - remote Phoenix compose/systemd apply
  - tailnet and Phoenix health verification
- Kept remote apply Phoenix-only for P5b. Langfuse, Opik, PostHog, and LiteLLM
  remain contracts or deferred follow-up targets.
- Kept CLI `ai-metrics install apply` non-mutating. Real dankserver mutation is
  now owned by `cd infra && pulumi up --stack beep-ai-metrics-dankserver`.
- Added explicit stack config defaults for Phoenix image, tailnet port, SSH
  host/user, tailnet FQDN, and remote config root.
- Deployed the Phoenix backend to dankserver over SSH with the same compose,
  systemd, Tailscale Serve, and health-check commands modeled by the Pulumi
  resources.
- Switched the remote Tailscale commands from passwordless `sudo` to the normal
  user-accessible Tailscale CLI after host probing showed the local Tailscale
  socket is available to the deployment user.
- Verified Phoenix live at `https://dankserver.tailc7c348.ts.net:8447` with
  HTTP 200, Phoenix version headers, Tailscale Serve status, systemd/container
  status, and headed Playwright browser automation.
- Confirmed the user-provided Tailscale API token reference was not needed for
  this host because the deployment user can configure Tailscale Serve directly.
- Attempted to resolve the checked-in AI metrics 1Password refs for hash salt
  and raw archive key before sending real traces; they did not resolve in the
  current 1Password account, so no throwaway secret was used for live data.
- P6a closeout later resolved the AI metrics refs, reconciled Pulumi state, and
  verified live Phoenix version `15.5.0`.

## Boundaries

- `@beep/infra` owns host mutation and deploy-time checks.
- `@beep/repo-ai-metrics` owns install contract resolution and the local
  collector/export workflow.
- The workstation transcript collector and derived DuckDB remain local; only
  redacted OTLP spans are exported to remote Phoenix.
- No private key, password, or raw secret value is stored in Pulumi state by this
  implementation. SSH uses the local SSH agent path supported by Pulumi command
  resources.

## Evidence

- `bun run --filter @beep/repo-ai-metrics check`
- `bun run --filter @beep/repo-ai-metrics lint`
- `bunx --bun vitest run packages/tooling/library/ai-metrics/test/ingest.test.ts packages/tooling/tool/cli/test/ai-metrics-command.test.ts`
- `cd infra && bun run check`
- `cd infra && bun run lint`
- `cd infra && bun run test`
- `cd infra && bun run docgen`
- `bun run config-sync`
- `bun run check`
- `bun run lint`
- `bun run test`
- `cd infra && pulumi preview --stack beep-ai-metrics-dankserver --non-interactive`
- `ssh dankserver-yubi '...'` remote preflight and apply for Phoenix compose,
  user systemd, and Tailscale Serve on `8447`
- `curl -kIs https://dankserver.tailc7c348.ts.net:8447/`
- headed Playwright open of `https://dankserver.tailc7c348.ts.net:8447/projects`
- 1Password metadata check for `TBK/dankserver` confirmed Tailscale fields are
  present, but not AI metrics hash/raw archive secrets.

Original Pulumi preview did not reach the provider runtime in this shell:

```text
error: getting stack configuration: get stack secrets manager: passphrase must be set with PULUMI_CONFIG_PASSPHRASE or PULUMI_CONFIG_PASSPHRASE_FILE environment variables
```

## Operator Resume

Pulumi state is now reconciled. To re-run the gate, resolve the Pulumi
passphrase into the environment first:

```sh
cd infra
PULUMI_CONFIG_PASSPHRASE=<resolved-secret> pulumi preview -s beep-ai-metrics-dankserver --non-interactive --diff
PULUMI_CONFIG_PASSPHRASE=<resolved-secret> pulumi up -s beep-ai-metrics-dankserver --yes --non-interactive
```

Real trace export uses the checked-in secret references plus runtime values:

```sh
export BEEP_AI_METRICS_HASH_SALT_SECRET_REF="op://TBK/ai-metrics/hash-salt"
export BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF="op://TBK/ai-metrics/raw-archive-key"
export BEEP_AI_METRICS_HASH_SALT="$(op read "$BEEP_AI_METRICS_HASH_SALT_SECRET_REF")"
export BEEP_AI_METRICS_RAW_ARCHIVE_KEY="$(op read "$BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF")"

curl -fsS https://dankserver.tailc7c348.ts.net:8447
beep-cli ai-metrics forwarder run --target dankserver --data-root .beep/ai-metrics --hash-salt-secret-ref "$BEEP_AI_METRICS_HASH_SALT_SECRET_REF" --raw-archive-key-secret-ref "$BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF" --otlp --otlp-base-url https://dankserver.tailc7c348.ts.net:8447
beep-cli ai-metrics otlp export --target dankserver --data-root .beep/ai-metrics --ingest-run latest --hash-salt-secret-ref "$BEEP_AI_METRICS_HASH_SALT_SECRET_REF" --raw-archive-key-secret-ref "$BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF" --otlp-base-url https://dankserver.tailc7c348.ts.net:8447
beep-cli ai-metrics report weekly --target dankserver --data-root .beep/ai-metrics --hash-salt-secret-ref "$BEEP_AI_METRICS_HASH_SALT_SECRET_REF" --raw-archive-key-secret-ref "$BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF"
```

## Remaining Gate

- Keep the P6 workstation timer running through the credited seven-day proof
  window.
- Generate the final seven-day scorecard after May 16, 2026 02:26
  America/Chicago.
