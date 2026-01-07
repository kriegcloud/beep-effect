import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Rpc, RpcGroup } from "@effect/rpc";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("rpc/health");

export class Success extends S.Class<Success>($I`Success`)(
  {
    status: BS.LiteralWithDefault("ok"),
  },
  $I.annotations("Success", {
    description: "Health check success response indicating the service is operational",
  })
) {}

export const Contract = Rpc.make("getHealth", {
  success: Success,
  error: S.String,
});

export const Rpcs = RpcGroup.make(Contract);
