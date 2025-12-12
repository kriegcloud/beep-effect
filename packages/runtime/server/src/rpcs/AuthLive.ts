import { AuthEmailService } from "@beep/iam-infra/adapters/better-auth/AuthEmail.service";
import { AuthOptions } from "@beep/iam-infra/adapters/better-auth/AuthOptions";
import { IamDb } from "@beep/iam-infra/db/Db";
import type { Db } from "@beep/shared-infra/Db";
import type { ResendService } from "@beep/shared-infra/internal/email/adapters";
import { betterAuth } from "better-auth";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const authServiceEffect = Effect.gen(function* () {
  const authOptions = yield* AuthOptions;
  const auth = betterAuth(authOptions);

  return {
    auth,
  } as const;
});

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  dependencies: [AuthEmailService.DefaultWithoutDependencies, IamDb.IamDb.Live],
  effect: authServiceEffect,
}) {
  static readonly layer: Layer.Layer<
    AuthEmailService | AuthService,
    never,
    IamDb.IamDb | Db.SliceDbRequirements | ResendService
  > = AuthService.Default.pipe(Layer.provideMerge(AuthEmailService.Default));
}
