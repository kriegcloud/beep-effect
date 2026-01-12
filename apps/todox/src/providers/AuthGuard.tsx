"use client";

import { client } from "@beep/iam-client/adapters";
import { paths } from "@beep/shared-domain";
import { GuardErrorBoundary } from "@beep/todox/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@beep/todox/providers/GuardErrorFallback";
import { useIsClient, useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { AuthAdapterProvider } from "@beep/ui/providers";
import * as F from "effect/Function";
import * as O from "effect/Option";
import React from "react";

type AuthAdapterProviderProps = React.ComponentProps<typeof AuthAdapterProvider>;

type AuthGuardProps = React.PropsWithChildren<Omit<AuthAdapterProviderProps, "children" | "session">>;

type AuthGuardContentProps = AuthGuardProps & {
  readonly router: ReturnType<typeof useRouter>;
};

const AuthGuardContent: React.FC<AuthGuardContentProps> = ({ children, router, ...props }) => {
  const isClient = useIsClient();
  const { data, isPending, error } = client.useSession();
  if (!isClient) {
    return <SplashScreen />;
  }

  if (isPending) {
    return <SplashScreen />;
  }
  if (!isPending && error) {
    return <div>an error occurred</div>;
  }

  if (!data) {
    return <div>no session found</div>;
  }

  return (
    <AuthAdapterProvider
      {...props}
      session={{
        ...data.user,
        user: {
          role: "beep",
          ...data.user,
          email: data.user.email,
          phoneNumber: F.pipe(
            O.fromNullable(data.user.phoneNumber),
            O.match({
              onNone: () => null,
              onSome: (pn) => pn,
            })
          ),
          username: F.pipe(
            O.fromNullable(data.user.username),
            O.match({
              onNone: () => null,
              onSome: (username) => username,
            })
          ),
          image: F.pipe(
            O.fromNullable(data.user.image),
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
