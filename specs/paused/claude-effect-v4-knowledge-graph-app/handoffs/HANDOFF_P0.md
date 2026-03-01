# Handoff P0: Foundations — Auth + DB + Project Setup

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,500 | OK |
| Episodic | 1,000 | ~400 | OK |
| Semantic | 500 | ~300 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 0 Goal
Set up the foundational infrastructure for the app: better-auth with magic link authentication, Neon PostgreSQL with Drizzle for auth storage, email allowlist enforcement, and basic project scaffold in `apps/web`. By the end, a user on the allowlist can receive a magic link email, click it, and reach an authenticated layout.

### Deliverables
1. `apps/web/src/lib/auth/server.ts` — better-auth server config with magic link plugin, allowlist hook
2. `apps/web/src/lib/auth/client.ts` — better-auth React client exports (with magicLinkClient plugin)
3. `apps/web/src/lib/db/index.ts` — Drizzle + Neon client
4. `apps/web/src/lib/db/schema.ts` — Auth tables schema (user, session, account, verification)
5. `apps/web/src/app/api/auth/[...all]/route.ts` — Auth route handler
6. `apps/web/src/app/(auth)/sign-in/page.tsx` — Email input page (magic link flow)
7. `apps/web/src/app/(app)/layout.tsx` — Auth-gated layout
8. `apps/web/src/app/(app)/page.tsx` — Placeholder authenticated landing
9. `outputs/p0-foundations/setup-log.md` — Setup steps, env vars documented

### Success Criteria
- [ ] `better-auth` installed with magic link plugin and Drizzle adapter on Neon PostgreSQL
- [ ] `nextCookies()` plugin enabled for server action support
- [ ] Magic link sign-in flow works locally (enter email -> receive link -> click -> authenticated)
- [ ] Allowlist check rejects emails not in `ALLOWED_EMAILS` env var (magic link is never sent)
- [ ] Auth-gated layout redirects unauthenticated users to sign-in
- [x] Drizzle schema generated and migrations applied (P1.5: schema regenerated via better-auth CLI, baseline migration `0000_oval_molly_hayes.sql` applied to Neon, `__drizzle_migrations` journal verified)
- [ ] Resend integration sends magic link emails
- [ ] Atom+React prototype spike passes (RegistryProvider + useAtomValue + Atom.fn in Next.js)
- [ ] `bun run check` passes
- [ ] All env vars documented in `outputs/p0-foundations/setup-log.md`

### Implementation Notes

**better-auth setup with magic link:**
```ts
// lib/auth/server.ts-morph
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { magicLink } from "better-auth/plugins"
import { Resend } from "resend"
import { db } from "../db"

const resend = new Resend(process.env.RESEND_API_KEY)

const allowedEmails = new Set(
  (process.env.ALLOWED_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean)
)

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        // Allowlist check — don't even send the email if not allowed
        if (!allowedEmails.has(email.toLowerCase().trim())) {
          throw new Error("Email not authorized")
        }
        await resend.emails.send({
          from: "Effect v4 KG <noreply@beep.dev>", // Update domain to match Resend verified sender
          to: email,
          subject: "Sign in to Effect v4 Knowledge Graph",
          html: `<a href="${url}">Click here to sign in</a>`,
        })
      },
      expiresIn: 300, // 5 minutes
    }),
  ],
})
```

**Client setup:**
```ts
// lib/auth/client.ts-morph
import { createAuthClient } from "better-auth/react"
import { magicLinkClient } from "better-auth/client/plugins"

export const { signIn, signUp, useSession } = createAuthClient({
  plugins: [magicLinkClient()],
})
```

**Sign-in page flow:**
```tsx
// app/(auth)/sign-in/page.tsx
// 1. User enters email
// 2. Client calls: signIn.magicLink({ email, callbackURL: "/app" })
// 3. Server checks allowlist in sendMagicLink callback
// 4. If allowed, Resend sends email with magic link
// 5. User clicks link -> better-auth verifies token -> creates session -> redirects to callbackURL
// 6. If not allowed, show "Email not authorized" error
```

**Neon setup:**
```ts
// lib/db/index.ts-morph
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)
```

**Auth-gated layout:**
```ts
// app/(app)/layout.tsx
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect("/sign-in")
  }
  return <>{children}</>
}
```

