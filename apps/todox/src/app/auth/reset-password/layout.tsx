"use client";

import { GuestGuard } from "@beep/todox/providers/GuestGuard";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import type React from "react";

type Props = {
  readonly children: React.ReactNode;
};

export default function ResetPasswordLayout({ children }: Props) {
  return <GuestGuard pendingFallback={<SplashScreen />}>{children}</GuestGuard>;
}
