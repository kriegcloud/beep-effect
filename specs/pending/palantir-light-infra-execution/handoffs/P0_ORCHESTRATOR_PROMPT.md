# P0 Orchestrator Prompt

Execute Phase P0 for `specs/pending/palantir-light-infra-execution`.

Requirements:
- Treat locked inputs in `README.md` as fixed.
- Produce only execution-readiness outcomes.
- Update and validate these files:
  - `outputs/p0-execution-readiness/prerequisites-and-gates.md`
  - `outputs/p0-execution-readiness/environment-and-secrets-matrix.md`
  - `outputs/p0-execution-readiness/ownership-and-raci.md`

Deliverable expectations:
- Explicit gate criteria for G0 and G1.
- Environment and secrets responsibilities per environment.
- RACI ownership and escalation path with named roles.

Verification before handoff:

```sh
rg -n "G0|G1|Owner|Exact Tasks|Exit Criteria" specs/pending/palantir-light-infra-execution/outputs/p0-execution-readiness
```
