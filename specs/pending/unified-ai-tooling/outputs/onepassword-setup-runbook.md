# 1Password Setup Runbook for `.beep` / `beep-sync`

Date: 2026-02-23
Owner: `beep-dev`
Status: Ready to execute

## Goal

Set up 1Password once so local development and future `beep-sync` automation can use the same secret source of truth.

End state:
1. Local development uses 1Password desktop auth + `op`.
2. Automation uses a 1Password service account.
3. `.env` uses `op://...` references for sensitive/secret values.
4. Required secret resolution failures are fatal.

## Policy (Locked)

1. Hybrid auth:
- local interactive runs: desktop-account auth allowed.
- automation/non-interactive runs: service-account auth required.
2. Required secret resolution failures are fatal.
3. No plaintext secrets in tracked files.
4. `.env` stays interpolation-free (`${...}` disallowed).

## One-Shot Setup (Copy/Paste)

Run this from repo root:

```bash
cd /home/elpresidank/YeeBois/projects/beep-effect3
op signin
bash specs/pending/unified-ai-tooling/outputs/onepassword-op-setup-commands.sh
```

If you want to import existing real values from your current `.env` first:

```bash
cd /home/elpresidank/YeeBois/projects/beep-effect3
op signin
IMPORT_FROM_EXISTING_ENV=1 bash specs/pending/unified-ai-tooling/outputs/onepassword-op-setup-commands.sh
```

If you also want to create the service account during setup:

```bash
cd /home/elpresidank/YeeBois/projects/beep-effect3
op signin
IMPORT_FROM_EXISTING_ENV=1 CREATE_SERVICE_ACCOUNT=1 bash specs/pending/unified-ai-tooling/outputs/onepassword-op-setup-commands.sh
```

## What the Script Executes (Exact `op` Commands)

Script path:
- `specs/pending/unified-ai-tooling/outputs/onepassword-op-setup-commands.sh`

It runs exact `op` command patterns:

1. Auth + sanity checks:
```bash
op --version
op signin
op whoami
```

2. Vault creation (idempotent):
```bash
op vault get beep-dev-secrets || op vault create beep-dev-secrets --icon=vault-door
op vault get beep-mcp-secrets || op vault create beep-mcp-secrets --icon=vault-door
op vault get beep-automation-admin || op vault create beep-automation-admin --icon=vault-door
```

3. Item seeding is idempotent and non-destructive by default:
- missing items are created with placeholders.
- existing items are preserved.
- values are only overwritten during explicit import or explicit service-account-token write.

4. Optional import from existing `.env` values into 1Password item fields.

5. Install canonical env template:
```bash
cp specs/pending/unified-ai-tooling/outputs/onepassword-env-template.env .env
```

6. Optional service account creation:
```bash
op service-account create beep-sync-service-account \
  --vault beep-dev-secrets:read_items \
  --vault beep-mcp-secrets:read_items \
  --raw
```

7. Validation:
```bash
op run --env-file=.env -- bash -lc 'echo "preflight runs inside setup script"'
```

Validation behavior in the setup script:
1. `VERCEL_PROJECT_ID` is optional (warning only when missing).
2. `OAUTH_PROVIDER_FACEBOOK_CLIENT_ID` and `OAUTH_PROVIDER_FACEBOOK_CLIENT_SECRET` are required only when `OAUTH_PROVIDER_NAMES` contains `facebook`.

## Manual Service Account Flow (Copy/Paste)

If you skip service-account creation in the script:

```bash
cd /home/elpresidank/YeeBois/projects/beep-effect3
op signin

SA_TOKEN="$(op service-account create beep-sync-service-account \
  --vault beep-dev-secrets:read_items \
  --vault beep-mcp-secrets:read_items \
  --raw)"

if op item get beep-sync-service-account --vault beep-automation-admin >/dev/null 2>&1; then
  op item edit beep-sync-service-account --vault beep-automation-admin \
    "OP_SERVICE_ACCOUNT_TOKEN[concealed]=$SA_TOKEN"
else
  op item create --category "Secure Note" --title beep-sync-service-account --vault beep-automation-admin \
    "OP_SERVICE_ACCOUNT_TOKEN[concealed]=$SA_TOKEN"
fi

unset SA_TOKEN
```

Automation auth verification:

```bash
export OP_SERVICE_ACCOUNT_TOKEN="$(op read op://beep-automation-admin/beep-sync-service-account/OP_SERVICE_ACCOUNT_TOKEN)"
unset OP_CONNECT_HOST OP_CONNECT_TOKEN
op service-account ratelimit
op vault list
```

## Files This Runbook Uses

1. Setup script:
- `specs/pending/unified-ai-tooling/outputs/onepassword-op-setup-commands.sh`

2. `.env` reference template (ASCII + `op://` mappings):
- `specs/pending/unified-ai-tooling/outputs/onepassword-env-template.env`

3. Spec context:
- `specs/pending/unified-ai-tooling/README.md`

## Troubleshooting (Copy/Paste)

1. Wrong account selected:
```bash
export OP_ACCOUNT="<your-account>.1password.com"
op signin
op whoami
```

2. Service-account token seems ignored:
```bash
unset OP_CONNECT_HOST OP_CONNECT_TOKEN
op vault list
```

3. Check a specific reference path:
```bash
op read op://beep-dev-secrets/beep-ai/AI_OPENAI_API_KEY
```

4. Validate env resolution in-process:
```bash
op run --env-file=.env -- bash -lc 'env | rg "^(AI_OPENAI_API_KEY|DB_PG_URL)="'
```

## Source Links

Primary docs used:
1. 1Password CLI get started: https://developer.1password.com/docs/cli/get-started/
2. 1Password CLI app integration: https://developer.1password.com/docs/cli/app-integration/
3. `op signin` reference: https://developer.1password.com/docs/cli/reference/commands/signin/
4. Multiple-account usage: https://developer.1password.com/docs/cli/use-multiple-accounts/
5. Service accounts with CLI: https://developer.1password.com/docs/service-accounts/use-with-1password-cli/
6. Service-account management command: https://developer.1password.com/docs/cli/reference/management-commands/service-account
7. Service-account setup/limitations: https://developer.1password.com/docs/service-accounts/get-started/
8. 1Password SDKs: https://developer.1password.com/docs/sdks/
