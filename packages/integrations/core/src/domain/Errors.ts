import { $IntegrationsCoreId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const { $ErrorsId: Id } = $IntegrationsCoreId.compose("errors");

const commonFields = {
  cause: S.Defect,
  message: S.String,
  metadata: S.optional(S.Record({ key: S.String, value: S.Any })),
} as const;

export class GoogleIntegrationError extends S.TaggedError<GoogleIntegrationError>(Id`GoogleIntegrationError`)(
  "GoogleIntegrationError",
  commonFields,
  Id.annotations("GoogleIntegrationError", {
    description: "An error that occurred in the Google integration",
  })
) {}

export class TheFrontIntegrationError extends S.TaggedError<TheFrontIntegrationError>(Id`TheFrontIntegrationError`)(
  "TheFrontIntegrationError",
  commonFields,
  Id.annotations("TheFrontIntegrationError", {
    description: "An error that occurred in TheFrontIntegration integration.",
  })
) {}

export class UnknownIntegrationError extends S.TaggedError<UnknownIntegrationError>(Id`UnknownIntegrationError`)(
  "UnknownIntegration",
  commonFields,
  Id.annotations("UnknownIntegrationError", {
    description: "An unknown error that occurred in the integrations layer.",
  })
) {}

export class IntegrationError extends S.Union(
  GoogleIntegrationError,
  TheFrontIntegrationError,
  UnknownIntegrationError
).annotations(
  Id.annotations("IntegrationError", {
    description: "An error that occurred in the integrations layer.",
  })
) {}
