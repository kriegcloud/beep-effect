# todox-auth-integration: Master Orchestration

> Complete workflow for integrating better-auth into apps/todox.

---

## Overview

This spec adds authentication to `apps/todox` by:
1. Creating guard providers (AuthGuard, GuestGuard)
2. Adding auth routes that use `@beep/iam-ui` views
3. Replacing hardcoded user with session data
4. Wiring up proper redirect flows

---

## Phase 1: Guard Infrastructure

### Task 1.1: Create GuardErrorBoundary

**File:** `apps/todox/src/providers/GuardErrorBoundary.tsx`

**Reference:** `apps/web/src/providers/GuardErrorBoundary.tsx`

```tsx
"use client";

import * as React from "react";

type Props = {
  readonly children: React.ReactNode;
  readonly fallback: (props: { readonly error: Error; readonly reset: () => void }) => React.ReactNode;
  readonly onReset?: undefined | (() => void);
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class GuardErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback({
        error: this.state.error,
        reset: this.reset,
      });
    }
    return this.props.children;
  }
}
```

### Task 1.2: Create GuardErrorFallback

**File:** `apps/todox/src/providers/GuardErrorFallback.tsx`

Simplified fallback for todox (can be styled differently from apps/web):

```tsx
"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  readonly title: string;
  readonly description: string;
  readonly primaryAction: {
    readonly label: string;
    readonly onClick: () => void;
    readonly variant?: undefined | "contained" | "outlined";
  };
  readonly secondaryAction?: undefined | {
    readonly label: string;
    readonly onClick: () => void;
    readonly variant?: "contained" | "outlined" | undefined;
  };
};

export const GuardErrorFallback: React.FC<Props> = ({
                                                      title,
                                                      description,
                                                      primaryAction,
                                                      secondaryAction,
                                                    }) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{minHeight: "100vh", p: 3, textAlign: "center"}}
    >
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{mb: 3}}>
        {description}
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button
          variant={primaryAction.variant ?? "contained"}
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </Button>
        {secondaryAction && (
          <Button
            variant={secondaryAction.variant ?? "outlined"}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
```

### Task 1.3: Create AuthGuard

**File:** `apps/todox/src/providers/AuthGuard.tsx`

**Reference:** `apps/web/src/providers/AuthGuard.tsx`

Key patterns:
- Use `useGetSession()` from `@beep/iam-client/clients/session`
- Use `Result.builder()` from `@effect-atom/atom-react`
- Provide session to `AuthAdapterProvider` from `@beep/ui/providers`
- Handle redirection on auth failure

```tsx
"use client";

import { useGetSession } from "@beep/iam-client/clients/session";
import { paths } from "@beep/shared-domain";
import { useIsClient, useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { AuthAdapterProvider } from "@beep/ui/providers";
import { Result } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as React from "react";
import { GuardErrorBoundary } from "@/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@/providers/GuardErrorFallback";

type AuthAdapterProviderProps = React.ComponentProps<typeof AuthAdapterProvider>;
type AuthGuardProps = React.PropsWithChildren<Omit<AuthAdapterProviderProps, "children" | "session">>;

type AuthGuardContentProps = AuthGuardProps & {
  readonly router: ReturnType<typeof useRouter>;
};

const AuthGuardContent: React.FC<AuthGuardContentProps> = ({ children, router, ...props }) => {
  const { sessionResult } = useGetSession();
  const isClient = useIsClient();

  if (!isClient) {
    return <SplashScreen />;
  }

  return (
    <>
      {Result.builder(sessionResult)
        .onInitial(() => <SplashScreen />)
        .onDefect(() => <div>An error occurred</div>)
        .onErrorTag("IamError", () => <div>A failure occurred</div>)
        .onSuccess(({ session, user }) => {
          return (
            <AuthAdapterProvider
              {...props}
              session={{
                ...session,
                user: {
                  ...user,
                  email: Redacted.value(user.email),
                  phoneNumber: F.pipe(
                    user.phoneNumber,
                    O.match({
                      onNone: () => null,
                      onSome: (pn) => Redacted.value(pn),
                    })
                  ),
                  username: F.pipe(
                    user.username,
                    O.match({
                      onNone: () => null,
                      onSome: (username) => username,
                    })
                  ),
                  image: F.pipe(
                    user.image,
                    O.match({
                      onNone: () => null,
                      onSome: (image) => image,
                    })
                  ),
                },
              }}
            >
              {children}
            </AuthAdapterProvider>
          );
        })
        .render()}
    </>
  );
};

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, ...props }) => {
  const router = useRouter();

  const fallback = React.useCallback(
    ({ reset }: { reset: () => void }) => (
      <GuardErrorFallback
        title="We hit a snag verifying your session"
        description="Please sign in again so we can restore your workspace."
        primaryAction={{
          label: "Go to sign in",
          onClick: () => {
            reset();
            void router.replace(paths.auth.signIn);
          },
        }}
        secondaryAction={{
          label: "Try again",
          variant: "outlined",
          onClick: () => {
            reset();
            router.refresh();
          },
        }}
      />
    ),
    [router]
  );

  return (
    <GuardErrorBoundary fallback={fallback} onReset={() => router.refresh()}>
      <AuthGuardContent router={router} {...props}>
        {children}
      </AuthGuardContent>
    </GuardErrorBoundary>
  );
};
```

