# Docgen Local Worker Eval Spec

## Objective

Create a local, Docker-first command for running Documentation Quality worker
eval packets on this workstation's two Radeon AI PRO R9700 GPUs.

The command must preserve the existing worker-eval contract: deterministic
`beep docgen quality --score codex` reports select remediation packets, the
worker produces advisory read-only output, and source files are never modified.

## Command Surface

```sh
bun run beep docgen quality-worker-eval-local \
  --input quality.json \
  --model qwen3-coder-30b-a3b \
  --model-path /home/elpresidank/ai/models/<model>.gguf \
  --confirm-local-gpu-eval
```

Supported sources:

- `--input <quality-report.json>`
- `--package <workspace package>`
- `--all`

Exactly one source must be supplied.

Required local flags:

- `--model`: explicit model id passed to the Codex SDK worker path.
- `--model-path`: host GGUF path mounted read-only into the container.
- `--confirm-local-gpu-eval`: acknowledgment that local GPUs, VRAM, thermals,
  and power will be used.

Default local flags:

- `--host 127.0.0.1`
- `--port 18080`
- `--container-port 8080`
- `--docker-image rocm/llama.cpp:llama.cpp-b6652.amd0_rocm7.0.0_ubuntu24.04_server`
- `--ctx-size 40960`
- `--parallel 1`
- `--gpu-layers all`
- `--split-mode layer`
- `--readiness-timeout-ms 1800000`
- `--packet-timeout-ms 600000`
- `--packet-limit 10`

Optional flags:

- `--keep-server`: leave the container running for debug.
- `--container-name <name>`: deterministic debug name override.
- `--tensor-split <ratio>`: pass a llama.cpp tensor/layer split ratio.
- `--otlp`, `--otlp-base-url`, `--otlp-project`: sanitized optional telemetry.

## Runtime Contract

The local wrapper must:

1. Validate the source, explicit model, explicit model path, port, context,
   parallelism, split mode, and confirmation flag before Docker launch.
2. Verify that the model path exists before running Docker.
3. Start a detached Docker container with ROCm GPU device access and a
   read-only model mount.
4. Bind the server to localhost.
5. Wait for OpenAI-compatible readiness at `/v1/models`.
6. Route the existing worker eval through the local `/v1` base URL.
7. Apply a conservative per-packet context preflight before any model call:
   estimate prompt tokens as `ceil(prompt.length / 3)`, compare against 70% of
   `--ctx-size`, and report oversized packets as `skipped-context`.
8. Stop and remove the container by default.
9. Emit wrapper JSON containing sanitized runtime, Docker args hash, model path
   hash, cleanup status, and the nested worker report.

The wrapper must not:

- edit source files,
- pick a hidden model default,
- write raw model prompts/responses outside the nested worker report contract,
- require a Runpod API key,
- use the existing Ollama port by default,
- clean up unrelated Docker containers.

## Model Selection

P0 owns the model decision. The starting recommendation is:

1. Qwen3-Coder 30B-A3B GGUF as the first coding-worker candidate.
   Production proof tries `UD-Q6_K_XL` first and falls back to `UD-Q4_K_XL`
   only if live Docker/ROCm proof rejects Q6.
2. Qwen3-Next 80B-A3B GGUF as the stretch candidate once local orchestration is
   stable.
3. Llama 3.3 70B GGUF as an installed non-coder control.

## Acceptance Criteria

- The goal packet exists and includes a research artifact.
- `quality-worker-eval-local` appears under `beep docgen`.
- Unit tests cover Docker argument construction and explicit-confirmation
  failure without launching Docker.
- The command can produce a sanitized wrapper JSON report when a live model is
  supplied.
- Production proof includes one Qwen-backed smoke plus a strict 10-packet
  sample where all selected packets complete with valid worker JSON.
- `/home/elpresidank/ai` model docs/manifests identify local artifacts used by
  the command.

## Non-Goals

- Write-mode auto-remediation.
- Replacing the existing generic `quality-worker-eval` command.
- A permanent llama.cpp host service.
- A new provider driver package before the local command proves it needs one.
- Runpod removal.
