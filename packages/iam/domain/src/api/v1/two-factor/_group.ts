import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Disable from "./disable";
import * as Enable from "./enable";
import * as GenerateBackupCodes from "./generate-backup-codes";
import * as GetTotpUri from "./get-totp-uri";
import * as SendOtp from "./send-otp";
import * as VerifyBackupCode from "./verify-backup-code";
import * as VerifyOtp from "./verify-otp";
import * as VerifyTotp from "./verify-totp";

export class Group extends HttpApiGroup.make("iam.twoFactor")
  .prefix("/two-factor")
  .add(Disable.Contract)
  .add(Enable.Contract)
  .add(GenerateBackupCodes.Contract)
  .add(GetTotpUri.Contract)
  .add(SendOtp.Contract)
  .add(VerifyBackupCode.Contract)
  .add(VerifyOtp.Contract)
  .add(VerifyTotp.Contract) {}

export { Disable, Enable, GenerateBackupCodes, GetTotpUri, SendOtp, VerifyBackupCode, VerifyOtp, VerifyTotp };
