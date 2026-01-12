# todox-auth-integration: Reflection Log

> Cumulative learnings from each execution phase.

---

## Reflection Protocol

After each phase, answer:
1. **What worked well?** (Keep doing)
2. **What didn't work?** (Stop doing)
3. **What to add?** (Start doing)
4. **Prompt refinements?** (Improve prompts)
5. **Codebase-specific insights?** (Document patterns)

---

## Reflection Entries

### 2025-01-12 - Phase 0: Initial Analysis

#### Context Gathered
- `apps/todox` already has `IamProvider` integrated in `global-providers.tsx`
- The main gap is guard providers and auth routes
- Pattern from `apps/web` is well-established and should be followed closely
- Session handling uses `@beep/iam-client/clients/session` with `useGetSession` hook

#### Key Patterns Identified
1. **Guard Pattern**: `AuthGuard` uses `useGetSession` hook + `Result.builder` pattern
2. **Error Handling**: `GuardErrorBoundary` + `GuardErrorFallback` for graceful failures
3. **Session Signal**: `client.$store.notify("$sessionSignal")` triggers session updates
4. **Callback URLs**: `AuthCallback.getURL(searchParams)` handles post-auth redirects

#### Files to Create
1. `apps/todox/src/providers/AuthGuard.tsx`
2. `apps/todox/src/providers/GuestGuard.tsx`
3. `apps/todox/src/providers/GuardErrorBoundary.tsx`
4. `apps/todox/src/providers/GuardErrorFallback.tsx`
5. `apps/todox/src/app/auth/sign-in/page.tsx`
6. `apps/todox/src/app/auth/sign-in/layout.tsx`
7. `apps/todox/src/app/auth/sign-up/page.tsx`
8. `apps/todox/src/app/auth/sign-up/layout.tsx`
9. `apps/todox/src/app/auth/reset-password/page.tsx`
10. `apps/todox/src/app/auth/reset-password/layout.tsx`
11. `apps/todox/src/app/auth/request-reset-password/page.tsx`
12. `apps/todox/src/app/auth/request-reset-password/layout.tsx`

#### Modifications Needed
1. `apps/todox/src/app/page.tsx` - Replace hardcoded user with session data
2. Wrap main content with `AuthGuard`

---

### 2025-01-12 - Phase 1: Guard Infrastructure & Auth Routes

#### What Worked Well

1. **Following web reference closely** - Using `apps/web/src/providers/` as template was efficient
2. **Module aliasing** - Using `@beep/todox/*` instead of `@/` matched existing codebase patterns
3. **Effect import conventions** - Namespace imports (`import * as F from "effect/Function"`) worked correctly
4. **Biome auto-fix** - Import reordering handled automatically

#### What Didn't Work

1. **Initial useSession import path** - Spec referenced `@beep/ui/providers/auth-adapter-provider` but actual hook is `useAuthAdapterProvider` from `@beep/ui/providers`
2. **AuthGuard props underspecified** - Spec omitted that `AuthAdapterProvider` requires many props (signOut, switchAccount, switchOrganization, userOrgs, userAccounts, notifications, workspaces, contacts)
3. **GuestGuard unused import** - Copied `paths` import from web version but didn't need it (caused lint error)

#### What to Add

1. **Mock data pattern** - For Phase 1, providing stub/mock data for AuthAdapterProvider props was necessary
2. **React.Suspense wrapper** - Required around AuthGuard for proper async handling
3. **Middleware (proxy.ts)** - Needed for server-side route protection (deferred to Phase 2)

#### Prompt Refinements

1. **Clarify AuthAdapterProvider props** - Future specs should list all required props explicitly
2. **Specify hook paths exactly** - Use `useAuthAdapterProvider` from `@beep/ui/providers` (not a subdirectory path)
3. **Include mock data templates** - Provide boilerplate for AuthAdapterProvider props

#### Codebase-specific Insights

1. **Todox uses `@beep/todox/*` paths** - Not `@/` like some Next.js apps
2. **AuthAdapterProvider is heavy** - Requires 8+ props beyond session; plan for proper implementations in Phase 2+
3. **Session access pattern** - `useAuthAdapterProvider().session` provides the session object
4. **Biome import ordering** - Will auto-reorder imports on lint:fix

---

## Accumulated Improvements

### Import Path Corrections
- `useAuthAdapterProvider` from `@beep/ui/providers` (not `auth-adapter-provider` subdirectory)
- Local providers use `@beep/todox/providers/` prefix

### Required AuthGuard Props
```typescript
<AuthGuard
  signOut={signOut}
  switchAccount={async () => { /* stub */ }}
  switchOrganization={async () => { /* stub */ }}
  userOrgs={[]}
  userAccounts={[]}
  notifications={[]}
  workspaces={[]}
  contacts={[]}
>
```

### Session Access Pattern
```typescript
const { session } = useAuthAdapterProvider();
const user = {
  name: session?.user.name ?? "User",
  email: session?.user.email ?? "",
  avatar: session?.user.image ?? "/logo.avif",
};
```

---

## Lessons Learned Summary

1. **Reference implementations are gold** - Always read actual web implementations, not just spec snippets
2. **Type errors reveal integration gaps** - Running `bun run check` early catches missing props
3. **Mock data is acceptable for Phase 1** - Real implementations can come in subsequent phases
4. **Biome handles import ordering** - Don't spend time manually ordering imports
