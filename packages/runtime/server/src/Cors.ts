import { AllowedHeaders } from "@beep/constants";
import { BS } from "@beep/schema";
import { serverEnv } from "@beep/shared-infra/ServerEnv";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";

export const CorsLive = HttpLayerRouter.cors({
  allowedOrigins: serverEnv.security.trustedOrigins,
  allowedMethods: BS.HttpMethod.pickOptions("GET", "POST", "PUT", "DELETE", "PATCH"),
  allowedHeaders: AllowedHeaders.Options,
  credentials: true,
});
