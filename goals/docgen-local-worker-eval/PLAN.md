# Docgen Local Worker Eval Plan

## Phase Posture

| Phase | Status | Purpose | Output |
|---|---|---|---|
| P0 | Complete | Research and choose the first local coding model/runtime shape. | Research artifact plus model shortlist |
| P1 | Complete | Implement the local Docker wrapper command. | `quality-worker-eval-local` |
| P2 | In progress | Prove non-GPU checks. | Unit tests, typecheck, lint |
| P3 | Pending | Run explicit live local proof. | Smoke plus strict 10-packet JSON reports in `history/outputs/` |
| P4 | In progress | Update local AI model docs/manifests. | `/home/elpresidank/ai` docs/manifests; Qwen artifact acquisition pending |
| P5 | Pending | Close and recommend next model/sample size. | Packet closeout/reflection |

## P0 Research

- Confirm workstation facts from `/home/elpresidank/ai`.
- Review Qwen3-Coder 30B-A3B, Qwen3-Next 80B-A3B, Qwen2.5-Coder 32B, and
  installed Llama 3.3 70B.
- Record Docker/ROCm llama.cpp support and multi-GPU split-mode posture.
- Decide the first live candidate and fallback path.

Status: complete. Qwen3-Coder 30B-A3B GGUF is the first coding candidate. The
production proof targets Q6-class GGUF first and falls back to Q4-class only if
the workstation rejects Q6 during live Docker/ROCm proof.

## P1 Implementation

- Add `QualityWorkerLocalEval.ts` beside the existing worker eval modules.
- Add Docker run-argument builders exported for tests.
- Add schema-versioned local wrapper report classes.
- Add `--packet-timeout-ms 600000` as the local default.
- Add prompt-size/context preflight so over-budget packets become
  `skipped-context` results before any model call.
- Add local readiness probe for `/v1/models`.
- Preflight Docker and pull the pinned ROCm llama.cpp image when missing.
- Delegate to `analyzeDocgenQualityWorkerEval` with the local `/v1` base URL.
- Add the `quality-worker-eval-local` command to `Docgen.command.ts`.
- Re-export local internals from the docgen test kit.

Status: complete for the initial wrapper; production hardening is being
validated before closeout.

## P2 Verification

Run:

```sh
bun run --filter @beep/repo-cli test -- docgen
bun run --filter @beep/repo-cli check
bun run --filter @beep/repo-cli lint
jq . goals/docgen-local-worker-eval/ops/manifest.json
test "$(wc -m < goals/docgen-local-worker-eval/GOAL.md)" -le 4000
```

Status: in progress. `bun --filter @beep/repo-cli check` and
`bun --filter @beep/repo-cli test -- test/docgen.test.ts` passed after the
schema v2/context-budget changes.

## P3 Live Proof

Live proof is explicit because it uses local GPUs:

```sh
bun run beep docgen quality --all --json --score codex --packet-limit 1 \
  --output goals/docgen-local-worker-eval/history/outputs/source-quality-smoke.json

bun run beep docgen quality-worker-eval-local \
  --input goals/docgen-local-worker-eval/history/outputs/source-quality-smoke.json \
  --model qwen3-coder-30b-a3b-instruct-ud-q6-k-xl \
  --model-path /home/elpresidank/ai/models/Qwen3-Coder-30B-A3B-Instruct-UD-Q6_K_XL.gguf \
  --packet-limit 1 \
  --confirm-local-gpu-eval \
  --output goals/docgen-local-worker-eval/history/outputs/local-worker-smoke.json
```

Then run the strict production sample:

```sh
bun run beep docgen quality --all --json --score codex --packet-limit 10 \
  --output goals/docgen-local-worker-eval/history/outputs/source-quality-10.json

bun run beep docgen quality-worker-eval-local \
  --input goals/docgen-local-worker-eval/history/outputs/source-quality-10.json \
  --model qwen3-coder-30b-a3b-instruct-ud-q6-k-xl \
  --model-path /home/elpresidank/ai/models/Qwen3-Coder-30B-A3B-Instruct-UD-Q6_K_XL.gguf \
  --packet-limit 10 \
  --confirm-local-gpu-eval \
  --output goals/docgen-local-worker-eval/history/outputs/local-worker-qwen-10.json
```

Passing production proof requires `summary.completed === 10`,
`summary.failed === 0`, `summary.timedOut === 0`, and
`summary.skippedContext === 0` in the nested worker report.

## P4 AI Repo Sync

- Add acquired Qwen GGUF artifacts to `/home/elpresidank/ai/models`.
- Update `/home/elpresidank/ai/manifests/model-assets.json`.
- Update `/home/elpresidank/ai/docs/runtime/llama-cpp.md` or a scoped local
  docgen worker note with the command and model path.
- Preserve unrelated dirty workflow files.

Status: docs/manifest control note complete; Qwen GGUF acquisition remains
pending.

## Closed Branch Decisions

- Qwen-first proof; Llama 3.3 70B is diagnostic fallback only.
- CLI-local Docker runner for this PR; no driver package yet.
- Docker-only supported runtime; host llama.cpp remains manual diagnostics.
- OTLP remains opt-in.
- No documentation-quality source edits in this PR.
