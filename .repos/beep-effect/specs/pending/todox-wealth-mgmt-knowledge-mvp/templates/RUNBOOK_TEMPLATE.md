# Runbook Template

> Use this template to produce an environment-specific runbook under `outputs/` (e.g. `outputs/P4_RUNBOOK_[service]_[env].md`).

## Service

- Name: `[beep-api | beep-web | beep-todox | other]`
- Environment: `[staging | prod]`
- Owner: `[team/person]`

## Purpose

- `[1-2 sentences: what this service does in the TodoX WM Knowledge MVP]`

## Architecture Summary

- Runtime: `[Cloud Run | VM | other]`
- Dependencies:
  - Postgres: `[details]`
  - Redis: `[details]`
  - Object storage: `[details]`
  - OAuth provider: `[Google | other]`
  - OTLP backend: `[Grafana Cloud | LGTM | other]`

## SLOs (If Defined)

- Availability: `[target]`
- Latency: `[p95 target]`
- Error rate: `[target]`

## Operational Procedures

### Deploy

1. `[steps]`

### Rollback / Backout

1. `[steps]`

### Database Migrations

- How to run migrations:
  - `[job name, command, where executed]`
- Failure handling:
  - `[what to do if migrations fail]`

### Secrets / Rotation

- Where secrets live: `[secret manager]`
- Rotation procedure:
  - `[steps]`

### Backups / Restore

- Backup schedule: `[details]`
- Restore steps:
  - `[steps]`
- Verification:
  - `[how to validate restore succeeded]`

## Monitoring

- Dashboards:
  - `[links]`
- Alerts:
  - `[list alerts, thresholds, who is paged]`

## Common Incidents (Playbooks)

### 1) High Error Rate

- Symptoms:
  - `[bullets]`
- Triage:
  - `[bullets]`
- Mitigation:
  - `[bullets]`
- Resolution:
  - `[bullets]`

### 2) Elevated Latency

- Symptoms:
  - `[bullets]`
- Triage:
  - `[bullets]`
- Mitigation:
  - `[bullets]`

### 3) Auth/Session Failures (Redis)

- Symptoms:
  - `[bullets]`
- Triage:
  - `[bullets]`
- Mitigation:
  - `[bullets]`

### 4) Evidence Resolvability Failures (UI dead links)

- Symptoms:
  - `[bullets]`
- Triage:
  - `[bullets]`
- Mitigation:
  - `[bullets]`

## Known Risks / Constraints

- `[bullets]`

## Change Log

- `[YYYY-MM-DD]: [what changed]`

