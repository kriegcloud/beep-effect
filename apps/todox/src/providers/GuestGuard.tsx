"use client";

import { Core } from "@beep/iam-client";
import { GuardErrorBoundary } from "@beep/todox/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@beep/todox/providers/GuardErrorFallback";
import { useRouter } from "@beep/ui/hooks";
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

type GuestGuardContentProps = GuestGuardProps;

/**
 * Inner component that handles session state and renders appropriately.
 * Guests see children (via render prop), authenticated users are redirected.
 */
const GuestGuardContent: React.FC<GuestGuardContentProps> = ({
  render,
  redirectTo = "/",
  pendingFallback = <SplashScreen />,
}) => {
  const { sessionResult } = Core.Atoms.use();
  const router = useRouter();

  const Fallback = (
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

  return Result.builder(sessionResult)
    .onInitial(() => pendingFallback)
    .onFailure(() => Fallback)
    .onDefect(() => Fallback)
    .onSuccess(({ data }) =>
      O.match(data, {
        onNone: () => render(), // Guest (no session) - call render to evaluate children
        onSome: () => {
          // Authenticated - redirect away from guest-only page
          void router.replace(redirectTo);
          return pendingFallback;
        },
      })
    )
    .render();
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
      <GuestGuardContent redirectTo={redirectTo} {...rest} />
    </GuardErrorBoundary>
  );
};
