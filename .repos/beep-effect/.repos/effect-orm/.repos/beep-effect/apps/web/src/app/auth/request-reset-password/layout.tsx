import { AuthSplitLayout } from "@beep/ui/layouts/auth-split";
import type React from "react";

type Props = {
  children: React.ReactNode;
};

const RequestResetPasswordLayout: React.FC<Props> = ({ children }) => {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
};

export default RequestResetPasswordLayout;
