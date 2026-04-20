Read `handoffs/HANDOFF_P4.md`, `PLANNING.md`, `EXECUTION.md`, `outputs/parity-matrix.md`, `outputs/steering-eval-corpus.md`, `package.json`, `turbo.json`, and `.github/workflows/check.yml`. Own the P4 verification wave and write or refine `VERIFICATION.md`.

You must verify:

- parity evidence exists for the current Effect-specific governance surface
- performance evidence exists relative to the previous lane
- steering evidence exists on the locked evaluation corpus
- the final recommendation is one of `full replacement`, `staged cutover`, or `no-go yet`
- implementation gaps are routed back to P3 instead of being hidden inside the verdict

Before ending the phase, update `VERIFICATION.md`, any verification trackers touched in this phase, and `outputs/manifest.json` so the verdict and routing are explicit.
