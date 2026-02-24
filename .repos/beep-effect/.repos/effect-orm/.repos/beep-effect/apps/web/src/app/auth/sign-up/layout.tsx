"use client";

import { AuthSplitLayout } from "@beep/ui/layouts/auth-split";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import type React from "react";
import { GuestGuard } from "@/providers/GuestGuard";

type Props = {
  children: React.ReactNode;
};

const SignUpLayout: React.FC<Props> = ({ children }) => {
  return (
    <GuestGuard
      pendingFallback={
        <AuthSplitLayout>
          <SplashScreen portal={false} />
        </AuthSplitLayout>
      }
    >
      <AuthSplitLayout>{children}</AuthSplitLayout>
    </GuestGuard>
  );
};

export default SignUpLayout;