### Task 1.4: Create GuestGuard

**File:** `apps/todox/src/providers/GuestGuard.tsx`

**Reference:** `apps/web/src/providers/GuestGuard.tsx`

Key patterns:
- Use `client.useSession()` from `@beep/iam-client/adapters/better-auth/client`
- Use `AuthCallback.getURL(searchParams)` for redirect handling
- Notify `$sessionSignal` on mount

```tsx
"use client";

import { AuthCallback } from "@beep/iam-client";
import { client } from "@beep/iam-client/adapters/better-auth/client";
import { paths } from "@beep/shared-domain";
import { useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { GuardErrorBoundary } from "@/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@/providers/GuardErrorFallback";

type GuestGuardProps = React.PropsWithChildren<{
  readonly redirectTo?: undefined | string;
  readonly pendingFallback?: undefined | React.ReactNode;
}>;

type GuestGuardContentProps = GuestGuardProps & {
  readonly router: ReturnType<typeof useRouter>;
};

const GuestGuardContent: React.FC<GuestGuardContentProps> = ({
  children,
  router,
  redirectTo = paths.dashboard.root,
  pendingFallback = <SplashScreen />,
}) => {
  const searchParams = useSearchParams();
  const callbackTarget = AuthCallback.getURL(searchParams);
  const redirectTarget = callbackTarget === AuthCallback.defaultTarget ? redirectTo : callbackTarget;
  const { data: session, isPending, error, refetch } = client.useSession();
  const [hasRefetched, setHasRefetched] = React.useState(false);

  React.useEffect(() => {
    client.$store.notify("$sessionSignal");
  }, []);

  React.useEffect(() => {
    if (!isPending && !session && !hasRefetched) {
      setHasRefetched(true);
      void refetch();
    }
  }, [hasRefetched, isPending, refetch, session]);

  React.useEffect(() => {
    if (!isPending && session) {
      void router.replace(redirectTarget);
    }
  }, [isPending, session, redirectTarget, router]);

  if (error) {
    throw error instanceof Error ? error : new Error("Failed to resolve anonymous session");
  }

  if (isPending) {
    return <>{pendingFallback}</>;
  }

  if (session) {
    return <>{pendingFallback}</>;
  }

  return <>{children}</>;
};

export const GuestGuard: React.FC<GuestGuardProps> = (props) => {
  const { redirectTo = "/", ...rest } = props;
  const router = useRouter();

  const fallback = React.useCallback(
    ({ reset }: { reset: () => void }) => (
      <GuardErrorFallback
        title="We couldn't confirm your sign-in status"
        description="Please try again or head back to the app."
        primaryAction={{
          label: "Retry",
          variant: "contained",
          onClick: () => {
            reset();
            router.refresh();
          },
        }}
        secondaryAction={{
          label: "Go to app",
          onClick: () => {
            reset();
            void router.replace(redirectTo);
          },
        }}
      />
    ),
    [redirectTo, router]
  );

  return (
    <GuardErrorBoundary fallback={fallback} onReset={() => router.refresh()}>
      <GuestGuardContent router={router} redirectTo={redirectTo} {...rest} />
    </GuardErrorBoundary>
  );
};
```

---

## Phase 2: Auth Routes

### Task 2.1: Sign In Route

**`apps/todox/src/app/auth/sign-in/page.tsx`:**
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

**`apps/todox/src/app/auth/sign-in/layout.tsx`:**
```tsx
"use client";

import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import type React from "react";
import { GuestGuard } from "@/providers/GuestGuard";

type Props = {
  readonly children: React.ReactNode;
};

export default function SignInLayout({ children }: Props) {
  return (
    <GuestGuard pendingFallback={<SplashScreen />}>
      {children}
    </GuestGuard>
  );
}
```

