import { EventStreamRpc } from "./api/event-stream-rpc.ts";
import { FilesRpc } from "./api/files-rpc.ts";

export class DomainRpc extends EventStreamRpc.merge(FilesRpc) {}
