import { serverEnv } from "@beep/env/server";
import { ResendService, reactInvitationEmail, reactResetPasswordEmail } from "@beep/resend";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

type SendInvitationParams = Record<string, any> & {
  readonly id: string;
  readonly role: string;
  readonly organization: Record<string, any> & {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly logo?: string | null | undefined;
  };
  readonly invitation: Record<string, any> & {
    readonly id: string;
    readonly organizationId: string;
    readonly email: string;
    readonly status: string;
    readonly teamId?: null | string;
    readonly inviterId: string;
  };
  readonly email: string;
  readonly inviter: Record<string, any> & {
    readonly id: string;
    readonly organizationId: string;
    readonly userId: string;
    readonly role: string;
  };
};

export class AuthEmailService extends Effect.Service<AuthEmailService>()("AuthEmailService", {
  dependencies: [ResendService.Default],
  accessors: true,
  effect: Effect.gen(function* () {
    const { send } = yield* ResendService;
    const { email: emailEnv } = serverEnv;

    const sendVerification = Effect.fn("sendVerification")(function* () {
      return yield* send({
        from: Redacted.value(emailEnv.from),
        to: "",
        subject: "Verify your email",
        // html: `<a href="${params.url}">Verify your email</a>`,
        html: "",
      });
    });

    const sendResetPassword = Effect.fn("sendResetPassword")(function* (params: {
      user: { email: string; username: string };
      url: string;
      token: string;
    }) {
      return yield* send({
        from: Redacted.value(emailEnv.from),
        to: params.user.email,
        subject: "Reset your password",
        react: reactResetPasswordEmail({
          username: params.user.username,
          resetLink: params.url,
        }),
      });
    });

    const sendInvitation = Effect.fn("sendInvitation")(function* (params: SendInvitationParams) {
      return yield* send({
        from: Redacted.value(emailEnv.from),
        to: "",
        subject: "You've been invited to join an organization",
        react: reactInvitationEmail({
          username: "",
          invitedByUsername: "",
          invitedByEmail: "",
          teamName: "",
          inviteLink: "",
        }),
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
  }),
}) {}
