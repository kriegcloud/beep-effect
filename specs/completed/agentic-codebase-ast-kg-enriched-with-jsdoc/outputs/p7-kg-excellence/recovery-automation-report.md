# P7-T5 Graphiti Recovery Automation Report

## Objective
Operationalize repeatable recovery through `scripts/graphiti-recover.sh` with smoke verifications and dry-run checks.

## Automation Surface
Recovery script:
- `scripts/graphiti-recover.sh`

Key supported modes:
- `--dry-run`
- `--republish` / `--skip-republish`
- `--patch-mcp-path` / `--skip-mcp-patch`
- `--group <id>` for verification target

Repo integration:
- Package script: `kg:graphiti-recover:dry-run`
- Operations documentation includes recovery command sequence in `outputs/p6-dual-write-parity/rollout-and-operations-runbook.md`

## Smoke and Dry-Run Evidence
- Direct script dry run: `outputs/p7-kg-excellence/evidence/20260228T105936Z-graphiti-recover-dry-run.txt`
- Package-script dry run: `outputs/p7-kg-excellence/evidence/20260228T105936Z-graphiti-recover-script-dry-run.txt`
- Metadata: `outputs/p7-kg-excellence/evidence/20260228T105936Z-graphiti-recover.meta.txt`

Observed dry-run proof points:
- Planned restart targets are enumerated.
- Planned MCP endpoint/group are printed.
- No side effects are executed in dry-run mode.

## Acceptance Check
- Recovery automation integrated into operations docs: **PASS**
- Local/CI dry-run check path available and evidenced: **PASS**

