import * as HttpApiGroup from "@effect/platform/HttpApiGroup";

export class Http extends HttpApiGroup.make("email-thread-messages").prefix("/email-thread-messages") {}
