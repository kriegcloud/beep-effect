import {ResendService} from "@beep/resend";
import {reactInvitationEmail, reactResetPasswordEmail} from "@beep/resend";
import * as Effect from "effect/Effect";
import {serverEnv} from "@beep/env/server";
import * as Redacted from "effect/Redacted";

export class AuthEmailService extends Effect.Service<AuthEmailService>()(
  "AuthEmailService",
  {
    dependencies: [ResendService.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const {send} = yield* ResendService;
      const {email: emailEnv} = serverEnv;

      const sendVerification = Effect.fn("sendVerification")(function* () {
        return yield* send({
          from: Redacted.value(emailEnv.from),
          to: "",
          subject: "Verify your email",
          // html: `<a href="${params.url}">Verify your email</a>`,
          html: ""
        });
      });

      const sendResetPassword = Effect.fn("sendResetPassword")(function* () {
        return yield* send({
          from: Redacted.value(emailEnv.from),
          to: "email",
          subject: "Reset your password",
          react: reactResetPasswordEmail({
            username: "email",
            resetLink: "url",
          }),
        });
      });

      const sendInvitation = Effect.fn("sendInvitation")(function* () {
        return yield* send({
          from: Redacted.value(emailEnv.from),
          to: "",
          subject: "You've been invited to join an organization",
          react: reactInvitationEmail({
            username: "",
            invitedByUsername: "",
            invitedByEmail: "",
            teamName: "",
            inviteLink: ""
          })
        });
      });

      const sendOTP = Effect.fn("sendOTP")(function* () {
        return yield* send({
          from: Redacted.value(emailEnv.from),
          to: "params.user.email",
          subject: "Your OTP",
          html: "`Your OTP is ${params.otp}`",
        });
      });

      return {
        sendVerification,
        sendResetPassword,
        sendInvitation,
        sendOTP,
      };
    })
  }
) {
}