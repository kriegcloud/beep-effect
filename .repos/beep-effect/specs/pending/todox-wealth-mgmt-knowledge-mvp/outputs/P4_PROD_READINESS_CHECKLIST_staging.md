# Production Readiness Checklist (staging)

> Instantiated from `templates/PROD_READINESS_CHECKLIST_TEMPLATE.md` for the TodoX WM Knowledge MVP.

## Release Metadata

- Service/app(s): `apps/server` (`beep-api`) (primary); optionally `apps/todox` (UI) deployed separately
- Environment: `staging`
- Release id: `TBD (git sha / tag / build id)`
- Date: `TBD (YYYY-MM-DD)`
- Owner: `TBD`

## Scope (What Is Being Released)

- In-scope features:
  - TodoX WM Knowledge MVP API surfaces needed for the end-to-end demo (Gmail -> Documents materialization, Knowledge queries, Evidence listing/highlighting, meeting-prep generation).
  - Auth/session handling via Better Auth (Redis-backed sessions).
  - OTLP telemetry export (server; client only if enabled by the UI deployments).
- Explicit non-goals (verbatim from spec):
  - Full Calendar sync (read/write)
  - Real-time Gmail push/webhooks (watch + Pub/Sub)
  - Outlook/IMAP support
  - Full document editor and manual annotation UX
  - Multi-source entity resolution and long-horizon identity merge workflows
  - Multi-tenant performance tuning beyond what’s required for the demo

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

Env contract (must be true for staging deploys):

- [ ] Environment contract source-of-truth is `@beep/shared-env` schema names; deployment config matches exactly.
- [ ] Known mismatch risks are resolved in staging config:
  - [ ] `BETTER_AUTH_SECRET` (not `AUTH_SECRET`)
  - [ ] `KV_REDIS_URL` + `KV_REDIS_PASSWORD` (not `REDIS_URL`)
  - [ ] `KV_REDIS_PASSWORD` is non-empty (schema validation requirement)

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

- [ ] Topology decision recorded: `TBD (single-node | multi-node/cluster)`.
- [ ] If multi-node/cluster:
  - [ ] table prefixing/isolation is implemented and documented
  - [ ] worker concurrency limits defined
  - [ ] idempotency keys and replay safety documented
- [ ] If single-node:
  - [ ] single-runner failure mode documented (restart behavior, recovery time)

## Release Runbook (Links)

- Primary runbook: `outputs/P4_RUNBOOK_beep-api_staging.md`
- Rollback plan: `TBD (add link)`
- Backup/restore: `TBD (add link)`
- Known issues: `TBD (add link)`

## Sign-Off (Required)

- Product sign-off: `TBD`
- Engineering sign-off: `TBD`
- Security/compliance sign-off: `TBD (or N/A for MVP with documented rationale)`

