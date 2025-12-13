import * as Email from "./email.ts";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import {IamDomainApi} from "@beep/iam-domain";

export const Routes = HttpApiBuilder.group(
  IamDomainApi,
  "signUp",
  (h) =>
    h.handle("email", Email.Handler)
);