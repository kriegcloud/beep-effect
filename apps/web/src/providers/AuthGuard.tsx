"use client";
import { useGetSession } from "@beep/iam-sdk/clients/session";
import { paths } from "@beep/shared-domain";
import { useIsClient, useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { AuthAdapterProvider } from "@beep/ui/providers";
import { Result } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import React from "react";
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
        .onDefect(() => <div>an error occurred</div>)
        .onErrorTag("IamError", () => <div>a failure occurred</div>)
        .onSuccess(({ session, user }) => (
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
        ))
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
