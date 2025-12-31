import { $IamDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/common/common-headers");

export class CaptchaRequestHeaders extends S.Class<CaptchaRequestHeaders>($I`CaptchaRequestHeaders`)(
  {
    "x-captcha-response": S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("SignInCaptchaRequestHeaders", {
    description: "Request headers for endpoints that require captcha.",
  })
) {}
