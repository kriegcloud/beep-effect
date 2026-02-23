#!/usr/bin/env bash
set -euo pipefail

# -------------------------------------------------------------------------------------------------
# 1Password bootstrap for beep-effect3
#
# Usage:
#   bash specs/completed/unified-ai-tooling/outputs/onepassword-op-setup-commands.sh
#
# Optional flags via env vars:
#   IMPORT_FROM_EXISTING_ENV=1    # import current .env values into 1Password items
#   INSTALL_ENV_TEMPLATE=1        # install op:// template into .env (default: 1)
#   CREATE_SERVICE_ACCOUNT=1      # create service account + store token in 1Password
#   SERVICE_ACCOUNT_NAME=beep-sync-service-account
# -------------------------------------------------------------------------------------------------

ROOT_DIR="/home/elpresidank/YeeBois/projects/beep-effect3"
cd "$ROOT_DIR"

BEEP_VAULT_DEV="${BEEP_VAULT_DEV:-beep-dev-secrets}"
BEEP_VAULT_MCP="${BEEP_VAULT_MCP:-beep-mcp-secrets}"
BEEP_VAULT_AUTOMATION="${BEEP_VAULT_AUTOMATION:-beep-automation-admin}"
PLACEHOLDER="${PLACEHOLDER:-REPLACE_ME_NOW}"

IMPORT_FROM_EXISTING_ENV="${IMPORT_FROM_EXISTING_ENV:-0}"
INSTALL_ENV_TEMPLATE="${INSTALL_ENV_TEMPLATE:-1}"
CREATE_SERVICE_ACCOUNT="${CREATE_SERVICE_ACCOUNT:-0}"
SERVICE_ACCOUNT_NAME="${SERVICE_ACCOUNT_NAME:-beep-sync-service-account}"

ensure_vault() {
  local vault_name="$1"
  if op vault get "$vault_name" >/dev/null 2>&1; then
    echo "[ok] vault exists: $vault_name"
  else
    echo "[create] vault: $vault_name"
    op vault create "$vault_name" --icon="vault-door" >/dev/null
  fi
}

upsert_note() {
  local vault="$1"
  local title="$2"
  shift 2

  if op item get "$title" --vault "$vault" >/dev/null 2>&1; then
    echo "[update] item: $vault/$title"
    op item edit "$title" --vault "$vault" "$@" >/dev/null
  else
    echo "[create] item: $vault/$title"
    op item create --category "Secure Note" --title "$title" --vault "$vault" "$@" >/dev/null
  fi
}

ensure_note_exists() {
  local vault="$1"
  local title="$2"
  shift 2

  if op item get "$title" --vault "$vault" >/dev/null 2>&1; then
    echo "[ok] item exists: $vault/$title (preserving current values)"
  else
    echo "[create] item: $vault/$title"
    op item create --category "Secure Note" --title "$title" --vault "$vault" "$@" >/dev/null
  fi
}

echo "== 1) Authentication checks =="
op --version
op signin >/dev/null
op whoami >/dev/null

echo "== 2) Ensure vaults =="
ensure_vault "$BEEP_VAULT_DEV"
ensure_vault "$BEEP_VAULT_MCP"
ensure_vault "$BEEP_VAULT_AUTOMATION"

