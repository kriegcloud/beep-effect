"use client";
import { Core } from "@beep/iam-client";
import { paths } from "@beep/shared-domain";
import { useIsClient, useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { AuthAdapterProvider } from "@beep/ui/providers";
import { thunkNull } from "@beep/utils";
import { Result } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import React from "react";
import { AccountSettingsProvider } from "@/features/account/account-settings-provider";
import { GuardErrorBoundary } from "@/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@/providers/GuardErrorFallback";

type AuthAdapterProviderProps = React.ComponentProps<typeof AuthAdapterProvider>;

type AuthGuardProps = React.PropsWithChildren<Omit<AuthAdapterProviderProps, "children" | "session">>;

type AuthGuardContentProps = AuthGuardProps & {
  readonly router: ReturnType<typeof useRouter>;
};

type SessionState =
  | { readonly _tag: "Loading" }
  | { readonly _tag: "Unauthenticated" }
  | { readonly _tag: "Error" }
  | { readonly _tag: "Authenticated"; readonly session: Core.GetSession.SessionData };

const AuthGuardContent: React.FC<AuthGuardContentProps> = ({ children, router, ...props }) => {
  const { sessionResult } = Core.useCore();
  const isClient = useIsClient();

  // Derive session state without side effects
  const sessionState: SessionState = React.useMemo(() => {
    if (!isClient) {
      return { _tag: "Loading" };
    }

    return Result.builder(sessionResult)
      .onInitial(() => ({ _tag: "Loading" }) as const)
      .onDefect(() => ({ _tag: "Error" }) as const)
      .onFailure(() => ({ _tag: "Error" }) as const)
      .onSuccess(({ data }) =>
        O.match(data, {
          onNone: () => ({ _tag: "Unauthenticated" }) as const,
          onSome: (sessionData) =>
            ({
              _tag: "Authenticated",
              session: sessionData,
            }) as const,
        })
      )
      .render();
  }, [isClient, sessionResult]);

  // Handle redirect in useEffect to avoid setState during render
  React.useEffect(() => {
    if (sessionState._tag === "Unauthenticated") {
      void router.replace(paths.auth.signIn);
    }
  }, [sessionState._tag, router]);

  // Render based on session state
  if (sessionState._tag === "Loading" || sessionState._tag === "Unauthenticated") {
    return <SplashScreen />;
  }

  if (sessionState._tag === "Error") {
    return <div>an error occurred</div>;
  }

  const { session, user } = sessionState.session;

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
              onNone: thunkNull,
              onSome: Redacted.value,
            })
          ),
          username: F.pipe(
            user.username,
            O.match({
              onNone: thunkNull,
              onSome: (username) => username,
            })
          ),
          image: F.pipe(
            user.image,
            O.match({
              onNone: thunkNull,
              onSome: (image) => image,
            })
          ),
        },
      }}
    >
      <AccountSettingsProvider userInfo={user}>{children}</AccountSettingsProvider>
    </AuthAdapterProvider>
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
    <GuardErrorBoundary
      fallback={fallback}
      onReset={() => {
        router.refresh();
      }}
    >
      <AuthGuardContent router={router} {...props}>
        {children}
      </AuthGuardContent>
    </GuardErrorBoundary>
  );
};
