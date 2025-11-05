import { ResendService, reactInvitationEmail, reactResetPasswordEmail, renderEmail } from "@beep/core-email";
import { IamConfig } from "@beep/iam-infra/config";
import { BS } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

export class SendVerificationEmailPayload extends S.Class<SendVerificationEmailPayload>("SendVerificationEmailPayload")(
  {
    email: BS.Email,
    url: BS.Url,
  }
) {}

export declare namespace SendVerificationEmailPayload {
  export type Type = S.Schema.Type<typeof SendVerificationEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof SendVerificationEmailPayload>;
}

export class SendOTPEmailPayload extends S.Class<SendOTPEmailPayload>("SendOTPEmailPayload")({
  email: BS.Email,
  otp: S.Redacted(S.String),
}) {}

export declare namespace SendOTPEmailPayload {
  export type Type = S.Schema.Type<typeof SendOTPEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof SendOTPEmailPayload>;
}

export class SendResetPasswordEmailPayload extends S.Class<SendResetPasswordEmailPayload>(
  "SendResetPasswordEmailPayload"
)({
  username: S.String,
  url: BS.Url,
  email: BS.Email,
}) {}

export declare namespace SendResetPasswordEmailPayload {
  export type Type = S.Schema.Type<typeof SendResetPasswordEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof SendResetPasswordEmailPayload>;
}

export class InvitationEmailPayload extends S.Class<InvitationEmailPayload>("InvitationEmailPayload")({
  email: BS.Email,
  invitedByUsername: S.String,
  invitedByEmail: BS.Email,
  teamName: S.String,
}) {}

export declare namespace InvitationEmailPayload {
  export type Type = S.Schema.Type<typeof InvitationEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof InvitationEmailPayload>;
}

export class AuthEmailService extends Effect.Service<AuthEmailService>()("AuthEmailService", {
  accessors: true,
  dependencies: [ResendService.Default, IamConfig.Live],
  effect: Effect.flatMap(ResendService, ({ send }) =>
    Effect.gen(function* () {
      const { email: emailEnv } = yield* IamConfig;

      const sendVerification = Effect.fn("sendVerification")(
        function* (params: SendVerificationEmailPayload.Type) {
          yield* send({
            from: Redacted.value(emailEnv.from),
            to: Redacted.value(params.email),
            subject: "Verify your email",
            html: `<a href="${params.url.toString()}">Verify your email</a>`,
          });
        },
        (effect, n) =>
          effect.pipe(
            Effect.withSpan("AuthEmailService.sendVerification"),
            Effect.annotateLogs({ arguments: n }),
            Effect.tapError(Effect.logError)
          )
      );

      const sendResetPassword = Effect.fn("sendResetPassword")(
        function* (params: SendResetPasswordEmailPayload.Type) {
          const emailTemplate = yield* renderEmail(
            reactResetPasswordEmail({
              username: params.username,
              resetLink: params.url.toString(),
            })
          );

          yield* send({
            from: Redacted.value(emailEnv.from),
            to: Redacted.value(params.email),
            subject: "Reset your password",
            react: emailTemplate,
          });
        },
        (effect, n) =>
          effect.pipe(
            Effect.withSpan("AuthEmailService.sendResetPassword"),
            Effect.annotateLogs({ arguments: n }),
            Effect.tapError(Effect.logError)
          )
      );

      const sendInvitation = Effect.fn("sendInvitation")(
        function* (params: InvitationEmailPayload.Type) {
          const emailTemplate = yield* renderEmail(
            reactInvitationEmail({
              email: Redacted.value(params.email),
              invitedByUsername: params.invitedByUsername,
              invitedByEmail: Redacted.value(params.invitedByEmail),
              teamName: params.teamName,
            })
          );
          yield* send({
            from: Redacted.value(emailEnv.from),
            to: Redacted.value(params.email),
            subject: "You've been invited to join an organization",
            react: emailTemplate,
          });
        },
        (effect, n) =>
          effect.pipe(
            Effect.withSpan("AuthEmailService.sendInvitation"),
            Effect.annotateLogs({ arguments: n }),
            Effect.tapError(Effect.logError)
          )
      );

      const sendOTP = Effect.fn("sendOTP")(
        function* (params: SendOTPEmailPayload.Type) {
          yield* send({
            from: Redacted.value(emailEnv.from),
            to: Redacted.value(params.email),
            subject: "Your OTP",
            html: `Your OTP is ${Redacted.value(params.otp)}`,
          });
        },
        (effect, n) =>
          effect.pipe(
            Effect.withSpan("AuthEmailService.sendOTP"),
            Effect.annotateLogs({ arguments: n }),
            Effect.tapError(Effect.logError)
          )
      );

      return {
        sendVerification,
        sendResetPassword,
        sendInvitation,
        sendOTP,
      };
    })
  ),
}) {}
