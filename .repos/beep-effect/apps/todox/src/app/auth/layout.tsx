"use client";
import { GuestGuard } from "@beep/todox/providers/GuestGuard";
import { AuthSplitLayout } from "@beep/ui/layouts/auth-split/layout";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import type React from "react";

type Props = {
  readonly children: React.ReactNode;
};

export default function SignInLayout({ children }: Props) {
  return (
    <GuestGuard
      pendingFallback={
        <AuthSplitLayout>
          <SplashScreen />
        </AuthSplitLayout>
      }
      render={() => <AuthSplitLayout>{children}</AuthSplitLayout>}
    />
  );
}
