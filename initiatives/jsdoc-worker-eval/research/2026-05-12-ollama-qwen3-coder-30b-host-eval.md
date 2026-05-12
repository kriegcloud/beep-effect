# Ollama Qwen3-Coder 30B Host Eval

## Summary

The first provider-backed worker run proved that Codex SDK orchestration
can reach a local Ollama provider and that `qwen3-coder:30b` can be pulled on
the workstation. It did not prove JSDoc draft quality.

The run was stopped because the model executed CPU-only on this host and caused
interactive slowdown. Workers should remain read-only and experimental.

## Host

- OS: Manjaro Linux
- CPU: Intel Core i7-9700K, 8 physical cores
- RAM: 62 GiB
- GPU: NVIDIA GeForce RTX 3070, 8 GiB VRAM
- Ollama server: 0.23.2 on `127.0.0.1:11434`
- Codex SDK: 0.130.0

## Model

- Provider: Ollama
- Model: `qwen3-coder:30b`
- Family: `qwen3moe`
- Parameters: 30.5B
- Quantization: Q4_K_M
- Loaded size: about 19 GB
- Observed VRAM use: `size_vram: 0`

## Source Quality Report

Command:

```sh
bun run beep docgen quality --all --json --score codex --packet-limit 50 --output /tmp/beep-jsdoc-quality-all-2026-05-12.json
```

Summary:

- Packages: 63
- Subjects: 6006
- Passing: 2185
- Warnings: 1721
- Failures: 2100
- Remediation packets: 50

The originally planned `@beep/types` and `@beep/utils` eval target was stale:
both packages were already clean and emitted zero remediation packets.

## Attempted Eval

Command:

```sh
bun run beep docgen quality-local-eval --input /tmp/beep-jsdoc-quality-all-2026-05-12.json --provider ollama --model qwen3-coder:30b --packet-limit 10 --output initiatives/jsdoc-local-worker-eval/history/outputs/2026-05-12-ollama-qwen3-coder-30b-local-eval.json
```

Observed behavior:

- Ollama loaded the model successfully.
- Ollama reported `size_vram: 0`.
- `nvidia-smi` did not show Ollama using the RTX 3070.
- The Ollama runner used roughly 490% CPU and 28.7% memory.
- The workstation slowed down during the run.
- The eval was stopped before a final `quality-local-eval` JSON report was
  produced.

This run used the pre-genericized command name before the initiative packet was
renamed from `jsdoc-local-worker-eval` to `jsdoc-worker-eval`.

## Recommendation

Do not graduate workers toward auto-remediation from this evidence.

For this workstation, prefer a smaller GPU-fit coder model. For the 30B target,
use a larger-VRAM remote host. Runpod is the recommended next environment
because this repo has already used Runpod for model workloads and the 30B model
needs more VRAM than the local RTX 3070 can comfortably provide.

Minimum future target: 24 GiB VRAM.

Preferred future target: 48 GiB VRAM.

Keep the command report-only until a provider-backed run completes with good
runtime, accepted draft quality, and zero hard JSDoc policy violations.
