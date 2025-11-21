import { RecaptchaV3 } from "@beep/iam-ui/_common";

export const IamProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <RecaptchaV3>{children}</RecaptchaV3>;
};
