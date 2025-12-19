import { Auth } from "@beep/iam-infra";
import { runServerPromise } from "@beep/runtime-server";
import * as Effect from "effect/Effect";

const program = Effect.map(Auth.Service, (auth) => auth.handler);

const route = async (req: Request) => {
  const handler = await runServerPromise(program, "auth.route");

  return handler(req);
};

export const POST = route;
export const GET = route;
