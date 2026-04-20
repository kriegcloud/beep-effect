# Phase Delegation Prompts

Use these as fill-in templates for bounded workers. Always include the current phase artifact plus the relevant trackers.

## Common Rules

- read the package manifest first
- do not expand scope beyond the assigned question
- if you find a contradiction, stop and report it
- return output using `prompts/SUBAGENT_OUTPUT_CONTRACT.md`

## P0 Worker Template

Question:

- inventory one bucket of the remaining legacy surface

Required reads:

- `specs/completed/effect-governance-legacy-retirement/outputs/manifest.json`
- `specs/completed/effect-governance-legacy-retirement/README.md`
- `specs/completed/effect-governance-legacy-retirement/RESEARCH.md`
- `specs/completed/effect-governance-legacy-retirement/outputs/legacy-surface-inventory.md`
- the bucket-specific live repo files you are assigned

Expected output:

- missing inventory entries
- corrections to current entries
- remove or retain hypotheses for the assigned bucket only

## P1 Worker Template

Question:

- validate one proposed remove, split, rewrite, or retain call

Required reads:

- `specs/completed/effect-governance-legacy-retirement/VALIDATED_OPTIONS.md`
- `specs/completed/effect-governance-legacy-retirement/outputs/legacy-surface-inventory.md`
- `specs/completed/effect-governance-legacy-retirement/outputs/removal-matrix.md`
- the specific live repo files needed for the assigned call

Expected output:

- yes or no validation for the assigned call
- blockers, contradictions, or missing dependencies

## P2 Worker Template

Question:

- analyze one implementation path or one rollback posture

Required reads:

- `specs/completed/effect-governance-legacy-retirement/PLANNING.md`
- `specs/completed/effect-governance-legacy-retirement/outputs/removal-matrix.md`
- `specs/completed/effect-governance-legacy-retirement/outputs/dependency-cut-map.md`
- the specific command or package surfaces involved

Expected output:

- concrete sequencing advice
- concrete rollback considerations

## P3 Worker Template

Question:

- implement one disjoint slice of the chosen retirement plan

Required reads:

- `specs/completed/effect-governance-legacy-retirement/EXECUTION.md`
- `specs/completed/effect-governance-legacy-retirement/PLANNING.md`
- the files you own for this slice

Expected output:

- changed files
- commands run
- remaining risk in your slice

## P4 Worker Template

Question:

- verify one evidence bucket for the chosen retirement path

Required reads:

- `specs/completed/effect-governance-legacy-retirement/VERIFICATION.md`
- `specs/completed/effect-governance-legacy-retirement/EXECUTION.md`
- `specs/completed/effect-governance-legacy-retirement/outputs/legacy-surface-inventory.md`
- `specs/completed/effect-governance-legacy-retirement/outputs/removal-matrix.md`

Expected output:

- pass or fail call for the assigned bucket
- concrete residual risks