echo "== 3) Seed item skeletons with placeholder values =="
ensure_note_exists "$BEEP_VAULT_DEV" "beep-app-core" \
  "APP_ADMINS_EMAILS[concealed]=$PLACEHOLDER" \
  "APP_ADMIN_USER_IDS[concealed]=$PLACEHOLDER" \
  "SECURITY_TRUSTED_ORIGINS[concealed]=$PLACEHOLDER" \
  "AUTH_SECRET[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-ai" \
  "AI_ANTHROPIC_API_KEY[concealed]=$PLACEHOLDER" \
  "AI_OPENAI_API_KEY[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-email" \
  "EMAIL_RESEND_API_KEY[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-marketing" \
  "MARKETING_DUB_TOKEN[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-data" \
  "DB_PG_URL[concealed]=$PLACEHOLDER" \
  "KV_REDIS_URL[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-cloud-aws" \
  "CLOUD_AWS_ACCESS_KEY_ID[concealed]=$PLACEHOLDER" \
  "CLOUD_AWS_SECRET_ACCESS_KEY[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-cloud-captcha" \
  "CLOUD_GOOGLE_CAPTCHA_SECRET_KEY[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-oauth-microsoft" \
  "OAUTH_PROVIDER_MICROSOFT_TENANT_ID[concealed]=$PLACEHOLDER" \
  "OAUTH_PROVIDER_MICROSOFT_CLIENT_ID[concealed]=$PLACEHOLDER" \
  "OAUTH_PROVIDER_MICROSOFT_CLIENT_SECRET[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-oauth-google" \
  "OAUTH_PROVIDER_GOOGLE_CLIENT_ID[concealed]=$PLACEHOLDER" \
  "OAUTH_PROVIDER_GOOGLE_CLIENT_SECRET[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-oauth-discord" \
  "OAUTH_PROVIDER_DISCORD_CLIENT_ID[concealed]=$PLACEHOLDER" \
  "OAUTH_PROVIDER_DISCORD_CLIENT_SECRET[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-oauth-github" \
  "OAUTH_PROVIDER_GITHUB_CLIENT_ID[concealed]=$PLACEHOLDER" \
  "OAUTH_PROVIDER_GITHUB_CLIENT_SECRET[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-oauth-linkedin" \
  "OAUTH_PROVIDER_LINKEDIN_CLIENT_ID[concealed]=$PLACEHOLDER" \
  "OAUTH_PROVIDER_LINKEDIN_CLIENT_SECRET[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-oauth-twitter" \
  "OAUTH_PROVIDER_TWITTER_CLIENT_ID[concealed]=$PLACEHOLDER" \
  "OAUTH_PROVIDER_TWITTER_CLIENT_SECRET[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-oauth-facebook" \
  "OAUTH_PROVIDER_FACEBOOK_CLIENT_ID[concealed]=$PLACEHOLDER" \
  "OAUTH_PROVIDER_FACEBOOK_CLIENT_SECRET[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-build" \
  "VERCEL_PROJECT_ID[concealed]=$PLACEHOLDER" \
  "TURBO_TOKEN[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_DEV" "beep-realtime" \
  "LIVEBLOCKS_SECRET_KEY[concealed]=$PLACEHOLDER"

ensure_note_exists "$BEEP_VAULT_MCP" "beep-mcp-default" \
  "CONTEXT7_API_KEY[concealed]=$PLACEHOLDER"

