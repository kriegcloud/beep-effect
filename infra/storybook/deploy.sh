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

export VERCEL_API_TOKEN="$(op read 'op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_VERCEL_API_TOKEN')"
export STORYBOOK_CLOUDFLARE_ZONE_ID="$(op read 'op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_CLOUDFLARE_ZONE_ID_YEEBOIS_COM')"

# The Cloudflare provider needs an API token to manage the storybook.yeebois.com
# CNAME. Set CLOUDFLARE_API_TOKEN before running (use your own op reference for
# the field), e.g.:
#   export CLOUDFLARE_API_TOKEN="$(op read 'op://BEEP_SECRETS/BEEP_SECRETS/<cloudflare-api-token-field>')"
: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN before deploying (see comment above).}"

pulumi stack select production 2>/dev/null || pulumi stack init production
pulumi "${@:-preview}"
