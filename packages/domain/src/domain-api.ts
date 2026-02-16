import { EventStreamRpc } from "./api/event-stream-rpc.js";
import { FilesRpc } from "./api/files/files-rpc.js";

export class DomainRpc extends EventStreamRpc.merge(FilesRpc) {}
