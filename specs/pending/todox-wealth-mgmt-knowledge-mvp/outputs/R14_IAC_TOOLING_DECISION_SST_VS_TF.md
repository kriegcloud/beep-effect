# IaC Tool Decision: SST vs Terraform/Pulumi (TodoX Wealth Mgmt Knowledge MVP)

Date: 2026-02-09

## Executive summary

Decision: Use Terraform as the primary IaC tool for this repo and MVP, with a narrow allowance for Pulumi only if TypeScript-first infra becomes a hard requirement. Do not adopt SST for this repo at this stage.

Reasoning, tied to current repo patterns:
- The repo already includes a working Terraform baseline for GCP Cloud Run in `.repos/effect-ontology/infra` (Cloud Run, Secret Manager, VPC connector). Reusing that pattern reduces risk and aligns with the existing production plan for Cloud Run.
- The current ops plan assumes GCP Cloud Run with Secret Manager and Cloud Run Jobs for migrations. SST is optimized for AWS serverless workflows and does not align cleanly with the Cloud Run assumption.
- Provider neutrality matters because the env schema expects AWS S3 credentials while the runtime target is GCP Cloud Run. Terraform (and Pulumi) can model a multi-provider GCP + AWS topology; SST is not a neutral fit.

## Inputs from the repo (hard constraints)

- Local dev services are defined via Docker Compose: Postgres (pgvector), Redis, Grafana OTLP. Source: `docker-compose.yml`.
- Env schema is centralized in `@beep/shared-env` and requires strict, validated configuration on startup, including Redis password, OTLP endpoints, and AWS S3 credentials. Source: `packages/shared/env/README.md` and `.env.example`.
- Existing IaC reference is Terraform on GCP Cloud Run, Secret Manager, and VPC connector. Source: `.repos/effect-ontology/infra/*`.
- The current MVP ops plan is already Cloud Run-centric with Secret Manager and a Cloud Run Job for migrations. Source: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R5_IAC_OPS_PRODUCTION_PLAN.md`.

## Key evaluation criteria

- Provider fit and neutrality (GCP Cloud Run now, AWS S3 dependencies in env schema).
- Type safety and developer experience (TypeScript infra vs HCL).
- CI/CD integration and reproducibility (current repo uses GitHub Actions, but no infra pipeline yet).
- Secret management: creation, access, rotation; alignment with `@beep/shared-env` strict validation.
- Migration jobs: ability to create and run a Cloud Run Job (or equivalent) as a pre-deploy step.

## Option analysis

### Option A: SST

Fit summary:
- Strength: TypeScript-first experience and fast iteration when the platform is AWS serverless.
- Weakness: Repo and ops plan are GCP Cloud Run based; SST is not a natural match for Cloud Run, VPC connector patterns, or Secret Manager workflows as currently modeled.

Implications for this repo:
- Cloud Run and Secret Manager are first-class in the existing Terraform reference, not in SST. That gap would force custom provisioning outside SST or add a parallel Terraform layer, which defeats the point of consolidation.
- Provider neutrality is weak. The repo already expects AWS S3 credentials and GCP runtime. SST would bias the infrastructure toward AWS, diverging from the current plan.
- Cloud Run Jobs for migrations are a hard requirement in the ops plan; SST does not map cleanly to that requirement in a GCP-first posture.

Conclusion:
- SST is a mismatch for the current Cloud Run assumption and multi-provider footprint. Using it would add tooling divergence and higher operational risk.

### Option B: Terraform (baseline)

Fit summary:
- Strength: Matches existing repo reference (`.repos/effect-ontology/infra`) and current ops plan (Cloud Run + Secret Manager + VPC connector).
- Strength: Provider-neutral and supports multi-provider topologies (GCP + AWS) with consistent state management.
- Weakness: HCL is less ergonomic than TypeScript for application developers.

Implications for this repo:
- Secret Manager and Cloud Run integration are already demonstrated in the reference modules, including Secret Manager IAM bindings for Cloud Run.
- Multi-provider configuration can cover GCP infrastructure while still managing AWS S3 (if kept) in the same IaC boundary.
- Cloud Run Jobs for migrations can be modeled in Terraform and integrated into deploy workflows.

Conclusion:
- Terraform is the lowest-risk option with the least rework and highest alignment to existing patterns.

### Option C: Pulumi (TypeScript)

Fit summary:
- Strength: TypeScript IaC with good GCP and AWS coverage; allows code reuse and type safety.
- Weakness: Introduces a runtime and SDK overhead, and does not reuse the existing Terraform reference directly.

Implications for this repo:
- If the team requires TypeScript for infra code, Pulumi is a plausible path without changing the Cloud Run plan.
- Rewriting the existing Terraform modules would be required, which is work the repo does not currently justify.
- CI/CD would need Pulumi backend/state decisions (S3, GCS, or Pulumi Cloud). This is not currently set up in repo workflows.

Conclusion:
- Pulumi is viable only if TypeScript-first infra becomes non-negotiable and the team is willing to pay the rewrite + state tooling costs.

## Decision rationale

- The repo already has a Terraform blueprint aligned with the Cloud Run assumption and Secret Manager integration. Reuse that path.
- The env schema (`@beep/shared-env`) expects strict config validation and non-empty secrets, which maps directly to Terraform-managed Secret Manager injection.
- SST is AWS-centric and would shift the architecture away from Cloud Run, conflicting with the current ops plan.

## Proposed implementation notes (Terraform path)

- Base the new infra on `.repos/effect-ontology/infra` modules and align naming to the TodoX services.
- Add a Cloud Run Job for migrations that runs `bun run db:migrate` with `DB_PG_URL` injected from Secret Manager.
- Model Secret Manager entries for all required values from `@beep/shared-env` (DB, Redis, Better Auth, OTLP, AI keys, etc.).
- If AWS S3 remains required, use a multi-provider Terraform setup (GCP + AWS) and keep S3 configuration in Terraform state.
- Add a GitHub Actions workflow for infra plan/apply and deployment (separate from repo-law) with environment-specific approvals.

## Risks and open questions

- Cloud provider is assumed to be GCP Cloud Run. If this changes, the recommendation should be revisited.
- Storage provider is currently AWS S3 in the env schema. If the target is fully GCP, either add GCS support to the app or keep AWS S3 and accept multi-provider IaC.
- There is no existing CI/CD pipeline for infra or deploys in this repo; this will need to be introduced regardless of tool choice.

## Final recommendation

Use Terraform for MVP and production IaC. Defer SST. Consider Pulumi only if TypeScript-first infra is a firm requirement and the team is willing to rewrite the existing Terraform reference into Pulumi with new state management.
