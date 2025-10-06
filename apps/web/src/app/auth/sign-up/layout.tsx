import { AuthSplitLayout } from "@beep/ui/layouts/auth-split";
import type React from "react";

type Props = {
  children: React.ReactNode;
};

const SignUpLayout: React.FC<Props> = ({ children }) => {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
};

export default SignUpLayout;