**Atom+React prototype spike (validates AD-009):**
```tsx
// app/(app)/page.tsx — temporary spike, replaced in P4
import { Atom } from "effect/unstable/reactivity"
import { useAtomValue, RegistryProvider } from "@effect/atom-react"

const countAtom = Atom.make(0)
const doubleAtom = Atom.make((get) => get(countAtom) * 2)
const asyncAtom = Atom.fn<[string]>()(
  (query) => Effect.succeed(`searched: ${query}`),
  { initialValue: AsyncResult.initial() }
)

// Verify: RegistryProvider renders, useAtomValue reads, Atom.fn triggers mutation
// If this fails, fallback plan: replace atoms with useState+useEffect (~2hr migration)
```
**Atom API restrictions (based on test coverage analysis):**
- USE: `Atom.make`, computed atoms, `Atom.fn`, `useAtomValue`, `useAtom`, `useAtomRefresh`, `RegistryProvider`
- AVOID: `AtomHttpApi` (zero tests), `AtomRpc` (zero tests), `Reactivity` service layer (limited tests)
- Pin exact version: `"@effect/atom-react": "4.0.0-beta.4"` (no `^`)

**Key warning:** better-auth has a known TypeScript issue in monorepos ("cannot be named without reference"). Keep all auth code in `apps/web` — do NOT extract to a shared package. If tsconfig issues arise, disable `declaration` and `composite`.

### Dependencies to Install
- `better-auth`
- `@neondatabase/serverless`
- `drizzle-orm`
- `drizzle-kit` (dev)
- `resend`

### Required Environment Variables

> **Infrastructure note:** Neon PostgreSQL is already provisioned via SST IaC (`infra/database.ts`). Connection strings are computed Pulumi outputs set on Vercel by `infra/web.ts`. For local development, get the connection string from the Neon dashboard or SST deploy outputs. All secrets are sourced from 1Password vault `beep-dev-secrets` via `op run --env-file=.env`.

```
BETTER_AUTH_SECRET=<from 1Password: beep-app-core/AUTH_SECRET>
BETTER_AUTH_URL=http://localhost:3000    # Local dev; production value from 1Password beep-app-core/BETTER_AUTH_URL
DATABASE_URL=<neon pooled connection string — from SST deploy output or Neon dashboard>
DATABASE_URL_UNPOOLED=<neon direct connection string — from SST deploy output or Neon dashboard>
ALLOWED_EMAILS=user1@example.com,user2@example.com    # From 1Password: beep-app-core/APP_ADMINS_EMAILS
RESEND_API_KEY=<from 1Password: beep-email/EMAIL_RESEND_API_KEY>
```

## Episodic Memory

### From Prior Phases
- Research complete (see `outputs/research.md`)
- Effect v4 AI/HTTP/atom APIs documented from `.repos/effect-smol` source
- Auth decision: better-auth magic link + Neon PostgreSQL (review settled on this after evaluating iron-session, custom HMAC, and Turso alternatives)

## Semantic Memory

### Key Patterns (Effect v4)
- All coding style rules from MEMORY.md apply (no `as`, no native Map/Set, use Effect modules)
- Schema annotations required: `identifier`, `title`, `description` minimum
- Tagged errors via `S.TaggedErrorClass`, not `Data.TaggedError`
- `Effect.fn` instead of `(args) => Effect.gen(function* () {})`

### Key Patterns (better-auth)
- `toNextJsHandler(auth)` for route handler
- `createAuthClient()` for React client with `magicLinkClient()` plugin
- `signIn.magicLink({ email, callbackURL })` for client-side sign-in
- `auth.api.getSession({ headers: await headers() })` for server components
- `nextCookies()` plugin required for server actions
- Allowlist enforcement in `sendMagicLink` callback (server-side, before email is sent)

## Procedural Memory

### References
- Spec README: `specs/pending/claude-effect-v4-knowledge-graph-app/README.md`
- Research: `specs/pending/claude-effect-v4-knowledge-graph-app/outputs/research.md`
- Effect v4 source: `.repos/effect-smol`
- better-auth magic link docs: https://www.better-auth.com/docs/plugins/magic-link
- better-auth Next.js docs: https://www.better-auth.com/docs/integrations/next
- Neon docs: https://neon.com/docs/guides/nextjs
- Resend docs: https://resend.com/docs/send-with-nextjs
