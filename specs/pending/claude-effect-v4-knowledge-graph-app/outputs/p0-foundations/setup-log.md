# P0 Foundations — Setup Log

## Date
2026-02-23

## Dependencies Installed

### Production (`apps/web`)
| Package | Version | Purpose |
|---------|---------|---------|
| `better-auth` | ^1.4.19 | Authentication framework (magic link + session) |
| `@neondatabase/serverless` | ^1.0.2 | Neon PostgreSQL serverless driver |
| `drizzle-orm` | ^0.45.1 | TypeScript ORM for schema + queries |
| `resend` | ^6.9.2 | Email delivery (magic link emails) |
| `@effect/atom-react` | ^4.0.0-beta.11 | Atom-based React state (AD-009 spike) |
| `effect` | ^4.0.0-beta.11 | Effect v4 core (required for Atom primitives) |

### Dev (`apps/web`)
| Package | Version | Purpose |
|---------|---------|---------|
| `drizzle-kit` | ^0.31.9 | Schema generation + migrations |

## Files Created

### Database Layer
- `apps/web/src/lib/db/index.ts` — Drizzle + Neon serverless client
- `apps/web/src/lib/db/schema.ts` — Auth tables (user, session, account, verification)
- `apps/web/drizzle.config.ts` — Drizzle Kit configuration (uses `DATABASE_URL_UNPOOLED`)

### Auth Layer
- `apps/web/src/lib/auth/server.ts` — better-auth server config with magic link plugin, email allowlist enforcement, Resend integration
- `apps/web/src/lib/auth/client.ts` — better-auth React client with `magicLinkClient` plugin
- `apps/web/src/app/api/auth/[...all]/route.ts` — Next.js catch-all route handler for better-auth

### Pages
- `apps/web/src/app/(auth)/sign-in/page.tsx` — Magic link sign-in page (email input, status feedback)
- `apps/web/src/app/(app)/layout.tsx` — Auth-gated layout (redirects to `/sign-in` if no session)
- `apps/web/src/app/(app)/page.tsx` — Authenticated landing with Atom+React spike (counter demo)

### Removed
- `apps/web/src/app/page.tsx` — Replaced by `(app)/page.tsx` at same URL path `/`

## Environment Variables

All secrets sourced from 1Password vault `beep-dev-secrets` via `op run --env-file=.env`.
Infrastructure (Neon, Vercel) provisioned by SST IaC in `infra/`.

| Variable | Source | Description |
|----------|--------|-------------|
| `BETTER_AUTH_SECRET` | 1Password `beep-app-core/AUTH_SECRET` | 32+ char secret for session signing |
| `BETTER_AUTH_URL` | 1Password `beep-app-core/BETTER_AUTH_URL` | App URL (e.g. `http://localhost:3000` for dev) |
| `DATABASE_URL` | SST output / Neon dashboard | Neon **pooled** connection string (runtime) |
| `DATABASE_URL_UNPOOLED` | SST output / Neon dashboard | Neon **direct** connection string (migrations) |
| `ALLOWED_EMAILS` | 1Password `beep-app-core/APP_ADMINS_EMAILS` | Comma-separated email allowlist |
| `RESEND_API_KEY` | 1Password `beep-email/EMAIL_RESEND_API_KEY` | Resend API key for sending magic links |

## Database Setup

### Generate migration
```bash
cd apps/web
DATABASE_URL_UNPOOLED="<neon-direct-url>" npx drizzle-kit generate
```

### Push schema to Neon
```bash
cd apps/web
DATABASE_URL_UNPOOLED="<neon-direct-url>" npx drizzle-kit push
```

### Tables created
- `user` — id, name, email (unique), email_verified, image, created_at, updated_at
- `session` — id, user_id (FK → user), token (unique), expires_at, ip_address, user_agent, timestamps
- `account` — id, user_id (FK → user), account_id, provider_id, tokens, scope, timestamps
- `verification` — id, identifier, value, expires_at, timestamps

## Auth Flow

1. User navigates to `/` → `(app)/layout.tsx` checks session → redirects to `/sign-in`
2. User enters email on `/sign-in` → client calls `signIn.magicLink({ email, callbackURL: "/" })`
3. Server receives request → `sendMagicLink` callback checks allowlist
4. If email not in `ALLOWED_EMAILS` → throws "Email not authorized" → client shows error
5. If allowed → Resend sends magic link email from `noreply@beep.dev`
6. User clicks link → better-auth verifies token → creates session → redirects to `/`
7. `(app)/layout.tsx` finds valid session → renders authenticated content

## Atom+React Spike (AD-009)

The `(app)/page.tsx` includes a minimal spike validating:
- `RegistryProvider` renders without error
- `Atom.make(0)` creates a primitive atom
- `Atom.make((get) => get(countAtom) * 2)` creates a computed/derived atom
- `useAtom` returns `[value, setter]` tuple
- `useAtomValue` reads derived atom

This spike is temporary and will be replaced by the real workspace in P4.

## Notes

- All auth code lives in `apps/web` (not extracted to shared packages) per better-auth monorepo TypeScript constraint
- `nextCookies()` plugin enabled for server action support
- Magic link expiry: 5 minutes (300 seconds)
- Email sender: `Effect v4 KG <noreply@beep.dev>` (matches Resend verified domain)
