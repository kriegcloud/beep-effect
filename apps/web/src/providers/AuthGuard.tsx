"use client";

import { client } from "@beep/iam-sdk/adapters/better-auth/client";
import { paths } from "@beep/shared-domain";
import { useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { AuthAdapterProvider } from "@beep/ui/providers";
import React from "react";
import { GuardErrorBoundary } from "@/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@/providers/GuardErrorFallback";

type AuthAdapterProviderProps = React.ComponentProps<typeof AuthAdapterProvider>;

type AuthGuardProps = React.PropsWithChildren<Omit<AuthAdapterProviderProps, "children" | "session">>;

type AuthGuardContentProps = AuthGuardProps & {
  readonly router: ReturnType<typeof useRouter>;
};

const AuthGuardContent: React.FC<AuthGuardContentProps> = ({ children, router, ...props }) => {
  const { data: session, isPending, error, refetch } = client.useSession();
  const [hasRefetched, setHasRefetched] = React.useState(false);

  React.useEffect(() => {
    client.$store.notify("$sessionSignal");
  }, []);

  React.useEffect(() => {
    if (!isPending && !session && !hasRefetched) {
      setHasRefetched(true);
      refetch();
    }
  }, [hasRefetched, isPending, refetch, session]);

  React.useEffect(() => {
    if (!isPending && !session && hasRefetched) {
      void router.replace(paths.auth.signIn);
    }
  }, [hasRefetched, isPending, session, router]);

  if (error) {
    throw error instanceof Error ? error : new Error("Failed to resolve authenticated session");
  }

  if (isPending) {
    return <SplashScreen />;
  }

  if (!session) {
    return <SplashScreen />;
  }

  return (
    <AuthAdapterProvider {...props} session={session}>
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
