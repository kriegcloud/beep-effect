# todox-auth-integration: Quick Start

> 5-minute guide to implementing auth in apps/todox.

---

## TL;DR

Copy guard providers from `apps/web`, create auth routes, wrap main page with `AuthGuard`.

---

## Step 1: Copy Guard Infrastructure (2 min)

```bash
# Create providers directory
mkdir -p apps/todox/src/providers

# Copy guard files from apps/web (adapt imports after)
```

Files to create in `apps/todox/src/providers/`:
- `AuthGuard.tsx` - Session validation wrapper
- `GuestGuard.tsx` - Redirect authenticated users away from auth pages
- `GuardErrorBoundary.tsx` - Error boundary for guards
- `GuardErrorFallback.tsx` - Fallback UI for guard errors

**Key adaptations:**
- Replace `@/features/account/account-settings-provider` with local equivalent or remove if not needed
- Update import paths from `@/providers/` to relative paths

---

## Step 2: Create Auth Routes (2 min)

```bash
# Create auth route directories
mkdir -p apps/todox/src/app/auth/{sign-in,sign-up,reset-password,request-reset-password}
```

Each auth route follows this pattern:

**`page.tsx`:**
```tsx
import { SignInView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Sign in - ${serverEnv.app.name}`
});

export default function SignInPage() {
  return <SignInView />;
}
```

**`layout.tsx`:**
```tsx
"use client";
import { GuestGuard } from "@/providers/GuestGuard";
// ... wrap children with GuestGuard
```

---

## Step 3: Wrap Main Page with AuthGuard (1 min)

Update `apps/todox/src/app/page.tsx`:

```tsx
// Before: hardcoded user
const user = { name: "John Doe", email: "john@example.com", avatar: "/logo.avif" };

// After: use session
import { AuthGuard } from "@/providers/AuthGuard";
import { useGetSession } from "@beep/iam-client/clients/session";

// Wrap content with AuthGuard and get user from session
```

---

## Verification

```bash
bun run check --filter @beep/todox
bun run lint --filter @beep/todox
```

---

## Next Steps

For detailed implementation with all edge cases, see [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md).
