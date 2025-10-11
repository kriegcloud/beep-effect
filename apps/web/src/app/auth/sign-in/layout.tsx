"use client";

import { AuthSplitLayout } from "@beep/ui/layouts/auth-split";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import type React from "react";
import { GuestGuard } from "@/providers/GuestGuard";

type Props = {
  children: React.ReactNode;
};

const SignInLayout: React.FC<Props> = ({ children }) => {
  return (
    <GuestGuard
      pendingFallback={
        <AuthSplitLayout
          slotProps={{
            section: { title: "Hey there! Welcome back." },
          }}
        >
          <SplashScreen portal={false} />
        </AuthSplitLayout>
      }
    >
      <AuthSplitLayout
        slotProps={{
          section: { title: "Hey there! Welcome back." },
        }}
      >
        {children}
      </AuthSplitLayout>
    </GuestGuard>
  );
};

export default SignInLayout;
