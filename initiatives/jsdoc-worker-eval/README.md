# JSDoc Worker Eval

## Status

P0-P5 complete; hosted Codex baseline completed

## Overview

This initiative evaluates whether Codex SDK orchestration can route existing
JSDoc quality remediation packets to a read-only worker, including hosted Codex
models and local Qwen-style models through Ollama or LM Studio, without making
model judgment the source of truth.

The implemented v1 command is read-only:

```sh
bun run beep docgen quality-worker-eval --input quality.json --provider codex --model <model-id>
```

It consumes `beep docgen quality --score codex` remediation packets, asks a
Codex SDK worker for advisory scoring and draft JSDoc, and emits JSON. It does
not edit source files.

The first local-provider run proved the plumbing but not the worker value:
Ollama 0.23.2 successfully pulled `qwen3-coder:30b`, then ran it CPU-only on
the local RTX 3070 workstation. The run caused visible workstation slowdown and
was stopped before a 10-packet report completed. Treat this model/host pairing
as unsuitable for interactive worker eval.

The hosted Codex baseline completed three repo-wide packets with
`gpt-5.4-mini` at low reasoning in about 27.3 seconds. All three worker turns
completed as candidate drafts with zero reported policy violations.

## Read This First

- [SPEC.md](./SPEC.md) - authoritative eval contract
- [PLAN.md](./PLAN.md) - current rollout plan and phase state
- [research/2026-05-12-ollama-qwen3-coder-30b-host-eval.md](./research/2026-05-12-ollama-qwen3-coder-30b-host-eval.md) - local-provider host outcome
- [research/2026-05-12-codex-gpt-5.4-mini-low-worker-eval.md](./research/2026-05-12-codex-gpt-5.4-mini-low-worker-eval.md) - hosted Codex baseline
- [history/outputs/](./history/outputs) - raw worker-model evidence worth preserving
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing

## Operating Rules

- Keep worker runs read-only.
- Treat deterministic `beep docgen quality` findings as the source of truth.
- Treat worker output as draft evidence until a human accepts it.
- Require explicit `--provider` and `--model`; do not hide API spend or local
  hardware load behind defaults.
- Use hosted Codex as the first low-cost baseline; use Ollama or LM Studio only
  when a caller deliberately selects a local provider.
- Do not use `qwen3-coder:30b` as the default eval model on this 8 GiB VRAM
  workstation; it runs CPU-only and degrades interactivity.
- Do not make worker findings blocking.
- Do not unblock write-mode remediation until accepted precision, cost, runtime,
  and policy-preservation evidence exists.
