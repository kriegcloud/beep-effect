"use client";

import { Core } from "@beep/iam-client";
import { paths } from "@beep/shared-domain";
import { useIsClient, useRouter } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { Result } from "@effect-atom/atom-react";
import * as O from "effect/Option";
import React from "react";
import { GuardErrorBoundary } from "@/providers/GuardErrorBoundary";
import { GuardErrorFallback } from "@/providers/GuardErrorFallback";

type GuestGuardProps = {
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

const GuestGuardContent: React.FC<GuestGuardContentProps> = ({
  render,
  router,
  redirectTo = paths.dashboard.root,
  pendingFallback = <SplashScreen />,
}) => {
  const { sessionResult } = Core.Atoms.use();
  const isClient = useIsClient();

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

  React.useEffect(() => {
    if (guestState._tag === "Authenticated") {
      void router.replace(redirectTo);
    }
  }, [guestState._tag, router, redirectTo]);

  if (guestState._tag === "Loading" || guestState._tag === "Authenticated") {
    return pendingFallback;
  }

  if (guestState._tag === "Error") {
    return (
      <GuardErrorFallback
        title="We couldn't confirm your sign-in status"
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
  }

  return render();
};

export const GuestGuard: React.FC<GuestGuardProps> = (props) => {
  const { redirectTo = paths.dashboard.root, ...rest } = props;
  const router = useRouter();

  const fallback = React.useCallback(
    ({ reset }: { reset: () => void }) => (
      <GuardErrorFallback
        title="We couldn't confirm your sign-in status"
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
      <GuestGuardContent router={router} redirectTo={redirectTo} {...rest} />
    </GuardErrorBoundary>
  );
};
