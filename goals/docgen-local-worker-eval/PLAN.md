# Docgen Local Worker Eval Plan

## Phase Posture

| Phase | Status | Purpose | Output |
|---|---|---|---|
| P0 | Complete | Research and choose the first local coding model/runtime shape. | Research artifact plus model shortlist |
| P1 | Complete | Implement the local Docker wrapper command. | `quality-worker-eval-local` |
| P2 | Complete | Prove non-GPU checks. | Unit tests, typecheck, lint |
| P3 | Pending | Run one explicit live local smoke. | Sanitized wrapper JSON in `history/outputs/` |
| P4 | In progress | Update local AI model docs/manifests. | `/home/elpresidank/ai` docs/manifests; Qwen artifact acquisition pending |
| P5 | Pending | Close and recommend next model/sample size. | Packet closeout/reflection |

## P0 Research

- Confirm workstation facts from `/home/elpresidank/ai`.
- Review Qwen3-Coder 30B-A3B, Qwen3-Next 80B-A3B, Qwen2.5-Coder 32B, and
  installed Llama 3.3 70B.
- Record Docker/ROCm llama.cpp support and multi-GPU split-mode posture.
- Decide the first live candidate and fallback path.

Status: complete. Qwen3-Coder 30B-A3B GGUF is the first coding candidate, not a
graduated default.

## P1 Implementation

- Add `QualityWorkerLocalEval.ts` beside the existing worker eval modules.
- Add Docker run-argument builders exported for tests.
- Add schema-versioned local wrapper report classes.
- Add local readiness probe for `/v1/models`.
- Delegate to `analyzeDocgenQualityWorkerEval` with the local `/v1` base URL.
- Add the `quality-worker-eval-local` command to `Docgen.command.ts`.
- Re-export local internals from the docgen test kit.

Status: complete.

## P2 Verification

Run:

```sh
bun run --filter @beep/repo-cli test -- docgen
bun run --filter @beep/repo-cli check
bun run --filter @beep/repo-cli lint
jq . goals/docgen-local-worker-eval/ops/manifest.json
test "$(wc -m < goals/docgen-local-worker-eval/GOAL.md)" -le 4000
```

Status: complete.

## P3 Live Smoke

Live smoke is explicit because it uses local GPUs:

```sh
bun run beep docgen quality --all --json --score codex --packet-limit 1 \
  --output goals/docgen-local-worker-eval/history/outputs/source-quality-smoke.json

bun run beep docgen quality-worker-eval-local \
  --input goals/docgen-local-worker-eval/history/outputs/source-quality-smoke.json \
  --model <explicit-model-id> \
  --model-path /home/elpresidank/ai/models/<model>.gguf \
  --packet-limit 1 \
  --confirm-local-gpu-eval \
  --output goals/docgen-local-worker-eval/history/outputs/local-worker-smoke.json
```

## P4 AI Repo Sync

- Add acquired Qwen GGUF artifacts to `/home/elpresidank/ai/models`.
- Update `/home/elpresidank/ai/manifests/model-assets.json`.
- Update `/home/elpresidank/ai/docs/runtime/llama-cpp.md` or a scoped local
  docgen worker note with the command and model path.
- Preserve unrelated dirty workflow files.

Status: docs/manifest control note complete; Qwen GGUF acquisition remains
pending.

## Open Branch Decisions

- Whether the first live smoke should pull Qwen3-Coder 30B-A3B immediately or
  use the installed Llama 3.3 70B control to prove Docker before model download.
- Whether the wrapper should eventually expose vLLM/SGLang once Docker llama.cpp
  has a measured baseline.
- Whether to graduate telemetry to default-on after local privacy review.
