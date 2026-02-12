import * as HttpApiGroup from "@effect/platform/HttpApiGroup";

export class Http extends HttpApiGroup.make("email-threads").prefix("/email-threads") {}
