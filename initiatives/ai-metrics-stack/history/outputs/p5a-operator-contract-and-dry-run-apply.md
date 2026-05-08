# P5a Operator Contract And Dry-Run Apply

Date: 2026-05-06

Status: completed

## Delivered

- Added schema-first P5a install contracts for typed plan steps, doctor checks,
  aggregate doctor results, and dry-run apply results.
- Added `ai-metrics install plan`, `ai-metrics install doctor`, and
  `ai-metrics install apply --dry-run` workflows.
- Kept P5a stdout-only and non-mutating: no Docker startup, Pulumi apply, SSH,
  secret resolution, or file output is performed by the new commands.
- Kept concrete deployment planning Phoenix-only. Langfuse, Opik, and PostHog
  remain candidate contracts.
- Preserved `plannedCommands` compatibility while using typed plan steps for the
  new operator workflow.

## Boundaries

- `@beep/repo-ai-metrics` owns typed install plan, doctor, and dry-run apply
  contracts.
- `@beep/repo-cli` owns operator command rendering and exit-code behavior.
- `@beep/infra` still owns real host mutation and Pulumi remote apply in P5b.
- P5a doctor validates contract shape and local source availability; it does
  not resolve `op://` references, read secret values, probe SSH, or hit tailnet
  endpoints.

## Evidence

- `bun run --filter @beep/repo-ai-metrics check`
- `bun run --filter @beep/repo-ai-metrics test -- ingest.test.ts`
- `bun run --filter @beep/repo-ai-metrics lint`
- `bun run --filter @beep/repo-ai-metrics docgen`
- `bun run --filter @beep/repo-cli check`
- `bun run --filter @beep/repo-cli test -- ai-metrics-command.test.ts`
- `bun run --filter @beep/repo-cli lint`
- `bun run config-sync`
- `bun run check`
- `bun run lint`
- `bun run test`

Synthetic proof coverage includes:

- Typed local install plans encode to JSON and include dry-run-only Phoenix
  deployment steps.
- Dankserver dry-run apply requires install secret references and emits Pulumi
  preview steps without mutation.
- Install doctor passes the contract when at least one source is available,
  warns for missing individual sources, and fails when zero sources are
  available.
- P5a `install apply` without `--dry-run` fails with an explicit P5b deferral.

## Deferred To P5b

- Real Pulumi remote apply for dankserver.
- Host directory creation, service file or compose installation, Docker/systemd
  startup, tailnet-only routing, and live health probes.
- Optional LiteLLM gateway deployment and enrichment.
