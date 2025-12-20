import * as Layer from "effect/Layer";
import * as EventStream from "./event-stream-rpc-live";
import { Files } from "./files";
import * as Health from "./health";

export const layer = Layer.mergeAll(Health.layer, Files.layer, EventStream.EventStreamRpcLive);
