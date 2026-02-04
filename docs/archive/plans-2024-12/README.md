# Archived Plans - December 2024

Historical implementation plans from December 2024, prior to MVP completion.

## Why Archived

These documents represent early exploration of Effect-native patterns and GCP deployment strategies. They contain valuable context about design decisions but have been superseded by current architecture.

## Contents

| File | Topic | Status |
|------|-------|--------|
| `2024-12-10-effect-exit-cause-handling-plan.md` | Exit/Cause handling patterns | Superseded by `effect-patterns-guide.md` |
| `2024-12-10-effect-native-cloud-run-migration.md` | Cloud Run migration v1 | Superseded by v3 |
| `2024-12-10-effect-native-cloud-run-migration-v2.md` | Cloud Run migration v2 | Superseded by v3 |
| `2024-12-10-effect-native-cloud-run-migration-v3.md` | Cloud Run migration v3 | Reference for infrastructure decisions |
| `2024-12-10-stateless-cloud-run-deployment.md` | Stateless deployment strategy | Implemented in current infra |
| `2024-12-10-terraform-infrastructure-design.md` | Terraform module design | Implemented in `infra/` |
| `2025-12-09-core-v2-production-readiness.md` | Production readiness checklist | Superseded by current docs |
| `2025-12-09-effect-ai-improvements.md` | @effect/ai integration patterns | Superseded by current LLM service |

## Current Documentation

For up-to-date information, see:

- **Architecture**: `packages/@core-v2/docs/architecture/system-architecture.md`
- **Effect Patterns**: `packages/@core-v2/docs/architecture/effect-patterns-guide.md`
- **LLM Control**: `packages/@core-v2/docs/LLM_CONTROL_INDEX.md`
- **Infrastructure**: `infra/README.md`

## Key Lessons Retained

1. **Effect.Exit handling**: Always match on Exit, not on raw values
2. **Layer composition**: Compose small bundles, provide once at entrypoint
3. **Cloud Run**: Stateless design with external persistence is preferred
4. **Terraform**: Module-per-resource pattern with clear dependency graphs
