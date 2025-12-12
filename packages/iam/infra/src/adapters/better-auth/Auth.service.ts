import { IamDb } from "@beep/iam-infra/db/Db";
import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins/custom-session";
import * as Effect from "effect/Effect";
import { AuthEmailService } from "./AuthEmail.service";
import { AuthOptions } from "./AuthOptions.ts";

export const authServiceEffect = Effect.gen(function* () {
  const opts = yield* AuthOptions;

  const auth = betterAuth({
    ...opts,
    plugins: [
      ...(opts.plugins ?? []),
      customSession(async ({ user, session }) => {
        // now both user and session will infer the fields added by plugins and your custom fields
        return {
          user,
          session,
        };
      }, opts), // pass options here
    ],
  });

  return {
    auth,
  };
});

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  dependencies: [AuthEmailService.DefaultWithoutDependencies, IamDb.IamDb.Live],
  effect: authServiceEffect,
}) {}
