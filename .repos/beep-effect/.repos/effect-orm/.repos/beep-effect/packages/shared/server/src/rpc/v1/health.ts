import { Health } from "@beep/shared-domain/rpc/v1";
import * as Effect from "effect/Effect";

export const Handler = () =>
  Effect.succeed(
    new Health.Success({
      status: "ok",
    })
  );

export const layer = Health.Rpcs.toLayer(
  Health.Rpcs.of({
    getHealth: Handler,
  })
);
