# Docgen Local Worker Eval

## Status

P0-P2 complete; local command implemented; live GPU smoke and Qwen acquisition pending

## Overview

This initiative moves the Documentation Quality worker eval from a Runpod-only
execution path to a local workstation path that can launch a reasonably sized
coding model on the dual Radeon AI PRO R9700 workstation.

The first local target is Docker-backed ROCm llama.cpp serving an
OpenAI-compatible endpoint on `127.0.0.1:18080`. The command remains read-only
and delegates packet selection/scoring to the existing `beep docgen
quality-worker-eval` machinery.

The command surface under implementation is:

```sh
bun run beep docgen quality-worker-eval-local \
  --input <source-quality-report.json> \
  --model <explicit-model-id> \
  --model-path /home/elpresidank/ai/models/<model>.gguf \
  --confirm-local-gpu-eval
```

The P0 model decision is intentionally research-gated. The packet recommends
starting with Qwen3-Coder 30B-A3B GGUF, keeping Qwen3-Next 80B-A3B GGUF as the
stretch candidate after the local wrapper proves stable, and retaining the
already-installed Llama 3.3 70B GGUF as a non-coder control rather than the
first coding-worker target.

The non-GPU implementation proof is complete: focused docgen tests, repo-cli
typecheck, repo-cli lint, packet manifest validation, GOAL length, command help,
and diff whitespace checks all pass. The live GPU smoke is intentionally still
pending because it should be explicit and operator-visible.

## Read This First

- [SPEC.md](./SPEC.md) - authoritative local eval contract
- [PLAN.md](./PLAN.md) - rollout phases and verification
- [research/2026-06-15-local-coder-model-selection.md](./research/2026-06-15-local-coder-model-selection.md) - P0 model/runtime research artifact
- [history/outputs/](./history/outputs) - sanitized wrapper reports and smoke outputs
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing

## Operating Rules

- Keep local worker eval read-only.
- Require explicit `--model`, `--model-path`, and `--confirm-local-gpu-eval`.
- Do not default to a model id; P0 evidence owns model selection.
- Bind only to localhost by default.
- Use Docker first; do not require installing llama.cpp into the host OS.
- Prefer `--split-mode layer` before tensor or row split.
- Stop and remove the container by default; use `--keep-server` only for debug.
- Keep model artifacts in `/home/elpresidank/ai/models` and reflect acquisitions
  in `/home/elpresidank/ai` manifests/docs.
- Preserve unrelated worktree changes in `/home/elpresidank/ai`.