if [[ "$IMPORT_FROM_EXISTING_ENV" == "1" ]]; then
  echo "== 4) Import values from existing .env =="
  if [[ ! -f ".env" ]]; then
    echo "[warn] .env not found, skipping import"
  else
    set -a
    # shellcheck disable=SC1091
    source ./.env
    set +a

    upsert_note "$BEEP_VAULT_DEV" "beep-app-core" \
      "APP_ADMINS_EMAILS[concealed]=${APP_ADMINS_EMAILS:-$PLACEHOLDER}" \
      "APP_ADMIN_USER_IDS[concealed]=${APP_ADMIN_USER_IDS:-$PLACEHOLDER}" \
      "SECURITY_TRUSTED_ORIGINS[concealed]=${SECURITY_TRUSTED_ORIGINS:-$PLACEHOLDER}" \
      "AUTH_SECRET[concealed]=${AUTH_SECRET:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-ai" \
      "AI_ANTHROPIC_API_KEY[concealed]=${AI_ANTHROPIC_API_KEY:-$PLACEHOLDER}" \
      "AI_OPENAI_API_KEY[concealed]=${AI_OPENAI_API_KEY:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-email" \
      "EMAIL_RESEND_API_KEY[concealed]=${EMAIL_RESEND_API_KEY:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-marketing" \
      "MARKETING_DUB_TOKEN[concealed]=${MARKETING_DUB_TOKEN:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-data" \
      "DB_PG_URL[concealed]=${DB_PG_URL:-$PLACEHOLDER}" \
      "KV_REDIS_URL[concealed]=${KV_REDIS_URL:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-cloud-aws" \
      "CLOUD_AWS_ACCESS_KEY_ID[concealed]=${CLOUD_AWS_ACCESS_KEY_ID:-$PLACEHOLDER}" \
      "CLOUD_AWS_SECRET_ACCESS_KEY[concealed]=${CLOUD_AWS_SECRET_ACCESS_KEY:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-cloud-captcha" \
      "CLOUD_GOOGLE_CAPTCHA_SECRET_KEY[concealed]=${CLOUD_GOOGLE_CAPTCHA_SECRET_KEY:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-oauth-microsoft" \
      "OAUTH_PROVIDER_MICROSOFT_TENANT_ID[concealed]=${OAUTH_PROVIDER_MICROSOFT_TENANT_ID:-$PLACEHOLDER}" \
      "OAUTH_PROVIDER_MICROSOFT_CLIENT_ID[concealed]=${OAUTH_PROVIDER_MICROSOFT_CLIENT_ID:-$PLACEHOLDER}" \
      "OAUTH_PROVIDER_MICROSOFT_CLIENT_SECRET[concealed]=${OAUTH_PROVIDER_MICROSOFT_CLIENT_SECRET:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-oauth-google" \
      "OAUTH_PROVIDER_GOOGLE_CLIENT_ID[concealed]=${OAUTH_PROVIDER_GOOGLE_CLIENT_ID:-$PLACEHOLDER}" \
      "OAUTH_PROVIDER_GOOGLE_CLIENT_SECRET[concealed]=${OAUTH_PROVIDER_GOOGLE_CLIENT_SECRET:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-oauth-discord" \
      "OAUTH_PROVIDER_DISCORD_CLIENT_ID[concealed]=${OAUTH_PROVIDER_DISCORD_CLIENT_ID:-$PLACEHOLDER}" \
      "OAUTH_PROVIDER_DISCORD_CLIENT_SECRET[concealed]=${OAUTH_PROVIDER_DISCORD_CLIENT_SECRET:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-oauth-github" \
      "OAUTH_PROVIDER_GITHUB_CLIENT_ID[concealed]=${OAUTH_PROVIDER_GITHUB_CLIENT_ID:-$PLACEHOLDER}" \
      "OAUTH_PROVIDER_GITHUB_CLIENT_SECRET[concealed]=${OAUTH_PROVIDER_GITHUB_CLIENT_SECRET:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-oauth-linkedin" \
      "OAUTH_PROVIDER_LINKEDIN_CLIENT_ID[concealed]=${OAUTH_PROVIDER_LINKEDIN_CLIENT_ID:-$PLACEHOLDER}" \
      "OAUTH_PROVIDER_LINKEDIN_CLIENT_SECRET[concealed]=${OAUTH_PROVIDER_LINKEDIN_CLIENT_SECRET:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-oauth-twitter" \
      "OAUTH_PROVIDER_TWITTER_CLIENT_ID[concealed]=${OAUTH_PROVIDER_TWITTER_CLIENT_ID:-$PLACEHOLDER}" \
      "OAUTH_PROVIDER_TWITTER_CLIENT_SECRET[concealed]=${OAUTH_PROVIDER_TWITTER_CLIENT_SECRET:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-oauth-facebook" \
      "OAUTH_PROVIDER_FACEBOOK_CLIENT_ID[concealed]=${OAUTH_PROVIDER_FACEBOOK_CLIENT_ID:-$PLACEHOLDER}" \
      "OAUTH_PROVIDER_FACEBOOK_CLIENT_SECRET[concealed]=${OAUTH_PROVIDER_FACEBOOK_CLIENT_SECRET:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-build" \
      "VERCEL_PROJECT_ID[concealed]=${VERCEL_PROJECT_ID:-$PLACEHOLDER}" \
      "TURBO_TOKEN[concealed]=${TURBO_TOKEN:-$PLACEHOLDER}"

    upsert_note "$BEEP_VAULT_DEV" "beep-realtime" \
      "LIVEBLOCKS_SECRET_KEY[concealed]=${LIVEBLOCKS_SECRET_KEY:-$PLACEHOLDER}"

    echo "[ok] imported values from existing .env"
  fi
fi

