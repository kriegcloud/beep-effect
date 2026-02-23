import * as HttpApi from "@effect/platform/HttpApi";
import * as OpenApi from "@effect/platform/OpenApi";
import * as V1 from "./v1";

export class IamApi extends HttpApi.make("iam")
  .addHttpApi(V1.Api)
  .prefix("/v1")
  .annotate(OpenApi.Title, "Beep Effect API")
  .annotate(OpenApi.Version, "1.0.0")
  .annotate(OpenApi.Description, "Identity and Access Management API")
  .annotate(OpenApi.Transform, (spec) => ({
    ...spec,
    "x-tagGroups": [
      {
        name: "IAM",
        tags: ["signIn", "signUp", "core", "admin", "organization", "passkey", "twoFactor", "sso", "oauth2", "apiKey"],
      },
    ],
  })) {}
