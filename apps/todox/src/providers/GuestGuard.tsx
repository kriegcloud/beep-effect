"use client";

import { Core } from "@beep/iam-client";
import { GuardErrorBoundary } from "@beep/todox/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@beep/todox/providers/GuardErrorFallback";
import { useIsClient, useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { Result } from "@effect-atom/atom-react";
import * as O from "effect/Option";
import React from "react";

/**
 * GuestGuard uses a render prop pattern to defer children evaluation.
 * This is critical because React evaluates children JSX BEFORE the parent decides to render.
 * Without deferral, hooks in children would be called during pendingFallback states,
 * causing "Rendered fewer hooks than expected" errors.
 */
type GuestGuardProps = {
  /** Function that returns children - defers evaluation until guard decides to show content */
  readonly render: () => React.ReactNode;
  readonly redirectTo?: string | undefined;
  readonly pendingFallback?: React.ReactNode | undefined;
};

type GuestGuardContentProps = GuestGuardProps & {
  readonly router: ReturnType<typeof useRouter>;
};

type GuestState =
  | { readonly _tag: "Loading" }
  | { readonly _tag: "Guest" }
  | { readonly _tag: "Authenticated" }
  | { readonly _tag: "Error" };

/**
 * Inner component that handles session state and renders appropriately.
 * Guests see children (via render prop), authenticated users are redirected.
 */
const GuestGuardContent: React.FC<GuestGuardContentProps> = ({
  render,
  router,
  redirectTo = "/",
  pendingFallback = <SplashScreen />,
}) => {
  const { sessionResult } = Core.Atoms.use();
  const isClient = useIsClient();

  // Derive guest state without side effects
  const guestState: GuestState = React.useMemo(() => {
    if (!isClient) {
      return { _tag: "Loading" };
    }

    return Result.builder(sessionResult)
      .onInitial(() => ({ _tag: "Loading" }) as const)
      .onDefect(() => ({ _tag: "Error" }) as const)
      .onFailure(() => ({ _tag: "Error" }) as const)
      .onSuccess(({ data }) =>
        O.match(data, {
          onNone: () => ({ _tag: "Guest" }) as const,
          onSome: () => ({ _tag: "Authenticated" }) as const,
        })
      )
      .render();
  }, [isClient, sessionResult]);

  // Handle redirect in useEffect to avoid setState during render
  React.useEffect(() => {
    if (guestState._tag === "Authenticated") {
      void router.replace(redirectTo);
    }
  }, [guestState._tag, router, redirectTo]);

  // Render based on guest state
  if (guestState._tag === "Loading" || guestState._tag === "Authenticated") {
    return pendingFallback;
  }

  if (guestState._tag === "Error") {
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

  // Guest state - render children via render prop
  return render();
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
