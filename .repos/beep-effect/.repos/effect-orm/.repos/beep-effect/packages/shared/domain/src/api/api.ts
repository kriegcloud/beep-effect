import * as HttpApi from "@effect/platform/HttpApi";
import * as OpenApi from "@effect/platform/OpenApi";
import * as V1 from "./v1";

export class SharedApi extends HttpApi.make("shared")
  .addHttpApi(V1.Api)
  .annotate(OpenApi.Title, "Shared API")
  .annotate(OpenApi.Version, "1.0.0")
  .annotate(OpenApi.Description, "Shared cross-cutting concerns API including RPC reference documentation")
  .annotate(OpenApi.Transform, (spec) => ({
    ...spec,
    "x-tagGroups": [
      {
        name: "v1 / Shared",
        tags: ["shared.rpc"],
      },
    ],
  })) {}

export { V1 };
