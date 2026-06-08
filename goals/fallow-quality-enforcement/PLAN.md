# Fallow Quality Enforcement Plan

## P0 - Research And Packet Calibration

- Validate this packet with `bun goals/fallow-quality-enforcement/ops/validate-packet.ts`.
- Produce one report per feature family using `research/report-template.md`.
- Measure every row in `research/feature-matrix.jsonc`.
- Measure every row in `research/knip-parity.jsonc`.
- Keep Fallow advisory. Do not add blocking gates in P0.
- Record critic rounds and closure notes under `history/`.

## P1 - Repo-Cli Advisory Integration

- Add `beep quality fallow ...` with the exact command contract in `SPEC.md`.
- Keep `beep fallow boundaries` only as a compatibility alias if needed.
- Implement schema-first Fallow envelope and report models.
- Decode Fallow JSON through `S.decodeUnknownEffect`.
- Add parser fixtures for each implemented feature family.
- Keep P1 report-only and outside `quality github-checks pre-push`.

## P2 - Generated Policy And CI Artifacts

- Expand generated boundary config from package metadata while classifying each
  boundary rule source.
- Add tracked suppression inventory and validator checks.
- Ensure CI always uploads a success or failure envelope.
- Keep SARIF out of code scanning until the P0 matrix marks it safe.

## P3 - Blocking Promotion

- Add an explicit advisory Yeet feedback step that normalizes Fallow findings into
  `QualityIssue` packets with `blocking: false`.
- Promote individual feature rows only when validator invariants and matrix
  promotion gates pass.
- Wire promoted lanes through `quality github-checks pre-push`.
- Prove Yeet verify, Yeet publish, and `audit:github pre-push` remain
  equivalent.
- Revisit Knip only through `research/knip-parity.jsonc`.

## Stop Conditions

Stop and report before:

- removing Knip
- running non-dry-run `fallow fix`
- making runtime coverage blocking
- adding architecture meaning outside canonical architecture docs
- promoting a rule with unresolved false positives or doctrine gaps
