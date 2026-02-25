# Source Citations

## Execution Metadata

- Freshness baseline: 2026-02-25 (UTC)
- Evidence scope: official vendor/standards sources + internal ontology artifacts
- Supplemental channel: Graphiti memory facts (`palantir-ontology`) used only with explicit confidence and corroboration status

## Citation Index

| Citation ID | Claim Summary | Source | Type | Confidence |
|---|---|---|---|---|
| CIT-001 | Provider scoring and rejection gates are deterministic and machine-checkable. | `/home/elpresidank/YeeBois/projects/beep-effect/specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/provider-evaluation-rubric.md` | internal primary | high |
| CIT-002 | Capability acceptance targets define measurable architecture outcomes and P2 links. | `/home/elpresidank/YeeBois/projects/beep-effect/specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/capability-requirements-matrix.md` | internal primary | high |
| CIT-003 | Source quality policy requires primary evidence for high-impact decisions. | `/home/elpresidank/YeeBois/projects/beep-effect/specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/source-map.md` | internal primary | high |
| CIT-004 | AWS-first, SOC2 path, split-stack IaC, and US-only sensitive-data residency are locked constraints. | `/home/elpresidank/YeeBois/projects/beep-effect/specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/assumptions-and-constraints.md` | internal primary | high |
| CIT-005 | Reverse-engineering ontology outputs are the primary blueprint input for Palantir-light design decisions. | `/home/elpresidank/YeeBois/projects/beep-effect/specs/completed/reverse-engineering-palantir-ontology/README.md` | internal primary | high |
| CIT-006 | Internal ontology research corpus includes security docs for purpose controls, markings, classification controls, and audit logs. | `/home/elpresidank/YeeBois/projects/beep-effect/specs/completed/reverse-engineering-palantir-ontology/outputs/p2-web-research/security.json` | internal primary | medium |
| CIT-007 | Internal ontology research corpus includes architecture/runtime sources for data connection and pipeline patterns. | `/home/elpresidank/YeeBois/projects/beep-effect/specs/completed/reverse-engineering-palantir-ontology/outputs/p2-web-research/architecture.json` | internal primary | medium |
| CIT-008 | Internal ontology research corpus includes AIP/agent/MCP sources for governed tool execution patterns. | `/home/elpresidank/YeeBois/projects/beep-effect/specs/completed/reverse-engineering-palantir-ontology/outputs/p2-web-research/ai-llm.json` | internal primary | medium |
| CIT-009 | Graphiti query results provide supplemental signals (for example egress policy governance and workflow patterns) in group `palantir-ontology`. | Graphiti MCP query run on 2026-02-25 (`search_memory_facts`, `search_nodes`) | supplemental | medium |
| CIT-010 | IAM policy evaluation enforces explicit-deny precedence across applicable policy types. | [AWS IAM policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) | external primary | high |
| CIT-011 | Service control policies provide organization-level permission guardrails. | [AWS Organizations SCPs](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html) | external primary | high |
| CIT-012 | Step Functions provides durable workflow orchestration for long-running state machines. | [AWS Step Functions developer guide](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html) | external primary | high |
| CIT-013 | Step Functions integrates with AWS services directly for workflow tasks and event-driven orchestration. | [Step Functions service integrations](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-service-integrations.html) | external primary | high |
| CIT-014 | API Gateway WebSocket APIs support bidirectional real-time messaging patterns. | [API Gateway WebSocket overview](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-overview.html) | external primary | high |
| CIT-015 | AppSync supports real-time GraphQL subscriptions for collaboration updates. | [AWS AppSync real-time data](https://docs.aws.amazon.com/appsync/latest/devguide/real-time-data.html) | external primary | high |
| CIT-016 | AppSync provides conflict detection and sync capabilities for offline/online reconciliation patterns. | [AppSync conflict detection and sync](https://docs.aws.amazon.com/appsync/latest/devguide/conflict-detection-and-sync.html) | external primary | high |
| CIT-017 | DynamoDB Global Tables provide multi-Region active-active replication patterns. | [DynamoDB Global Tables](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html) | external primary | high |
| CIT-018 | CloudTrail log file validation supports audit-integrity verification. | [CloudTrail log file integrity validation](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html) | external primary | high |
| CIT-019 | AWS KMS concepts define centralized key-management controls for encryption use cases. | [AWS KMS concepts](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) | external primary | high |
| CIT-020 | CloudWatch is the managed foundation for metrics, logs, alarms, and events in AWS operations. | [Amazon CloudWatch overview](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) | external primary | high |
| CIT-021 | Amazon Managed Service for Prometheus provides managed Prometheus-compatible metrics storage/querying. | [Amazon Managed Service for Prometheus](https://docs.aws.amazon.com/prometheus/latest/userguide/what-is-Amazon-Managed-Service-Prometheus.html) | external primary | high |
| CIT-022 | Amazon Managed Grafana provides managed Grafana for dashboards and observability workflows. | [Amazon Managed Grafana overview](https://docs.aws.amazon.com/grafana/latest/userguide/what-is-Amazon-Managed-Service-Grafana.html) | external primary | high |
| CIT-023 | Reliability guidance emphasizes resilient design, failure recovery, and operational readiness. | [AWS Well-Architected Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html) | external primary | high |
| CIT-024 | AWS Budgets supports threshold-based budget controls and alerts. | [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) | external primary | high |
| CIT-025 | Cost Anomaly Detection supports proactive cost outlier monitoring. | [AWS Cost Anomaly Detection](https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad.html) | external primary | high |
| CIT-026 | AWS Distro for OpenTelemetry provides managed distribution guidance for OTel instrumentation/export. | [AWS Distro for OpenTelemetry introduction](https://aws-otel.github.io/docs/introduction) | external primary | high |
| CIT-027 | SST supports multiple cloud providers through provider abstractions. | [SST providers](https://sst.dev/docs/providers/) | external primary | high |
| CIT-028 | SST AWS function component defines app-layer serverless function deployment model. | [SST AWS function component](https://sst.dev/docs/component/aws/function/) | external primary | high |
| CIT-029 | Terraform state is the source of truth for managed resource reconciliation. | [Terraform state language docs](https://developer.hashicorp.com/terraform/language/state) | external primary | high |
| CIT-030 | Terraform modules define composable infrastructure ownership boundaries. | [Terraform modules](https://developer.hashicorp.com/terraform/language/modules) | external primary | high |
| CIT-031 | Terraform plan provides pre-apply diff review and change validation workflow. | [Terraform plan command](https://developer.hashicorp.com/terraform/cli/commands/plan) | external primary | high |
| CIT-032 | OpenTofu defines Terraform-compatible open IaC foundations as a forked ecosystem path. | [OpenTofu introduction](https://opentofu.org/docs/intro/) | external primary | high |
| CIT-033 | OpenTofu modules documentation preserves modular IaC composition patterns. | [OpenTofu modules](https://opentofu.org/docs/language/modules/) | external primary | high |
| CIT-034 | OpenTelemetry defines signals (traces, metrics, logs) as first-class telemetry model components. | [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/) | external primary | high |
| CIT-035 | OpenTelemetry specification defines semantic and interoperability baselines for telemetry pipelines. | [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/) | external primary | high |
| CIT-036 | SOC 2 is based on trust services criteria for security, availability, processing integrity, confidentiality, and privacy. | [AICPA SOC 2 overview](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2) | standards primary | medium |
| CIT-037 | 2017 Trust Services Criteria (revised points of focus) is the standards reference set used for SOC mappings. | [AICPA 2017 Trust Services Criteria resource](https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022) | standards primary | medium |
| CIT-038 | Temporal Cloud is an external managed workflow platform option for specialized durable orchestration. | [Temporal Cloud docs](https://docs.temporal.io/cloud) | external primary | high |
| CIT-039 | Grafana Cloud is an external managed observability platform option for specialized telemetry operations. | [Grafana Cloud docs](https://grafana.com/docs/grafana-cloud/) | external primary | high |

## RQ Evidence Coverage

| Research Question | Primary Citation Set | Minimum Primary Evidence | Coverage Status |
|---|---|---:|---|
| RQ-001 provider mix | CIT-010, CIT-011, CIT-012, CIT-023, CIT-036 | 2 | satisfied |
| RQ-002 SST vs Terraform/OpenTofu split | CIT-027, CIT-028, CIT-029, CIT-030, CIT-031, CIT-032, CIT-033 | 2 | satisfied |
| RQ-003 policy precedence | CIT-006, CIT-010, CIT-011 | 2 | satisfied |
| RQ-004 provenance traceability | CIT-006, CIT-007, CIT-018 | 2 | satisfied |
| RQ-005 runtime/workflow durability | CIT-012, CIT-013, CIT-014, CIT-015, CIT-026 | 2 | satisfied |
| RQ-006 local-first collaboration model | CIT-015, CIT-016, CIT-017 | 1 | satisfied |
| RQ-007 OTEL/Grafana topology | CIT-020, CIT-021, CIT-022, CIT-034, CIT-035 | 1 | satisfied |
| RQ-008 compliance mapping | CIT-036, CIT-037, CIT-010, CIT-018, CIT-019 | 2 | satisfied |
| RQ-009 cost controls | CIT-024, CIT-025, CIT-023 | 1 | satisfied |
| RQ-010 graph-derived reliability | CIT-005, CIT-009 | 1 | satisfied |

## Conflict and Inference Notes

1. SOC2 control family descriptions (`CC6`, `CC7`, `A1`, `C1`, `PI1`) are mapped using AICPA SOC 2/TSC references and internal requirement framing; control-by-control wording is treated as implementation inference and marked accordingly in control mapping artifacts.
2. Recommendations that reference specialized providers (Temporal Cloud, Grafana Cloud) are included as conditional/fallback options, not baseline defaults, to preserve AWS-first constraints.
3. Any claim relying only on Graphiti supplemental facts is tagged as supplemental and cannot independently drive a high-impact decision.
