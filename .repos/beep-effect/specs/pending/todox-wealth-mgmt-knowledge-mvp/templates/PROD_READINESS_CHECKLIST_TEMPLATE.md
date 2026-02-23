# Production Readiness Checklist Template

> Use this template to produce an environment-specific readiness doc under `outputs/` (e.g. `outputs/P4_PROD_READINESS_CHECKLIST_[env].md`).

## Release Metadata

- Service/app(s): `[apps/todox | apps/marketing | apps/server | other]`
- Environment: `[pilot | staging | prod]`
- Release id: `[git sha / tag / build id]`
- Date: `[YYYY-MM-DD]`
- Owner: `[team/person]`

## Scope (What Is Being Released)

- In-scope features:
  - `[bullets]`
- Explicit non-goals (verbatim from spec):
  - Calendar sync, webhooks, Outlook/IMAP, doc editor, multi-source resolution

## Security & Compliance Gates (Pass/Fail)

- [ ] PII logging policy: no PII in logs; redaction rules documented and verified.
- [ ] Secrets policy: secrets never logged; secret values never committed.
- [ ] Trusted origins and CORS are locked down (no wildcard in prod).
- [ ] Meeting-prep disclaimer present wherever user-facing summaries/claims are shown.
- [ ] Audit posture:
  - [ ] evidence access is auditable (who accessed what, when)
  - [ ] claim-to-evidence link is persisted for meeting prep outputs
- [ ] Retention posture:
  - [ ] retention window(s) defined for documents, mentions, meeting-prep artifacts
  - [ ] deletion/erasure pathway documented (even if manual for MVP)

## Multi-Tenant Isolation Gates (Pass/Fail)

- [ ] Cross-org isolation tests exist and pass for:
  - [ ] Gmail -> Documents materialization mapping
  - [ ] Knowledge queries (entities/relations/mentions)
  - [ ] Embeddings/vector search paths
  - [ ] Evidence listing + highlight paths
  - [ ] Meeting-prep generation + persisted citations
- [ ] No shared caches or background workflows can mix org scopes.
- [ ] Table-level and query-level org scoping is consistent across all demo RPCs.

## Ops Gates (Pass/Fail)

- [ ] Migrations job exists and is executed pre-deploy (serialized).
- [ ] Backups configured:
  - [ ] automated backups enabled
  - [ ] restore procedure documented and time-estimated
- [ ] DR posture documented:
  - [ ] RPO/RTO targets defined (even if best-effort for MVP)
  - [ ] tabletop exercise completed (date + notes)
- [ ] Secrets are sourced from a secret manager and rotated plan exists.
- [ ] SLOs defined (availability, error rate, latency for `/knowledge` critical calls).

## Observability Gates (Pass/Fail)

- [ ] OTLP export configured for traces/logs/metrics (server and client where applicable).
- [ ] Dashboards exist:
  - [ ] API latency/error dashboards
  - [ ] DB/Redis saturation dashboards
  - [ ] queue/workflow health (if applicable)
- [ ] Alerts exist and are actionable:
  - [ ] high error rate
  - [ ] elevated latency
  - [ ] migrations failures
  - [ ] auth/redis session failures
- [ ] Alert routing is configured and tested (at least one controlled alert).

## Workflow Topology Gates (Pass/Fail)

- [ ] Topology decision recorded: `[single-node | multi-node/cluster]`.
- [ ] If multi-node/cluster:
  - [ ] table prefixing/isolation is implemented and documented
  - [ ] worker concurrency limits defined
  - [ ] idempotency keys and replay safety documented
- [ ] If single-node:
  - [ ] single-runner failure mode documented (restart behavior, recovery time)

## Release Runbook (Links)

- Primary runbook: `[link to outputs/... or external runbook]`
- Rollback plan: `[link]`
- Backup/restore: `[link]`
- Known issues: `[link]`

## Sign-Off (Required)

- Product sign-off: `[name/date]`
- Engineering sign-off: `[name/date]`
- Security/compliance sign-off: `[name/date or N/A for MVP with documented rationale]`
