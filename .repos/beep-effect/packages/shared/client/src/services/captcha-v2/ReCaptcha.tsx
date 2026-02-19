import { useEffect } from "react";

import useReCaptcha from "./useReCaptcha";

type ReCaptchaProps = {
  /**
   * The action name for the reCAPTCHA verification.
   */
  action?: string;
  /**
   * Callback function to handle the token after verification.
   */
  onVerify: (token: string) => void;
  /**
   * A value to trigger reCAPTCHA verification again.
   */
  refreshReCaptcha?: boolean | string | number | null;
};

/**
 * Initializes the reCAPTCHA verification process.
 */
export default function ReCaptcha({ action, onVerify, refreshReCaptcha }: ReCaptchaProps) {
  const { container, executeRecaptcha } = useReCaptcha();

  useEffect(() => {
    if (!executeRecaptcha) {
      return;
    }

    (async () => {
      const token = await executeRecaptcha(action);

      if (token) {
        onVerify(token);
      }
    })();
  }, [action, executeRecaptcha, refreshReCaptcha, onVerify]);

  if (typeof container === "string") {
    return <div id={container} />;
  }

  return null;
}
