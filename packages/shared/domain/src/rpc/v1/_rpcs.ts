import { Policy } from "@beep/shared-domain";
import * as EventStream from "./event-stream";
import { Files } from "./files";
import * as Health from "./health";

export const Rpcs = Health.Rpcs.merge(Files.Rpcs).merge(EventStream.Rpcs).middleware(Policy.AuthContextRpcMiddleware);

export { Files, Health, EventStream };
