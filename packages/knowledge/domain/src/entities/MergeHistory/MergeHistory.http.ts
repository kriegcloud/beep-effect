import * as HttpApiGroup from "@effect/platform/HttpApiGroup";

export class Http extends HttpApiGroup.make("merge-history").prefix("/merge-history") {}
