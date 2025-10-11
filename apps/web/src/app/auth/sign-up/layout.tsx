import { AuthSplitLayout } from "@beep/ui/layouts/auth-split";
import type React from "react";
import { GuestGuard } from "@/providers/GuestGuard";

type Props = {
  children: React.ReactNode;
};

const SignUpLayout: React.FC<Props> = ({ children }) => {
  return (
    <GuestGuard>
      <AuthSplitLayout>{children}</AuthSplitLayout>
    </GuestGuard>
  );
};

export default SignUpLayout;
