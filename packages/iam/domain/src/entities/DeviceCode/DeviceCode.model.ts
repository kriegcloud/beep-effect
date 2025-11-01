import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { DeviceCodeStatus } from "./schemas";

export const DeviceCodeModelSchemaId = Symbol.for("@beep/iam-domain/DeviceCodeModel");

/**
 * OAuth 2.0 Device Authorization Grant (RFC 8628),
 * enabling authentication for devices with limited input capabilities such as smart TVs,
 * CLI applications, IoT devices, and gaming consoles.
 */
export class Model extends M.Class<Model>(`DeviceCodeModel`)(
  makeFields(IamEntityIds.DeviceCodeId, {
    userCode: M.Sensitive(S.NonEmptyTrimmedString),

    userId: BS.FieldOptionOmittable(SharedEntityIds.UserId),
    deviceCode: M.Sensitive(S.NonEmptyTrimmedString),
    expiresAt: BS.DateTimeFromDate(),

    status: BS.toOptionalWithDefault(DeviceCodeStatus)(DeviceCodeStatus.Enum.pending),

    lastPolledAt: BS.FieldOptionOmittable(BS.DateTimeFromDate()),
    pollingInterval: BS.FieldOptionOmittable(S.NonNegativeInt),
    clientId: BS.FieldOptionOmittable(S.NonEmptyTrimmedString),
    scope: BS.FieldOptionOmittable(S.NonEmptyTrimmedString),
  }),
  {
    identifier: "DeviceCodeModel",
    title: "Device Code Model",
    description: "Device code model representing organization and team invitations.",
    schemaId: DeviceCodeModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
