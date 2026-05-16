# Runpod Ollama Qwen3-Coder 30B Worker Eval

## Status

Smoke proof complete; larger-sample evidence pending

## Purpose

Retest `qwen3-coder:30b` away from the local RTX 3070 workstation by using an
ephemeral Runpod GPU pod with Ollama and the Codex SDK. This is still a
read-only worker eval. It does not graduate auto-remediation.

## Larger-Sample Command

```sh
RUNPOD_API_KEY="$(op read 'op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_RUNPOD_API_KEY')" \
BEEP_OTLP_BASE_URL="${BEEP_OTLP_BASE_URL:?set BEEP_OTLP_BASE_URL}" \
  bun run beep docgen quality-worker-eval-runpod \
    --all \
    --provider ollama \
    --model qwen3-coder:30b \
    --packet-limit 10 \
    --otlp \
    --otlp-base-url "$BEEP_OTLP_BASE_URL" \
    --otlp-project beep-jsdoc-worker-eval \
    --confirm-runpod-eval \
    --output initiatives/jsdoc-worker-eval/history/outputs/2026-05-16-runpod-ollama-qwen3-coder-30b-worker-eval.json
```

## Secret Handling

The CLI reads only `RUNPOD_API_KEY`. It does not read 1Password references. The
operator shell resolves the existing reference:

```sh
op read 'op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_RUNPOD_API_KEY'
```

The Hugging Face token is not required for the v1 Ollama path. Keep
`op://BEEP_SECRETS/BEEP_SECRETS/AI_HUGGING_FACE_TOKEN` as a future fallback
only if a non-Ollama image path needs it.

## Runpod Behavior

- Search public and official Runpod templates for an Ollama-compatible template.
- Fall back to the official Runpod PyTorch image and bootstrap Ollama in
  `dockerStartCmd`.
- The fallback bootstrap rewrites `/etc/resolv.conf` to public resolvers before
  package and installer downloads, then waits for DNS.
- The fallback bootstrap installs `zstd` before running the Ollama installer.
- The fallback bootstrap pulls `qwen3-coder:30b` through Ollama's HTTP
  `/api/pull` endpoint and waits for `/api/tags` to advertise the model.
- Prefer 48 GiB GPUs.
- Allow 24 GiB fallback only with `--allow-24gb-fallback`.
- Expose Ollama on Runpod proxy port `11434/http`.
- Pass the Codex SDK `baseUrl` and `CODEX_OSS_BASE_URL` as the pod proxy
  OpenAI-compatible `/v1` URL.
- Stop and delete the pod by default.
- Preserve the pod only when `--keep-pod` is explicitly passed.

## Live Smoke Evidence

Successful smoke report:

```text
initiatives/jsdoc-worker-eval/history/outputs/2026-05-16-runpod-ollama-qwen3-coder-30b-worker-eval-smoke-v2.json
```

Command:

```sh
RUNPOD_API_KEY="$(op read 'op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_RUNPOD_API_KEY')" \
BEEP_OTLP_BASE_URL="${BEEP_OTLP_BASE_URL:?set BEEP_OTLP_BASE_URL}" \
  bun run beep docgen quality-worker-eval-runpod \
    --input <saved-source-quality-report.json> \
    --provider ollama \
    --model qwen3-coder:30b \
    --packet-limit 1 \
    --otlp \
    --otlp-base-url "$BEEP_OTLP_BASE_URL" \
    --otlp-project beep-jsdoc-worker-eval \
    --confirm-runpod-eval \
    --skip-template-search \
    --readiness-timeout-ms 2700000 \
    --output initiatives/jsdoc-worker-eval/history/outputs/2026-05-16-runpod-ollama-qwen3-coder-30b-worker-eval-smoke-v2.json
```

Outcome:

- Source report: saved local source-quality report
- Scope: saved input, repo-wide source packets
- Selected packets: 1
- Completed packets: 1
- Candidate drafts: 1
- Failed packets: 0
- Timed-out packets: 0
- Reported policy violations: 0
- Cleanup: stop completed, delete completed
- Phoenix OTLP: exported 2 spans to project `beep-jsdoc-worker-eval`
- Total runtime: about 16.6 minutes
- Main runtime cost: cold-pulling the 18.6 GB Ollama model into an ephemeral pod

The completed packet was from `@beep/nlp` and was marked `candidate`. This is
enough to prove the hosted Ollama/Codex SDK route can run and clean up, but not
enough to graduate auto-remediation.

## Troubleshooting Notes

- Public/template search may choose templates that do not expose the expected
  Ollama readiness path. Use `--skip-template-search` for the known fallback
  image path until a repo-owned template exists.
- Runpod fallback-image pods can start with DNS resolution failures for Ubuntu,
  NVIDIA, Launchpad, or `ollama.com`; the bootstrap now rewrites resolver config
  before package installation and the Ollama installer.
- Current Ollama installer archives require `zstd`; without it the installer
  fails after printing `ERROR: This version requires zstd for extraction`.
- Codex SDK routing to the Ollama pod requires the `/v1` suffix. Without it the
  worker calls `/responses` and receives 404 from the Runpod proxy/Ollama host.
- Cold pulls are expensive and slow for repeated evals. Before a larger sample,
  prefer a repo-owned Runpod template/image or persistent model cache.

## Phoenix Export

`--otlp` emits only sanitized spans:

- one summary span
- one packet span per selected worker packet
- hashed packet id, subject id, source quality report id, and package name
- no prompts
- no source anchors or local paths
- no draft JSDoc text
- no secrets

The Phoenix project is carried via the `openinference.project.name` resource
attribute. OTLP export failure is non-blocking and is recorded in the wrapper
JSON report.

## Evidence Required Before Graduation

The live proof should record:

- wrapper JSON under `history/outputs/`
- Runpod template/image strategy
- GPU type and minimum RAM policy
- cleanup stop/delete status
- packet completion/failure/timeout counts
- worker policy violation codes
- runtime and rough cost notes
- Phoenix export status when `--otlp` is enabled

Graduation remains blocked until a larger sample proves completion time, draft
quality, cost, and cleanup safety without policy regressions.
