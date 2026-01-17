import { useContext } from "react";
import type { ReCaptchaContextType } from "./ReCaptchaContext";
import ReCaptchaContext from "./ReCaptchaContext";

/**
 * Used to get the Google reCAPTCHA v3 context.
 *
 * @returns {ReCaptchaContextType} Google reCAPTCHA v3 context
 */
export default function useReCaptcha(): ReCaptchaContextType {
  return useContext(ReCaptchaContext);
}
