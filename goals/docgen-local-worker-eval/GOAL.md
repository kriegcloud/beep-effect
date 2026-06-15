# Goal: Docgen Local Worker Eval

Set up the Documentation Quality worker eval so it can run locally on this
dual-GPU workstation instead of requiring Runpod.

Authoritative docs:

- `goals/docgen-local-worker-eval/SPEC.md`
- `goals/docgen-local-worker-eval/PLAN.md`
- `goals/docgen-local-worker-eval/research/2026-06-15-local-coder-model-selection.md`
- `packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerEval.ts`
- `packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerRunpodEval.ts`
- `/home/elpresidank/ai/docs/workstation/AI_WORKSTATION_SPECS.md`
- `/home/elpresidank/ai/docs/runtime/llama-cpp.md`

Implementation requirements:

1. Work on branch `codex/docgen-local-worker-eval`.
2. Keep the command under `@beep/repo-cli` / `beep docgen`.
3. Add `beep docgen quality-worker-eval-local`.
4. Launch a Docker-backed ROCm llama.cpp server on localhost by default.
5. Require explicit `--model`, `--model-path`, and `--confirm-local-gpu-eval`.
6. Use `127.0.0.1:18080` by default and avoid Ollama's `11434`.
7. Default to `--split-mode layer`, `--gpu-layers all`, `--ctx-size 40960`,
   and sequential packet eval.
8. Delegate packet turns to the existing read-only worker eval command logic.
9. Stop/remove the Docker container after the eval unless `--keep-server` is
   passed.
10. Emit sanitized schema-versioned wrapper JSON; do not keep raw unbounded logs.
11. Keep normal tests fakeable; no live GPU/Docker proof in ordinary checks.
12. Treat P0 model selection as evidence, not assumption.

P0 recommendation:

- First local candidate: Qwen3-Coder 30B-A3B GGUF.
- Stretch candidate: Qwen3-Next 80B-A3B GGUF after the wrapper is stable.
- Existing local control: Llama 3.3 70B GGUF, non-coder comparison only.

Verification:

- `bun run --filter @beep/repo-cli test -- docgen`
- `bun run --filter @beep/repo-cli check`
- `bun run --filter @beep/repo-cli lint`
- `jq . goals/docgen-local-worker-eval/ops/manifest.json`
- `test "$(wc -m < goals/docgen-local-worker-eval/GOAL.md)" -le 4000`
- live GPU smoke is explicit/manual because it uses local GPU resources.

Stop conditions:

- Docker/ROCm cannot see the GPUs after non-destructive preflight.
- The selected model cannot fit or produces unstable output under layer split.
- Implementing the path would require source edits or write-mode remediation.
- A live proof would disturb unrelated running GPU jobs without operator consent.