### Task 2.2: Sign Up Route

**`apps/todox/src/app/auth/sign-up/page.tsx`:**
```tsx
import { SignUpView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Sign up - ${serverEnv.app.name}`
});

export default function SignUpPage() {
  return <SignUpView />;
}
```

**`apps/todox/src/app/auth/sign-up/layout.tsx`:**
```tsx
"use client";

import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import type React from "react";
import { GuestGuard } from "@/providers/GuestGuard";

type Props = {
  readonly children: React.ReactNode;
};

export default function SignUpLayout({ children }: Props) {
  return (
    <GuestGuard pendingFallback={<SplashScreen />}>
      {children}
    </GuestGuard>
  );
}
```

### Task 2.3: Reset Password Route

**`apps/todox/src/app/auth/reset-password/page.tsx`:**
```tsx
import { ResetPasswordView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Reset password - ${serverEnv.app.name}`
});

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
```

**`apps/todox/src/app/auth/reset-password/layout.tsx`:**
```tsx
"use client";

import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import type React from "react";
import { GuestGuard } from "@/providers/GuestGuard";

type Props = {
  readonly children: React.ReactNode;
};

export default function ResetPasswordLayout({ children }: Props) {
  return (
    <GuestGuard pendingFallback={<SplashScreen />}>
      {children}
    </GuestGuard>
  );
}
```

### Task 2.4: Request Reset Password Route

**`apps/todox/src/app/auth/request-reset-password/page.tsx`:**
```tsx
import { RequestResetPasswordView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Request password reset - ${serverEnv.app.name}`
});

export default function RequestResetPasswordPage() {
  return <RequestResetPasswordView />;
}
```

**`apps/todox/src/app/auth/request-reset-password/layout.tsx`:**
```tsx
"use client";

import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import type React from "react";
import { GuestGuard } from "@/providers/GuestGuard";

type Props = {
  readonly children: React.ReactNode;
};

export default function RequestResetPasswordLayout({ children }: Props) {
  return (
    <GuestGuard pendingFallback={<SplashScreen />}>
      {children}
    </GuestGuard>
  );
}
```

---

## Phase 3: Main Page Integration

### Task 3.1: Create Authenticated Page Wrapper

The main page needs to:
1. Be wrapped with `AuthGuard`
2. Replace hardcoded `user` with session data
3. Handle loading/error states

**Option A: Layout-based wrapping**

Create `apps/todox/src/app/(authenticated)/layout.tsx`:
```tsx
"use client";

import type React from "react";
import { AuthGuard } from "@/providers/AuthGuard";

type Props = {
  readonly children: React.ReactNode;
};

export default function AuthenticatedLayout({ children }: Props) {
  return <AuthGuard>{children}</AuthGuard>;
}
```

Then move `page.tsx` to `(authenticated)/page.tsx`.

**Option B: In-page wrapping**

Modify `apps/todox/src/app/page.tsx` directly to include `AuthGuard`.

### Task 3.2: Replace Hardcoded User

**Current (lines 30-34):**
```tsx
const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "/logo.avif",
};
```

**After:**
```tsx
import { useSession } from "@beep/ui/providers/auth-adapter-provider";

function Page() {
  const { session } = useSession();
  const user = {
    name: session?.user.name ?? "User",
    email: session?.user.email ?? "",
    avatar: session?.user.image ?? "/logo.avif",
  };
  // ... rest of component
}
```

---

## Verification Commands

```bash
# Type checking
bun run check --filter @beep/todox

# Linting
bun run lint --filter @beep/todox

# Full build
bun run build --filter @beep/todox
```

---

## Execution Order

| Phase | Tasks                           | Depends On |
|-------|---------------------------------|------------|
| 1     | Guard infrastructure (1.1-1.4)  | None       |
| 2     | Auth routes (2.1-2.4)           | Phase 1    |
| 3     | Main page integration (3.1-3.2) | Phase 1    |

Phases 2 and 3 can be executed in parallel after Phase 1 completes.

---

## Notes for Execution

1. **Import paths**: Use `@/providers/` alias (configure in tsconfig if needed)
2. **paths object**: Verify `paths.auth.signIn` exists in `@beep/shared-domain`, or use string literals
3. **SplashScreen**: May need customization for todox styling
4. **AccountSettingsProvider**: Omitted from todox (web-specific feature)
