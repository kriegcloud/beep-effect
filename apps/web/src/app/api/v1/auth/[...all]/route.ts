import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import { runServerPromise } from "@beep/runtime-server";
import * as Effect from "effect/Effect";

const program = Effect.map(AuthService, ({ auth }) => auth.handler);

const route = async (req: Request) => {
  const handler = await runServerPromise(program, "auth.route");

  return handler(req);
};

export const POST = route;
export const GET = route;
