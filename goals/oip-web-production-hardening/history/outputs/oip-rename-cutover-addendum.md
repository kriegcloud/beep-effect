# OIP Rename Cutover Addendum

Date: 2026-05-20

The active app, package, source paths, and canonical public domain have moved
from OPIP to OIP:

- package: `@beep/oip-web`
- app path: `apps/oip-web`
- canonical public domain: `https://oip.law`
- canonical staging domain: `https://staging.oip.law`
- legacy redirect domains: `opip.law`, `www.opip.law`, `staging.opip.law`
- public contact email: `toppold@oip.law`

Historical proof files in this folder intentionally keep their original OPIP
domain evidence. They describe the state that existed when the hardening pass
was first closed.

Provider preflight on 2026-05-20 found:

- Cloudflare zone `oip.law` is active.
- Cloudflare zone `opip.law` is active.
- `oip.law` has existing Cloudflare-proxied apex A records.
- `www.oip.law` is not resolving yet.
- `staging.oip.law` is still pending DNS publication.
- `staging.opip.law` still resolves to Vercel through `cname.vercel-dns.com`.
- `OIP_SECRETS` was created in the Shared 1Password vault by duplicating the
  existing `OPIP_SECRETS` item, then updating `APP_VOICE_HOSTNAME` to
  `voice.oip.law`. `OPIP_SECRETS` remains available for rollback.
- HubSpot service-key account preflight succeeds for portal `246203876`.
- HubSpot Forms API preflight still returns `403`, so the app continues to use
  CRM contact upsert unless a form GUID and forms scope are added later.
- Pulumi preview for the renamed staging stack is blocked in this shell because
  the `codedank-elpresidank` AWS profile has no valid credentials for the
  preserved `opip-law-pulumi-state` backend.

Pulumi now models OIP canonical records and OPIP legacy redirects while
retaining the historical Pulumi project/state names that would otherwise require
a state migration.

## 2026-06-02 Follow-Up

The physical Pulumi state bucket migration has now been completed. The backend
is `s3://oip-law-pulumi-state`; the historical `opip-law-pulumi-state` bucket
was archived into the new bucket and deleted. The Pulumi project namespace and
stack URN namespace remain `opip-web` for state continuity.

The managed S3 asset buckets were also replaced through Pulumi:

- `assets.opip.law` -> `assets.oip.law`
- `staging-assets.opip.law` -> `staging-assets.oip.law`

The legacy `apps/opip-web` path is no longer a package, workspace, or Vercel
deployment root; the active app is `apps/oip-web`. Only stale generated PWA
artifacts remained under `apps/opip-web/public`, so removing those files does
not remove the current OIP service worker or OPIP redirect behavior.

OIP DNS cutover and OPIP legacy redirects remain modeled but unapplied until the
provider cutover gate is approved.
