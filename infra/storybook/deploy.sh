#!/usr/bin/env bash
#
# Deploy the @beep/ui Storybook to Vercel (storybook.yeebois.com).
#
# Secrets resolve from 1Password via `op read`, so be signed in first
# (`op signin`). Only 1Password *references* live in this file — never the
# resolved secret values. Defaults to a read-only `preview`; pass `up` to apply:
#
#   ./deploy.sh            # pulumi preview (no changes)
#   ./deploy.sh up         # pulumi up (creates/updates real resources)
#
set -euo pipefail
cd "$(dirname "$0")"

# Assign first, then export, so `op read` failures abort under `set -e` instead of
# being masked by the surrounding `export` builtin's own exit status (SC2155).
VERCEL_API_TOKEN="$(op read 'op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_VERCEL_API_TOKEN')"
export VERCEL_API_TOKEN
STORYBOOK_CLOUDFLARE_ZONE_ID="$(op read 'op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_CLOUDFLARE_ZONE_ID_YEEBOIS_COM')"
export STORYBOOK_CLOUDFLARE_ZONE_ID

# The Cloudflare provider needs an API token to manage the storybook.yeebois.com
# CNAME. Set CLOUDFLARE_API_TOKEN before running. Replace the placeholder below with
# the real 1Password field that stores your Cloudflare API token, e.g.:
#   export CLOUDFLARE_API_TOKEN="$(op read 'op://BEEP_SECRETS/BEEP_SECRETS/<your-cloudflare-api-token-field>')"
# TODO: swap <your-cloudflare-api-token-field> for the actual field name before use.
: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN before deploying (see comment above).}"

pulumi stack select production 2>/dev/null || pulumi stack init production
pulumi "${@:-preview}"
