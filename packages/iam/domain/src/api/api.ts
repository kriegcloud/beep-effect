import * as HttpApi from "@effect/platform/HttpApi";
import * as OpenApi from "@effect/platform/OpenApi";
import * as V1 from "./v1";

export class IamApi extends HttpApi.make("iam")
  .addHttpApi(V1.Api)
  .prefix("/v1")
  .annotate(OpenApi.Title, "IAM API")
  .annotate(OpenApi.Version, "1.0.0")
  .annotate(OpenApi.Description, "Identity and Access Management API")
  .annotate(OpenApi.Transform, (spec) => ({
    ...spec,
    "x-tagGroups": [
      {
        name: "v1 / IAM",
        tags: ["iam.signIn", "iam.signUp", "iam.core", "iam.admin", "iam.organization"],
      },
    ],
  })) {}

/** @deprecated Use IamApi instead */
export const Api = IamApi;
