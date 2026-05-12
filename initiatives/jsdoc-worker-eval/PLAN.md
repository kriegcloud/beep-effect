# JSDoc Worker Eval Plan

## Current Plan

The structural worker eval lane is implemented as `beep docgen
quality-worker-eval`. The first local-provider run is complete as a negative
host-suitability result:
`qwen3-coder:30b` runs CPU-only on this RTX 3070 8 GiB workstation and is not a
practical interactive worker target.

The hosted proof completed a three-packet Codex baseline using
`gpt-5.4-mini` with low reasoning.

## Phase Posture

| Phase | Status | Purpose | Output |
|---|---|---|---|
| P0 | Complete | Bootstrap initiative packet. | `README.md`, `SPEC.md`, `PLAN.md`, `research/`, `history/outputs/`, `ops/manifest.json` |
| P1 | Complete | Verify Codex SDK and provider command feasibility. | `quality-worker-eval` supports `codex`, `ollama`, and `lmstudio` provider selection |
| P2 | Complete | Define and implement read-only eval report shape and command plan. | Schema-versioned JSON eval report |
| P3 | Complete | Run provider-backed worker sample. | `qwen3-coder:30b` host evidence and aborted eval notes |
| P4 | Complete | Decide graduation posture. | Keep workers read-only and experimental |
| P5 | Complete | Run hosted Codex low-reasoning baseline. | Three-packet `gpt-5.4-mini` JSON report and research note |

## Implementation Direction

- Keep implementation in `@beep/repo-cli` under `beep docgen`.
- Keep deterministic `beep docgen quality` as the authoritative queue.
- Use `@openai/codex-sdk`; do not add direct provider HTTP clients.
- Require explicit `--provider` and `--model`.
- Default hosted Codex reasoning effort to `low`; do not default the provider.
- Emit JSON artifacts only.
- Run packet turns sequentially and keep them read-only.
- Do not use `qwen3-coder:30b` as the default local eval model on this host.

## Provider-Backed Evidence Commands

The source report used for the attempted run:

```sh
bun run beep docgen quality --all --json --score codex --packet-limit 50 --output /tmp/beep-jsdoc-quality-all-2026-05-12.json
```

The attempted local-provider eval used the pre-genericized command name:

```sh
bun run beep docgen quality-local-eval --input /tmp/beep-jsdoc-quality-all-2026-05-12.json --provider ollama --model qwen3-coder:30b --packet-limit 10 --output initiatives/jsdoc-local-worker-eval/history/outputs/2026-05-12-ollama-qwen3-coder-30b-local-eval.json
```

The eval was stopped after the local model caused interactive slowdown. No
`quality-worker-eval` JSON report was produced. The retained evidence is the
curated research note plus host evidence JSON.

The hosted baseline command:

```sh
bun run beep docgen quality-worker-eval --all --provider codex --model gpt-5.4-mini --reasoning-effort low --packet-limit 3 --output initiatives/jsdoc-worker-eval/history/outputs/2026-05-12-codex-gpt-5.4-mini-low-worker-eval.json
```

The hosted baseline completed three selected packets as candidate drafts with
zero reported policy violations in about 27.3 seconds.

## Follow-Up Recommendation

Keep worker eval read-only. Runpod is still the preferred next host for
retrying `qwen3-coder:30b`; target at least 24 GiB VRAM, with 48 GiB
preferred. Auto-remediation remains out of scope until larger samples satisfy
completion, quality, and policy-preservation thresholds.

## Verification Commands

- `bun run --filter @beep/repo-cli test`
- `bun run --filter @beep/repo-cli check`
- `bun run --filter @beep/repo-cli lint`
- `git diff --check`

Provider installation itself is not required for ordinary repo quality checks.