if [[ "$INSTALL_ENV_TEMPLATE" == "1" ]]; then
  echo "== 5) Install op:// env template =="
  if [[ -f ".env" ]]; then
    cp .env ".env.backup.$(date +%Y%m%d-%H%M%S)"
    echo "[ok] backup created"
  fi
  cp specs/completed/unified-ai-tooling/outputs/onepassword-env-template.env .env
  echo "[ok] wrote .env from template"
fi

if [[ "$CREATE_SERVICE_ACCOUNT" == "1" ]]; then
  echo "== 6) Create service account and store token =="
  SA_TOKEN="$(op service-account create "$SERVICE_ACCOUNT_NAME" \
    --vault "$BEEP_VAULT_DEV:read_items" \
    --vault "$BEEP_VAULT_MCP:read_items" \
    --raw)"

  upsert_note "$BEEP_VAULT_AUTOMATION" "$SERVICE_ACCOUNT_NAME" \
    "OP_SERVICE_ACCOUNT_TOKEN[concealed]=$SA_TOKEN"

  unset SA_TOKEN
  echo "[ok] service account token stored in $BEEP_VAULT_AUTOMATION/$SERVICE_ACCOUNT_NAME"
fi

echo "== 7) Validation =="
op run --env-file=.env -- bash <<'VALIDATE_ENV'
set -euo pipefail

required=(
  APP_ADMINS_EMAILS APP_ADMIN_USER_IDS EMAIL_RESEND_API_KEY AI_ANTHROPIC_API_KEY AI_OPENAI_API_KEY
  MARKETING_DUB_TOKEN DB_PG_URL KV_REDIS_URL CLOUD_AWS_ACCESS_KEY_ID CLOUD_AWS_SECRET_ACCESS_KEY
  CLOUD_GOOGLE_CAPTCHA_SECRET_KEY OAUTH_PROVIDER_MICROSOFT_TENANT_ID OAUTH_PROVIDER_MICROSOFT_CLIENT_ID
  OAUTH_PROVIDER_MICROSOFT_CLIENT_SECRET OAUTH_PROVIDER_GOOGLE_CLIENT_ID OAUTH_PROVIDER_GOOGLE_CLIENT_SECRET
  OAUTH_PROVIDER_DISCORD_CLIENT_ID OAUTH_PROVIDER_DISCORD_CLIENT_SECRET OAUTH_PROVIDER_GITHUB_CLIENT_ID
  OAUTH_PROVIDER_GITHUB_CLIENT_SECRET OAUTH_PROVIDER_LINKEDIN_CLIENT_ID OAUTH_PROVIDER_LINKEDIN_CLIENT_SECRET
  OAUTH_PROVIDER_TWITTER_CLIENT_ID OAUTH_PROVIDER_TWITTER_CLIENT_SECRET TURBO_TOKEN
  SECURITY_TRUSTED_ORIGINS AUTH_SECRET LIVEBLOCKS_SECRET_KEY
)

missing=0
for k in "${required[@]}"; do
  if [ -z "${!k:-}" ] || [ "${!k}" = "REPLACE_ME_NOW" ]; then
    echo "missing_or_placeholder: $k"
    missing=1
  fi
done

oauth_names="$(printf '%s' "${OAUTH_PROVIDER_NAMES:-}" | tr '[:upper:]' '[:lower:]' | tr -d ' ')"
if printf ',%s,' "$oauth_names" | grep -q ',facebook,'; then
  for fk in OAUTH_PROVIDER_FACEBOOK_CLIENT_ID OAUTH_PROVIDER_FACEBOOK_CLIENT_SECRET; do
    if [ -z "${!fk:-}" ] || [ "${!fk}" = "REPLACE_ME_NOW" ]; then
      echo "missing_or_placeholder: $fk (required because facebook is enabled)"
      missing=1
    fi
  done
else
  echo "facebook_oauth_not_enabled: skipping facebook key requirement"
fi

if [ -z "${VERCEL_PROJECT_ID:-}" ] || [ "${VERCEL_PROJECT_ID}" = "REPLACE_ME_NOW" ]; then
  echo "optional_missing: VERCEL_PROJECT_ID"
fi

if [ "$missing" -eq 0 ]; then
  echo "required_secret_preflight_passed"
else
  exit 1
fi
VALIDATE_ENV

echo "Done."
