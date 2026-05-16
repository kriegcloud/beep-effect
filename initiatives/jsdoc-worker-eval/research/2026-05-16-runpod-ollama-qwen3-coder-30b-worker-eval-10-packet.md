# Runpod Ollama Qwen3-Coder 30B 10-Packet Worker Eval

## Status

Larger-sample read-only evidence complete; auto-remediation still blocked.

## Purpose

Close the remaining `jsdoc-worker-eval` evidence gap by running the already
implemented Runpod/Codex SDK worker path on a reproducible 10-packet sample.
This run does not edit source files and does not make worker judgment the source
of truth.

## Source Quality Report

Command:

```sh
bun run beep docgen quality --all --json --score codex --packet-limit 25 --output initiatives/jsdoc-worker-eval/history/outputs/2026-05-16-source-quality-codex-packets-10-packet.json
```

Summary:

- Packages: 79
- Quality subjects: 6776
- Passing reviews: 2453
- Warning reviews: 1728
- Failure reviews: 2595
- Remediation packets: 25

## Eval Command

```sh
RUNPOD_API_KEY="$(op read 'op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_RUNPOD_API_KEY')" \
  bun run beep docgen quality-worker-eval-runpod \
    --input initiatives/jsdoc-worker-eval/history/outputs/2026-05-16-source-quality-codex-packets-10-packet.json \
    --provider ollama \
    --model qwen3-coder:30b \
    --packet-limit 10 \
    --otlp \
    --otlp-base-url https://dankserver.tailc7c348.ts.net:8447 \
    --otlp-project beep-jsdoc-worker-eval \
    --confirm-runpod-eval \
    --skip-template-search \
    --readiness-timeout-ms 2700000 \
    --output initiatives/jsdoc-worker-eval/history/outputs/2026-05-16-runpod-ollama-qwen3-coder-30b-worker-eval-10-packet.json
```

Runpod strategy:

- Provider: Ollama through the Codex SDK.
- Model: `qwen3-coder:30b`.
- Template strategy: fallback image.
- Image: `runpod/pytorch:2.8.0-py3.11-cuda12.8.1-cudnn-devel-ubuntu22.04`.
- GPU policy: 48 GiB minimum; no 24 GiB fallback.
- Template search: skipped.
- Cleanup: stop and delete by default.

## Outcome

- Selected packets: 10
- Completed packets: 10
- Candidate drafts: 10
- Failed packets: 0
- Timed-out packets: 0
- Needs human review: 0
- Rejected packets: 0
- Policy violations: `missing-example`
- Phoenix export: 11 spans to project `beep-jsdoc-worker-eval`
- Cleanup: stop completed, delete completed
- Cleanup verification: `runpodctl pod get 7vwucsmu2832q8` returned 404
  `pod not found`
- Total wrapper runtime: 463598 ms
- Worker duration: 460488 ms
- Provision duration: 1699 ms
- Cleanup duration: 1332 ms

The selected packets covered `@beep/openai`, `@beep/nlp`, `@beep/identity`,
and `@beep/schema`.

## Interpretation

The larger sample proves the remote Qwen worker path can process a 10-packet
queue, export sanitized Phoenix spans, and clean up the ephemeral pod. It also
shows that worker output still needs policy review: two candidate drafts
reported duplicate `missing-example` policy codes, and the aggregate worker
policy violation set contains `missing-example`.

This is sufficient to close the read-only worker-eval evidence gap. It is not
sufficient to allow automatic source edits.

## Recommendation

Keep `jsdoc-worker-eval` as a reference packet and keep worker runs advisory.
Future work should be planned separately:

- prebuilt Runpod image or persistent model cache if repeated remote Qwen evals
  need lower latency or lower cost
- human review/eval rubric for candidate draft acceptance
- write-mode remediation only after explicit precision, cost, runtime, and
  policy-preservation thresholds are defined
