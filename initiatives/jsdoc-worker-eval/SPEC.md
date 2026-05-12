# JSDoc Worker Eval Spec

## Status

P0-P5 complete; hosted Codex baseline completed

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-12
- **Updated:** 2026-05-12

## Purpose

Evaluate whether Codex SDK orchestration can route JSDoc quality packets to a
read-only worker, including hosted Codex and local Qwen-style models through
Ollama or LM Studio, to reduce cost and preserve repo-specific JSDoc policy
before any auto-remediation design.

## Source Contract

This initiative consumes the existing report-only quality contract:

- `beep docgen quality`
- stable quality subjects
- deterministic whole-block JSDoc scoring
- typed finding codes
- capped `remediationPackets[]` when `--score codex` is used

## Implemented V1 Decisions

- Ownership stays in `@beep/repo-cli` under the `beep docgen` command group.
- The command surface is `beep docgen quality-worker-eval`.
- The eval lane is read-only and writes only explicit JSON report outputs.
- `--provider` is required and supports `codex`, `ollama`, and `lmstudio`.
- `--model` is required so hosted spend and local hardware load are caller-owned.
- `--reasoning-effort` supports `minimal`, `low`, `medium`, `high`, and
  `xhigh`.
- Hosted `--provider codex` defaults reasoning effort to `low` when omitted.
- Local providers receive no implicit reasoning effort.
- Deterministic `beep docgen quality` output remains the authoritative queue.
- Worker context is packet-only plus a compact JSDoc policy excerpt.
- Worker turns are sequential with a 180-second per-packet timeout.
- Default eval cap is five packets.
- Worker output is advisory evidence only.
- Eval reports stamp the resolved `@openai/codex-sdk` package version when it
  can be found.

## Public Surface

- `beep docgen quality-worker-eval --input <quality-report.json>`
- `beep docgen quality-worker-eval -p <package>`
- `beep docgen quality-worker-eval --all`
- `beep docgen quality-worker-eval --output <path>`
- `beep docgen quality-worker-eval --provider codex`
- `beep docgen quality-worker-eval --provider ollama`
- `beep docgen quality-worker-eval --provider lmstudio`
- `beep docgen quality-worker-eval --model <model-id>`
- `beep docgen quality-worker-eval --reasoning-effort low`
- `beep docgen quality-worker-eval --packet-limit <count>`

Default output is JSON on stdout. `--output` writes the same JSON report to an
explicit path. There is no package-local default write path.

## Evaluation Output Contract

The eval report includes:

- `schemaVersion`
- `generatedAt`
- `sourceQualityReport`
- `provider`
- `model`
- `reasoningEffort`
- `codexSdkVersion`
- `scope`
- `summary`
- `packets[]`
- `policyViolations[]`
- `runtime`
- `recommendation`

Each packet result includes:

- `packetId`
- `subjectId`
- `sourceAnchor`
- `packageName`
- `packagePath`
- `findingCodes`
- `status`
- `localScore`
- `rationale`
- `draftJsDoc`
- `expectedVerificationCommand`
- `policyViolationCodes`
- `reviewDisposition`
- `durationMs`
- `error`

`reviewDisposition` is one of `candidate`, `needs-human-review`, or `reject`.

## First Provider-Backed Outcome

The original P3 target was `@beep/types` and `@beep/utils`, but both packages
were already clean when the provider-backed run started:

- `@beep/types`
- `@beep/utils`

The eval was retargeted to a stratified dirty repo-wide source report:

- 63 packages
- 6006 quality subjects
- 2185 passing reviews
- 1721 warning reviews
- 2100 failure reviews
- 50 capped remediation packets

Ollama 0.23.2 successfully pulled `qwen3-coder:30b`, but runtime evidence showed
the model running with `size_vram: 0` on an RTX 3070 8 GiB workstation. The
runner used roughly five CPU cores and about 18 GiB RAM, caused interactive
slowdown, and the 10-packet eval was stopped before a JSON report completed.

P4 recommendation: keep workers read-only and experimental. Do not build
auto-remediation on this evidence. Retest with a smaller GPU-fit coder model or
a larger-VRAM host before reopening write-mode remediation.

## Hosted Codex Baseline

This PR adds a hosted Codex baseline:

```sh
bun run beep docgen quality-worker-eval --all --provider codex --model gpt-5.4-mini --reasoning-effort low --packet-limit 3 --output initiatives/jsdoc-worker-eval/history/outputs/2026-05-12-codex-gpt-5.4-mini-low-worker-eval.json
```

The baseline is intentionally small, read-only, and repo-wide. It completed
three packet turns in about 27.3 seconds:

- 3 selected packets
- 3 completed packets
- 3 candidate drafts
- 0 failed packets
- 0 timed-out packets
- 0 reported policy violations

This proves hosted Codex worker orchestration is viable for more evaluation. It
does not grant write-mode remediation.

## Non-Goals

- Do not edit repo-tracked source files.
- Do not add blocking JSDoc enforcement.
- Do not replace deterministic quality findings with worker judgment.
- Do not require a Qwen-specific architecture doctrine.
- Do not add auto-remediation write mode in this initiative.

## Acceptance Criteria

- The command can consume a saved quality JSON report.
- The command can generate an in-memory quality report for `-p` and `--all`.
- Packet selection is deterministic and package-stratified.
- Tests prove the orchestration with a fake Codex runner.
- Normal repo checks do not require a live local provider.
- Provider-backed host-suitability evidence is recorded before any graduation
  decision.
- Hosted Codex evidence records provider, model, reasoning effort, packet
  outcomes, and policy violations.
