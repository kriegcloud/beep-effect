import { createContext } from "react";

import type { ReCaptchaInstance } from "./types";

export type ReCaptchaContextType = {
  /**
   * The container element for the reCAPTCHA widget if applicable.
   */
  container?: undefined | string | HTMLElement;
  /**
   * A function to execute the reCAPTCHA verification process.
   *
   * @param {string} [action] The action name for the reCAPTCHA verification.
   * @returns {Promise<string> | null} The reCAPTCHA token or null if the reCAPTCHA verification
   *   failed.
   */
  executeRecaptcha?: undefined | ((action?: undefined | string) => Promise<string> | null);
  /**
   * The reCAPTCHA instance.
   */
  reCaptchaInstance?: undefined | ReCaptchaInstance | null;
};

const ReCaptchaContext = createContext<ReCaptchaContextType>({});

export default ReCaptchaContext;
