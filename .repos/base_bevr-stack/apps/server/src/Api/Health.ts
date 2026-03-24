import { Api } from "@repo/domain/Api";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
export const HealthGroupLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.handle("get", () => Effect.succeed("Hello Effect!")),
);
