# Storybook Deployment (Pulumi)

Deploys the `@beep/ui` Storybook static build to Vercel and serves it on
`storybook.yeebois.com` (Cloudflare-managed DNS).

- Stack source: [`../src/Storybook.ts`](../src/Storybook.ts)
- Entry point: [`../src/internal/storybook-entry.ts`](../src/internal/storybook-entry.ts)
- Security headers: [`../../packages/foundation/ui-system/ui/vercel.json`](../../packages/foundation/ui-system/ui/vercel.json)

## What it provisions

- A git-connected `vercel.Project` (`kriegcloud/beep-effect`, root
  `packages/foundation/ui-system/ui`) that runs `bun run storybook:build` and
  serves the `storybook-static/` output.
- A `vercel.ProjectDomain` for `storybook.yeebois.com`.
- A Cloudflare `CNAME` record (`storybook.yeebois.com → cname.vercel-dns.com`),
  created only once `storybook:cloudflareZoneId` is set.

## Deploy

Secrets resolve from 1Password at deploy time via `op read` (never committed).
Use the helper (defaults to a read-only `preview`; pass `up` to apply):

```sh
cd infra/storybook
op signin                                 # if not already signed in
# Replace <your-cloudflare-api-token-field> with the real 1Password field name:
export CLOUDFLARE_API_TOKEN="$(op read 'op://BEEP_SECRETS/BEEP_SECRETS/<your-cloudflare-api-token-field>')"
./deploy.sh            # pulumi preview
./deploy.sh up         # pulumi up
```

`deploy.sh` resolves:

- `VERCEL_API_TOKEN` ← `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_VERCEL_API_TOKEN`
  (the Vercel provider reads this env var automatically).
- `STORYBOOK_CLOUDFLARE_ZONE_ID` ← `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_CLOUDFLARE_ZONE_ID_YEEBOIS_COM`
  (the stack uses this as the Cloudflare zone id when `storybook:cloudflareZoneId`
  is not set in Pulumi config, so the id never has to be committed).

`CLOUDFLARE_API_TOKEN` must be set yourself — the Cloudflare provider needs it to
manage the CNAME (the same credential `oip-web` uses). The Vercel project and
domain are created even without a zone id / Cloudflare token; the DNS record is
skipped until both are present.

## HTTP security headers / Mozilla Observatory

Response headers come from `packages/foundation/ui-system/ui/vercel.json`
(Vercel reads headers from `vercel.json`, not from the Pulumi project). The set
mirrors `@beep/oip-web` for an A+ target, with two Storybook-specific changes:

- `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'self'` (not `DENY` /
  `'none'`), because the Storybook manager frames its own preview `iframe.html`
  on the same origin.
- A static CSP (no per-request nonce, since this is a static deployment):
  `script-src 'self'`, `style-src 'self' 'unsafe-inline'`.

**Verify against the live deployment after first `pulumi up`.** A static CSP
without `'unsafe-inline'`/`'unsafe-eval'` in `script-src` is required for A+, but
the Storybook build must actually load under it. If the deployed Storybook fails
to boot (blocked inline bootstrap script or `eval`), prefer adding the specific
script **hashes** to `script-src` over `'unsafe-inline'`/`'unsafe-eval'`, which
would forfeit the A+ CSP score. Re-run
<https://developer.mozilla.org/en-US/observatory> against `storybook.yeebois.com`
to confirm the grade.
