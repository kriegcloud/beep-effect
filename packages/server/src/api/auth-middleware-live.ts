import { AuthMiddleware, CurrentUser, UserId } from "@app/domain/auth";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const AuthMiddlewareLive: Layer.Layer<AuthMiddleware> = Layer.succeed(AuthMiddleware)(
  AuthMiddleware.of((effect) =>
    Effect.provideService(effect, CurrentUser, {
      id: UserId.make("00000000-0000-4000-8000-000000000001"),
      name: "Mock User",
      email: "mock@example.com",
    })
  ),
);
