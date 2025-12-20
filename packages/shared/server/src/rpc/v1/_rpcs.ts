import * as Layer from "effect/Layer";
import * as EventStream from "./event-stream-rpc-live";
import { Files } from "./files";

export const layer = Layer.mergeAll(EventStream.EventStreamRpcLive, Files.layer);
