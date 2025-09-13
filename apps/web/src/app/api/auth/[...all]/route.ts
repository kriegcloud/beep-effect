import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import * as Effect from "effect/Effect";
import { runtime } from "@/services/server-runtime";

const program = Effect.flatMap(AuthService, ({ auth }) => Effect.succeed(auth.handler));

export const GET = async (req: Request) => {
  const handler = await runtime.runPromise(program);

  return handler(req);
};
export const POST = async (req: Request) => {
  const handler = await runtime.runPromise(program);
  return handler(req);
};
