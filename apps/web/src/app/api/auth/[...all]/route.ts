import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import { serverRuntime } from "@beep/iam-infra/adapters/better-auth/lib/server-runtime";
import * as Effect from "effect/Effect";

const program = Effect.flatMap(AuthService, ({ auth }) => Effect.succeed(auth.handler));

export const GET = async (req: Request) => {
  const handler = await serverRuntime.runPromise(program);

  return handler(req);
};
export const POST = async (req: Request) => {
  const handler = await serverRuntime.runPromise(program);
  return handler(req);
};
