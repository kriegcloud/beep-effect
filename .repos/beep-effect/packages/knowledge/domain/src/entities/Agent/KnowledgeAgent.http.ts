import * as HttpApiGroup from "@effect/platform/HttpApiGroup";

export class Http extends HttpApiGroup.make("knowledge-agents").prefix("/knowledge-agents") {}
