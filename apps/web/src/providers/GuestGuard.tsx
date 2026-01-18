"use client";

import { Core } from "@beep/iam-client";
import { paths } from "@beep/shared-domain";
import { useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { Result } from "@effect-atom/atom-react";
import * as O from "effect/Option";
import React from "react";
import { GuardErrorBoundary } from "@/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@/providers/GuardErrorFallback";

type GuestGuardProps = React.PropsWithChildren<{
  readonly redirectTo?: string | undefined;
  readonly pendingFallback?: React.ReactNode | undefined;
}>;

type GuestGuardContentProps = GuestGuardProps & {};

const GuestGuardContent: React.FC<GuestGuardContentProps> = ({
  children,
  redirectTo = paths.dashboard.root,
  pendingFallback = <SplashScreen />,
}) => {
  const { sessionResult } = Core.Atoms.use();
  const router = useRouter();

  const Fallback = (
    <GuardErrorFallback
      title="We couldn’t confirm your sign-in status"
      description="Please try again or head back to the dashboard."
      primaryAction={{
        label: "Retry",
        variant: "contained",
        onClick: () => {
          router.refresh();
        },
      }}
      secondaryAction={{
        label: "Go to dashboard",
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
        onNone: () => pendingFallback,
        onSome: () => children,
      })
    )
    .render();
};

export const GuestGuard: React.FC<GuestGuardProps> = (props) => {
  const { redirectTo = paths.dashboard.root, ...rest } = props;
  const router = useRouter();

  const fallback = React.useCallback(
    ({ reset }: { reset: () => void }) => (
      <GuardErrorFallback
        title="We couldn’t confirm your sign-in status"
        description="Please try again or head back to the dashboard."
        primaryAction={{
          label: "Retry",
          variant: "contained",
          onClick: () => {
            reset();
            router.refresh();
          },
        }}
        secondaryAction={{
          label: "Go to dashboard",
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
