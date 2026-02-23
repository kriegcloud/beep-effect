import { $IamServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import { Email } from "@beep/shared-server/Email";
import * as Effect from "effect/Effect";
import type * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

const $I = $IamServerId.create("adapters/better-auth/Emails");

export class SendVerificationEmailPayload extends S.Class<SendVerificationEmailPayload>(
  $I`SendVerificationEmailPayload`
)(
  {
    email: BS.Email,
    url: BS.Url,
  },
  $I.annotations("SendVerificationEmailPayload", {
    description: "Payload for sending a verification email",
  })
) {}

export class SendChangeEmailVerificationPayload extends S.Class<SendChangeEmailVerificationPayload>(
  $I`SendChangeEmailVerificationPayload`
)(
  {
    email: BS.Email,
    url: BS.Url,
  },
  $I.annotations("SendChangeEmailVerificationPayload", {
    description: "Payload for sending a change email verification email",
  })
) {}

export class SendOTPEmailPayload extends S.Class<SendOTPEmailPayload>($I`SendOTPEmailPayload`)(
  {
    email: BS.Email,
    otp: S.Redacted(S.String),
  },
  $I.annotations("SendOTPEmailPayload", {
    description: "Payload for sending an OTP email",
  })
) {}

export class SendResetPasswordEmailPayload extends S.Class<SendResetPasswordEmailPayload>(
  $I`SendResetPasswordEmailPayload`
)(
  {
    username: S.String,
    url: BS.Url,
    email: BS.Email,
  },
  $I.annotations("SendResetPasswordEmailPayload", {
    description: "Payload for sending a reset password email",
  })
) {}

export class InvitationEmailPayload extends S.Class<InvitationEmailPayload>($I`InvitationEmailPayload`)(
  {
    email: BS.Email,
    invitedByUsername: S.String,
    invitedByEmail: BS.Email,
    teamName: S.String,
  },
  $I.annotations("InvitationEmailPayload", {
    description: "Payload for sending an invitation email",
  })
) {}

export interface AuthEmailServiceShape {
  readonly sendChangeEmailVerification: (
    params: SendChangeEmailVerificationPayload
  ) => Effect.Effect<void, Email.ResendError, never>;
  readonly sendVerification: (params: SendVerificationEmailPayload) => Effect.Effect<void, Email.ResendError, never>;
  readonly sendResetPassword: (
    params: SendResetPasswordEmailPayload
  ) => Effect.Effect<void, Email.EmailTemplateRenderError | Email.ResendError, never>;
  readonly sendInvitation: (
    params: InvitationEmailPayload
  ) => Effect.Effect<void, Email.EmailTemplateRenderError | Email.ResendError, never>;
  readonly sendOTP: (params: SendOTPEmailPayload) => Effect.Effect<void, Email.ResendError, never>;
}

type AuthServiceEffect = Effect.Effect<AuthEmailServiceShape, never, Email.ResendService>;

export const serviceEffect: AuthServiceEffect = Effect.flatMap(Email.ResendService, ({ send, renderEmail }) =>
  Effect.gen(function* () {
    const { email: emailEnv } = serverEnv;

    const sendChangeEmailVerification: AuthEmailServiceShape["sendChangeEmailVerification"] = Effect.fn(
      "sendChangeEmailVerification"
    )(function* (params: SendChangeEmailVerificationPayload) {
      yield* send({
        from: Redacted.value(emailEnv.from),
        to: Redacted.value(params.email),
        subject: "Verify your email",
        html: `<a href="${params.url.toString()}">Verify your email</a>`,
      });
    });

    const sendVerification = Effect.fn("sendVerification")(
      function* (params: SendVerificationEmailPayload) {
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

    const sendResetPassword: AuthEmailServiceShape["sendResetPassword"] = Effect.fn("sendResetPassword")(
      function* (params: SendResetPasswordEmailPayload) {
        const emailTemplate = yield* renderEmail(
          Email.reactResetPasswordEmail({
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

    const sendInvitation: AuthEmailServiceShape["sendInvitation"] = Effect.fn("sendInvitation")(
      function* (params: InvitationEmailPayload) {
        const emailTemplate = yield* renderEmail(
          Email.reactInvitationEmail({
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

    const sendOTP: AuthEmailServiceShape["sendOTP"] = Effect.fn("sendOTP")(
      function* (params: SendOTPEmailPayload) {
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
      sendChangeEmailVerification,
    };
  })
);

export class AuthEmailService extends Effect.Service<AuthEmailService>()($I`AuthEmailService`, {
  accessors: true,
  dependencies: [Email.ResendService.Default],
  effect: serviceEffect,
}) {
  static readonly layer: Layer.Layer<AuthEmailService, never, Email.ResendService> = AuthEmailService.Default;
}
