import { AuthSplitLayout } from "@beep/ui/layouts/auth-split";
import type React from "react";

type Props = {
  children: React.ReactNode;
};

const SignInLayout: React.FC<Props> = ({ children }) => {
  return (
    <AuthSplitLayout
      slotProps={{
        section: { title: "Hey there! Welcome back." },
      }}
    >
      {children}
    </AuthSplitLayout>
  );
};

export default SignInLayout;
