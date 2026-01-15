import RecaptchaV3Atom from "@beep/iam-ui/_common/recaptcha-v3-atom";

export const IamProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <RecaptchaV3Atom>{children}</RecaptchaV3Atom>;
};
