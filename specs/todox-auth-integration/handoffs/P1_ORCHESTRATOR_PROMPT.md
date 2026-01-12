# todox-auth-integration P1 Orchestrator

> Execution prompt for Phase 1 implementation.

---

## Context

You are implementing better-auth integration for `apps/todox`. The infrastructure exists in `packages/iam/*` and a working reference is in `apps/web`.

**Critical:** Follow Effect patterns - namespace imports, no native array/string methods.

---

## Phase 1 Tasks

Execute in order:

### Task 1: Create Provider Files

Create these files in `apps/todox/src/providers/`:

```
1. GuardErrorBoundary.tsx
2. GuardErrorFallback.tsx
3. AuthGuard.tsx
4. GuestGuard.tsx
```

**Reference code:** See `specs/todox-auth-integration/MASTER_ORCHESTRATION.md` Phase 1.

**Adapt from:** `apps/web/src/providers/` (remove AccountSettingsProvider from AuthGuard).

### Task 2: Create Auth Routes

Create directory structure:
```bash
mkdir -p apps/todox/src/app/auth/{sign-in,sign-up,reset-password,request-reset-password}
```

For each route, create `page.tsx` and `layout.tsx`:

| Route                  | View Component           |
|------------------------|--------------------------|
| sign-in                | SignInView               |
| sign-up                | SignUpView               |
| reset-password         | ResetPasswordView        |
| request-reset-password | RequestResetPasswordView |

**Reference code:** See `specs/todox-auth-integration/MASTER_ORCHESTRATION.md` Phase 2.

### Task 3: Update Main Page

Modify `apps/todox/src/app/page.tsx`:

1. Import AuthGuard from `@/providers/AuthGuard`
2. Import useSession from `@beep/ui/providers/auth-adapter-provider`
3. Wrap the Page component content with AuthGuard
4. Replace hardcoded `user` object with session data

**Before:**
```tsx
const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "/logo.avif",
};
```

**After:**
```tsx
const { session } = useSession();
const user = {
  name: session?.user.name ?? "User",
  email: session?.user.email ?? "",
  avatar: session?.user.image ?? "/logo.avif",
};
```

---

## Verification

After each task:
```bash
bun run check --filter @beep/todox
```

After all tasks:
```bash
bun run lint --filter @beep/todox
bun run build --filter @beep/todox
```

---

## Critical Rules

1. **NEVER use async/await** - All Effect code uses generators
2. **ALWAYS use namespace imports** - `import * as Effect from "effect/Effect"`
3. **Use Effect utilities** - `F.pipe`, `O.match`, `A.map` instead of native methods
4. **Preserve existing code** - Only modify what's necessary
5. **Type safety** - No `any`, no `@ts-ignore`

---

## Success Output

When complete:
1. Auth routes accessible at `/auth/sign-in`, `/auth/sign-up`, etc.
2. Main page protected by AuthGuard
3. User info from session displayed in TopNavbar
4. All type checks pass

---

## Post-Execution

Update `specs/todox-auth-integration/REFLECTION_LOG.md` with learnings.

If issues remain, create `HANDOFF_P2.md` with:
- Completed tasks
- Remaining work
- Adjustments needed
