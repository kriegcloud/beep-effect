# Key Catalog (User-Locked Set)

## Scope
Canonical variable set provided by user on 2026-02-20 for local development.

## Summary
- Total keys: 64
- Namespace distribution:
  - `OAUTH_PROVIDER_*`: 16
  - `NEXT_PUBLIC_*`: 15
  - `APP_*`: 9
  - `CLOUD_*`: 6
  - `OTLP_*`: 3
  - `EMAIL_*`: 3
  - `AI_*`: 2
  - `VERCEL_*`: 2
  - `TURBO_*`: 2
  - singletons: `DB_PG_URL`, `KV_REDIS_URL`, `MARKETING_DUB_TOKEN`, `SECURITY_TRUSTED_ORIGINS`, `AUTH_SECRET`, `LIVEBLOCKS_SECRET_KEY`

## Catalog

| Key | Class | Action | Notes |
|-----|-------|--------|-------|
| `APP_NAME` | non-secret | keep | app metadata |
| `APP_ENV` | non-secret | keep | environment selector |
| `APP_ADMINS_EMAILS` | sensitive | keep | PII-ish admin list |
| `APP_ADMIN_USER_IDS` | sensitive | keep | internal ids |
| `APP_LOG_FORMAT` | non-secret | keep | runtime formatting |
| `APP_LOG_LEVEL` | non-secret | keep | runtime verbosity |
| `APP_API_URL` | non-secret | keep | base API URL |
| `APP_AUTH_PATH` | non-secret | keep | auth endpoint path |
| `APP_CLIENT_URL` | non-secret | keep | client URL |
| `OTLP_TRACE_EXPORTER_URL` | non-secret | keep | observability endpoint |
| `OTLP_LOG_EXPORTER_URL` | non-secret | keep | observability endpoint |
| `OTLP_METRIC_EXPORTER_URL` | non-secret | keep | observability endpoint |
| `EMAIL_FROM` | non-secret | keep | sender identity |
| `EMAIL_TEST` | non-secret | keep | local email sink |
| `EMAIL_RESEND_API_KEY` | secret | keep | provider key |
| `AI_ANTHROPIC_API_KEY` | secret | keep | provider key |
| `AI_OPENAI_API_KEY` | secret | keep | provider key |
| `MARKETING_DUB_TOKEN` | secret | keep | provider token |
| `DB_PG_URL` | secret | keep | DSN with credentials |
| `KV_REDIS_URL` | secret | keep | DSN may contain credentials |
| `CLOUD_AWS_REGION` | non-secret | keep | region metadata |
| `CLOUD_AWS_ACCESS_KEY_ID` | secret | keep | cloud credential |
| `CLOUD_AWS_SECRET_ACCESS_KEY` | secret | keep | cloud credential |
| `CLOUD_AWS_S3_BUCKET_NAME` | non-secret | keep | bucket identifier |
| `CLOUD_GOOGLE_CAPTCHA_SECRET_KEY` | secret | keep | server-side secret |
| `CLOUD_GOOGLE_CAPTCHA_SITE_KEY` | public | keep | client-safe key |
| `OAUTH_PROVIDER_MICROSOFT_TENANT_ID` | sensitive | keep | tenant metadata |
| `OAUTH_PROVIDER_MICROSOFT_CLIENT_ID` | sensitive | keep | oauth id |
| `OAUTH_PROVIDER_MICROSOFT_CLIENT_SECRET` | secret | keep | oauth secret |
| `OAUTH_PROVIDER_GOOGLE_CLIENT_ID` | sensitive | keep | oauth id |
| `OAUTH_PROVIDER_GOOGLE_CLIENT_SECRET` | secret | keep | oauth secret |
| `OAUTH_PROVIDER_DISCORD_CLIENT_ID` | sensitive | keep | oauth id |
| `OAUTH_PROVIDER_DISCORD_CLIENT_SECRET` | secret | keep | oauth secret |
| `OAUTH_PROVIDER_GITHUB_CLIENT_ID` | sensitive | keep | oauth id |
| `OAUTH_PROVIDER_GITHUB_CLIENT_SECRET` | secret | keep | oauth secret |
| `OAUTH_PROVIDER_LINKEDIN_CLIENT_ID` | sensitive | keep | oauth id |
| `OAUTH_PROVIDER_LINKEDIN_CLIENT_SECRET` | secret | keep | oauth secret |
| `OAUTH_PROVIDER_TWITTER_CLIENT_ID` | sensitive | keep | oauth id |
| `OAUTH_PROVIDER_TWITTER_CLIENT_SECRET` | secret | keep | oauth secret |
| `OAUTH_PROVIDER_FACEBOOK_CLIENT_ID` | sensitive | keep | oauth id |
| `OAUTH_PROVIDER_FACEBOOK_CLIENT_SECRET` | secret | keep | oauth secret |
| `OAUTH_PROVIDER_NAMES` | non-secret | keep | enabled provider list |
| `NEXT_PUBLIC_ENV` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_APP_NAME` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_APP_DOMAIN` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_AUTH_PROVIDER_NAMES` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_API_URL` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_OTLP_LOG_EXPORTER_URL` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_OTLP_METRIC_EXPORTER_URL` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_LOG_LEVEL` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_LOG_FORMAT` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_CAPTCHA_SITE_KEY` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_AUTH_PATH` | public | keep | explicit public value (no interpolation) |
| `NEXT_PUBLIC_APP_CLIENT_URL` | public | keep | direct client-safe value |
| `NEXT_PUBLIC_STATIC_URL` | public | keep | direct client-safe value |
| `NEXT_PUBLIC_ENABLE_GEO_TRACKING` | public | keep | feature flag |
| `VERCEL_PROJECT_ID` | sensitive | keep | deployment metadata |
| `VERCEL_PROJECT_NAME` | non-secret | keep | deployment metadata |
| `TURBO_TOKEN` | secret | keep | build auth |
| `TURBO_TEAM` | non-secret | keep | build org |
| `SECURITY_TRUSTED_ORIGINS` | sensitive | keep | security allowlist |
| `AUTH_SECRET` | secret | keep | canonical app auth secret |
| `LIVEBLOCKS_SECRET_KEY` | secret | keep | provider key |

## Required Fixups
1. `AUTH_SECRET` replaces historical `BETTER_AUTH_SECRET`; migration should include a compatibility strategy if runtime still expects legacy naming.

## Current vs Target Delta
- Current root `.env` keys not in target set: 69
- Current root `.env` keys retained in target set: 62
- New key introduced by target set: `AUTH_SECRET`
