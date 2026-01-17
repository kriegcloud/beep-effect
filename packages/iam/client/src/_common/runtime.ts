import { makeAtomRuntime } from "@beep/runtime-client";
import { CaptchaMiddleware } from "./captcha-middleware";

makeAtomRuntime.addGlobalLayer(CaptchaMiddleware.provide());

export { makeAtomRuntime };
