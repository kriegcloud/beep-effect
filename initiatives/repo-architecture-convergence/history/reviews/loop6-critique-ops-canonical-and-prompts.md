# Loop 6 Critique - Ops Canonical And Prompts

## Scope

Adversarial review of the initiative-local ops control plane only:
`ops/README.md`, `ops/manifest.json`, `ops/prompt-assets/**`,
`ops/prompts/**`, and `ops/handoffs/**`.

## Methodology

Compared the shared ops contract (`ops/README.md`, `ops/manifest.json`,
`ops/prompt-assets/**`, `ops/prompts/agent-prompts.md`) against the
cross-phase and per-phase handoffs/prompts, with focus on startup reads,
blocker taxonomy coverage, gate/search-audit rules, prompt-asset loading, path
resolution, and phase execution closure rules.

## Findings

### Medium - P7 still breaks the "full worker-read inputs" claim with wildcard and directory-level inputs

Affected files: `ops/manifest.json:1456-1480`, `ops/handoffs/HANDOFF_P7.md:36-42`

Why it matters: the manifest now positions phase inputs as explicit,
machine-readable startup requirements, but `P7` still uses the glob
`history/outputs/*` while the handoff says only "all prior phase outputs under
history/outputs/". That weakens the packet back into directory-level inference
for the most sensitive verification phase, so workers and tooling cannot tell
exactly which prior outputs are mandatory reads.

Remediation: replace the wildcard and directory shorthand with the exact prior
output files `P7` must read, or add a clearly documented field that expands the
bundle deterministically.

### Medium - Missing worker-read acknowledgment is a declared closure blocker but still has no taxonomy id

Affected files: `ops/handoffs/HANDOFF_P0-P7.md:25-29`,
`ops/prompt-assets/blocker-protocol.md:3-17`,
`ops/prompt-assets/verification-checks.md:20-24`,
`ops/manifest.json:316-335`

Why it matters: the cross-phase rules say a missing worker-read acknowledgment
blocks closure, and the verification asset makes that proof mandatory, but the
blocker taxonomy and manifest expose no corresponding id. That leaves no
taxonomy-backed way to record the failure in the review loop or manifest even
though the packet says to use taxonomy ids.

Remediation: add a dedicated blocker id such as
`worker-read-acknowledgment-missing`, or explicitly map that condition onto an
existing taxonomy id everywhere the closure rule is stated.

### Medium - P6 and P7 require consumer/importer audit proof but omit the dedicated consumer/importer blocker

Affected files: `ops/handoffs/HANDOFF_P0-P7.md:25-29`,
`ops/handoffs/HANDOFF_P6.md:79-100`,
`ops/handoffs/HANDOFF_P7.md:77-99`,
`ops/manifest.json:1389-1408`, `ops/manifest.json:1532-1549`

Why it matters: the shared cross-phase rules say `unowned-consumer-importer`
blocks closure, and both `P6` and `P7` still require the
`consumer-importer-counts` audit family. But those phases omit
`unowned-consumer-importer` from both the handoff blocking conditions and the
manifest `blockerIds`, so their phase-local blocker surfaces cannot represent a
failure mode that the shared packet still treats as blocking.

Remediation: add `unowned-consumer-importer` to `P6` and `P7` blocker lists in
both the handoffs and manifest, or explicitly scope the shared cross-phase rule
so it no longer applies to those phases.
