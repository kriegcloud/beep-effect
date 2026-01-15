import RecaptchaV3Atom from "./_common/recaptcha-v3-atom.tsx";

export const IamProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <RecaptchaV3Atom>{children}</RecaptchaV3Atom>;
};
