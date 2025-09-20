import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import { serverRuntime } from "@beep/runtime-server";
import * as Effect from "effect/Effect";

const program = Effect.flatMap(AuthService, ({ auth }) => Effect.succeed(auth.handler));

const route = async (req: Request) => {
  const handler = await serverRuntime.runPromise(program);

  return handler(req);
};

export const POST = route;
export const GET = route;
