"use client";

import { AuthCallback, Core } from "@beep/iam-client";
import { GuardErrorBoundary } from "@beep/todox/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@beep/todox/providers/GuardErrorFallback";
import { useIsClient, useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { Result } from "@effect-atom/atom-react";
import * as O from "effect/Option";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

type GuestGuardProps = React.PropsWithChildren<{
  readonly redirectTo?: string | undefined;
  readonly pendingFallback?: React.ReactNode | undefined;
}>;

type GuestGuardContentProps = GuestGuardProps & {
  readonly router: ReturnType<typeof useRouter>;
};

type SessionState =
  | { readonly _tag: "Loading" }
  | { readonly _tag: "Authenticated" }
  | { readonly _tag: "Guest" }
  | { readonly _tag: "Error" };

/**
 * Inner component that uses useSearchParams (which suspends in Next.js 16).
 * Must be wrapped in Suspense.
 */
const GuestGuardContent: React.FC<GuestGuardContentProps> = ({
  children,
  router,
  redirectTo = "/",
  pendingFallback = <SplashScreen />,
}) => {
  const searchParams = useSearchParams();
  const callbackTarget = AuthCallback.getURL(searchParams);
  const redirectTarget = callbackTarget === AuthCallback.defaultTarget ? redirectTo : callbackTarget;

  const { sessionResult } = Core.Atoms.use();
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
      .onSuccess(({ data }: Core.GetSession.Success) =>
        O.match(data, {
          onNone: () => ({ _tag: "Guest" }) as const,
          onSome: () => ({ _tag: "Authenticated" }) as const,
        })
      )
      .render();
  }, [isClient, sessionResult]);

  // Handle redirect in useEffect to avoid setState during render
  React.useEffect(() => {
    if (sessionState._tag === "Authenticated") {
      void router.replace(redirectTarget);
    }
  }, [sessionState._tag, router, redirectTarget]);

  // Render based on session state
  if (sessionState._tag === "Loading" || sessionState._tag === "Authenticated") {
    return <>{pendingFallback}</>;
  }

  if (sessionState._tag === "Error") {
    return (
      <GuardErrorFallback
        title="We couldn't confirm your sign-in status"
        description="Please try again or head back to the app."
        primaryAction={{
          label: "Retry",
          variant: "contained",
          onClick: () => {
            router.refresh();
          },
        }}
        secondaryAction={{
          label: "Go to app",
          onClick: () => {
            void router.replace(redirectTo);
          },
        }}
      />
    );
  }

  // sessionState._tag === "Guest" - show children (guest content)
  return <>{children}</>;
};

export const GuestGuard: React.FC<GuestGuardProps> = (props) => {
  const { redirectTo = "/", pendingFallback = <SplashScreen />, ...rest } = props;
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
      {/* Suspense boundary required for useSearchParams() in Next.js 16 */}
      <Suspense fallback={pendingFallback}>
        <GuestGuardContent
          router={router}
          redirectTo={redirectTo}
          pendingFallback={pendingFallback}
          {...rest}
        />
      </Suspense>
    </GuardErrorBoundary>
  );
};
