"use client";

import { AuthCallback } from "@beep/iam-client";
import { client } from "@beep/iam-client/adapters/better-auth/client";
import { GuardErrorBoundary } from "@beep/todox/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@beep/todox/providers/GuardErrorFallback";
import { useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { useSearchParams } from "next/navigation";
import React from "react";

type GuestGuardProps = React.PropsWithChildren<{
  readonly redirectTo?: string | undefined;
  readonly pendingFallback?: React.ReactNode | undefined;
}>;

type GuestGuardContentProps = GuestGuardProps & {
  readonly router: ReturnType<typeof useRouter>;
};

const GuestGuardContent: React.FC<GuestGuardContentProps> = ({
  children,
  router,
  redirectTo = "/",
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
    <GuardErrorBoundary
      fallback={fallback}
      onReset={() => {
        router.refresh();
      }}
    >
      <GuestGuardContent router={router} redirectTo={redirectTo} {...rest} />
    </GuardErrorBoundary>
  );
};
