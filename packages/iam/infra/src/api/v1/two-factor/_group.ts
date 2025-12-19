import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-infra";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as Disable from "./disable.ts";
import * as Enable from "./enable.ts";
import * as GenerateBackupCodes from "./generate-backup-codes.ts";
import * as GetTotpUri from "./get-totp-uri.ts";
import * as SendOtp from "./send-otp.ts";
import * as VerifyBackupCode from "./verify-backup-code.ts";
import * as VerifyOtp from "./verify-otp.ts";
import * as VerifyTotp from "./verify-totp.ts";

export type Service = HttpApiGroup.ApiGroup<"iam", "iam.twoFactor">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "iam.twoFactor", (h) =>
  h
    .handle("disable", Disable.Handler)
    .handle("enable", Enable.Handler)
    .handle("generate-backup-codes", GenerateBackupCodes.Handler)
    .handle("get-totp-uri", GetTotpUri.Handler)
    .handle("send-otp", SendOtp.Handler)
    .handle("verify-backup-code", VerifyBackupCode.Handler)
    .handle("verify-otp", VerifyOtp.Handler)
    .handle("verify-totp", VerifyTotp.Handler)
);
