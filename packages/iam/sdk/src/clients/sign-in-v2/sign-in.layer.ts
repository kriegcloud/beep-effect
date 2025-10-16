import { client } from "@beep/iam-sdk/adapters";
import { SignIn } from "@beep/iam-sdk/clients/sign-in-v2/sign-in.contract";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";

export const SignInContext = SignIn.of({
  SignInEmail: (args) =>
    Effect.gen(function* () {
      let captchaToken: string | null = null;
      let error: IamError | undefined = undefined;
      if (Str.isString(args.captchaResponse)) {
        captchaToken = args.captchaResponse;
      } else if (args.captchaResponse) {
        captchaToken = Redacted.value(args.captchaResponse);
      }

      if (!captchaToken) {
        return yield* new IamError("MissingCaptchaResponse", "Captcha verification failed", {
          plugin: "sign-in",
          method: "email",
        });
      }
      const result = yield* Effect.tryPromise({
        try: () =>
          client.signIn.email({
            email: Redacted.value(args.email),
            password: Redacted.value(args.password),
            rememberMe: args.rememberMe,
            fetchOptions: {
              headers: {
                "x-captcha-response": captchaToken,
              },
              onError: (ctx) => {
                error = IamError.match(ctx.error);
              },
            },
          }),
        catch: (e) =>
          new IamError(e, "Some error occurred while making the request", {
            plugin: "sign-in",
            method: "email",
          }),
      });

      if (result.error == null) {
        client.$store.notify("$sessionSignal");
      }

      if (error) {
        return yield* Effect.fail(error);
      }
    }),
});
