# Friction receipts

| Task | Evidence | Prevention |
| --- | --- | --- |
| Run package-local quick verification in the new checkout. | `bun run beep quality package-verify @beep/repo-cli --quick` ran lint and check without building upstream declarations; check emitted TS6305 for missing workspace `dist/*.d.ts`. The full package audit uses an upstream build closure. | State that `--quick` assumes an already built workspace, or make it build upstream dependencies before check. |
| Run Yeet cheap gates for the security fix. | `observability:catalog-check` reported stale catalog and architecture projection. Regeneration added 47 tooling spans; only the new HunkLedger spans belong to this fix, while the rest were already present in `origin/main` source. | Update generated observability files in the PR that adds named Effect spans, so dependent security lanes do not inherit stale catalog reds. |
