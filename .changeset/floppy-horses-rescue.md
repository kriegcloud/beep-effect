---
---

Infrastructure-only changes: rename the OIP Pulumi S3 state backend and managed
asset buckets from the legacy `opip-law-*` / `assets.opip.law` namespace to the
`oip-law-*` / `assets.oip.law` namespace. No publishable packages are bumped;
rollout, rollback, and provider-gate evidence is recorded under
`goals/oip-web-production-hardening/history/outputs/`.
