# Local Coder Model Selection Research

Date: 2026-06-15

## Decision

Use Docker-backed ROCm llama.cpp as the first local runtime and make
Qwen3-Coder 30B-A3B GGUF the first coding-worker candidate. Try a Q6-class GGUF
first for documentation quality and fall back to Q4-class only if the live
Docker/ROCm proof rejects Q6 on this workstation.

Keep Qwen3-Next 80B-A3B GGUF as the stretch candidate after the local wrapper
proves it can launch, probe, delegate worker packets, and clean up reliably.
Keep the already-installed Llama 3.3 70B GGUF as a non-coder control, not the
first coding-worker target.

## Local Hardware Facts

The `/home/elpresidank/ai` workstation docs and live snapshot identify two
Radeon AI PRO R9700 GPUs with 32 GiB VRAM each. This makes dual-GPU placement a
first-class requirement. The live host already uses Ollama on port `11434`, so
the docgen local worker wrapper should bind llama.cpp on `127.0.0.1:18080`.

## Runtime Research

AMD's ROCm llama.cpp documentation recommends Docker as the setup path and
publishes ROCm-enabled `rocm/llama.cpp` images, including server images. The
same documentation shows the container shape needed for ROCm GPU access:
`/dev/kfd`, `/dev/dri`, `video` group, `SYS_PTRACE`, `seccomp=unconfined`,
`ipc=host`, and a mounted model directory.

Source: [AMD ROCm llama.cpp installation](https://rocm.docs.amd.com/projects/llama-cpp/en/docs-26.02/install/llama-cpp-install.html)

llama.cpp's multi-GPU documentation says multi-GPU is appropriate when the model
does not fit in one GPU's VRAM or when throughput can improve. It identifies
`layer` as the default and most compatible split mode, marks `row` deprecated,
and marks `tensor` experimental with architecture/backend caveats. For this
packet, default to `--split-mode layer` and expose `--tensor-split` only as an
advanced override.

Source: [llama.cpp multi-GPU documentation](https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md)

## Model Shortlist

### P0 Winner: Qwen3-Coder 30B-A3B

Qwen's official model card describes Qwen3-Coder 30B-A3B-Instruct as a coding
model with 30.5B total parameters, 3.3B active parameters, 128 experts, eight
active experts, and native 262K context. It is explicitly oriented toward
agentic coding, browser-use, and repository-scale understanding.

Source: [Qwen/Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)

llama.cpp requires a GGUF artifact, so the production proof uses the public
Unsloth GGUF artifact family:

Source: [unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF](https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF/tree/main)

Why it is first:

- It is coding-specific.
- The active-parameter footprint is efficient for local inference.
- It is large enough to be meaningfully different from small local models.
- It should fit the workstation envelope with a GGUF quant before we attempt an
  80B total-parameter stretch path.

Recommended acquisition:

- Public GGUF quant in `/home/elpresidank/ai/models`.
- Prefer `Qwen3-Coder-30B-A3B-Instruct-UD-Q6_K_XL.gguf` for the first smoke and
  strict 10-packet sample.
- Fall back to `Qwen3-Coder-30B-A3B-Instruct-UD-Q4_K_XL.gguf` only if Q6 fails
  live memory, launch, or stability proof.
- Record the exact repo, file, sha256, and size in
  `/home/elpresidank/ai/manifests/model-assets.json`.

### Stretch: Qwen3-Next 80B-A3B

The official Qwen3-Next 80B-A3B GGUF card describes an 80B total / 3B active
MoE model with hybrid attention, high-sparsity MoE, and native 262K context
extendable beyond that. It reports strong long-context and benchmark results,
including coding benchmarks, while remaining much lower active-parameter cost
than dense 70B-class models.

Source: [Qwen/Qwen3-Next-80B-A3B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct-GGUF)

Why it is stretch:

- It is attractive for dual-GPU layer split.
- It is not specifically the first coding-worker proof target.
- Its hybrid/MoE architecture raises more llama.cpp split-mode compatibility
  risk, so it should follow a working local wrapper baseline.

### Fallback: Qwen2.5-Coder 32B

Qwen's Qwen2.5-Coder 32B model card describes a code-specific model family and
states the 32B model reached state-of-the-art open-source CodeLLM status at the
time of release, with strong code generation, reasoning, and fixing.

Source: [Qwen/Qwen2.5-Coder-32B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct-GGUF)

Why it is fallback:

- It is mature and code-specific.
- It is a less novel backup if Qwen3-Coder GGUF/tool-calling/runtime behavior is
  unstable.

### Control: Llama 3.3 70B Instruct

The local AI repo already has
`/home/elpresidank/ai/models/Llama-3.3-70B-Instruct-Q4_K_M.gguf`. This is useful
for proving that Docker, ROCm, model mounting, and dual-GPU layer split work on
a 70B-class artifact, but it should not be the first coding-worker target
because the objective is documentation-quality coding assistance.

## Chosen Defaults

- Docker image:
  `rocm/llama.cpp:llama.cpp-b6652.amd0_rocm7.0.0_ubuntu24.04_server`
- Host bind: `127.0.0.1`
- Host port: `18080`
- Container port: `8080`
- Context: `40960`
- Parallel requests: `1`
- GPU layers: `all`
- Split mode: `layer`
- Readiness endpoint: `/v1/models`
- Worker packet timeout: `600000ms`
- Context preflight: skip packets estimated above 70% of `--ctx-size`
- Cleanup: stop/remove unless `--keep-server`

## P0 Gate

P0 is complete for planning when:

- This research artifact exists.
- The CLI wrapper requires explicit model/model-path selection.
- The live smoke plan records how Qwen3-Coder 30B-A3B will be judged.

Until that smoke exists, Qwen3-Coder 30B-A3B is the recommended first candidate,
not a graduated default.
