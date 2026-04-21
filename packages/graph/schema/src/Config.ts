/**
 * Configuration service request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { pipe, Tuple } from "effect";
import * as S from "effect/Schema";

import { TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("Config");

/**
 * Configuration commands supported by the graph config service.
 *
 * @since 0.1.0
 * @category models
 */
export const ConfigOperation = LiteralKit(["get", "list", "delete", "put", "config", "getvalues"] as const).pipe(
  $I.annoteSchema("ConfigOperation", {
    description: "Configuration commands supported by the graph config service.",
  }),
);

/**
 * Type for {@link ConfigOperation}. {@inheritDoc ConfigOperation}
 *
 * @category models
 * @since 0.1.0
 */
export type ConfigOperation = typeof ConfigOperation.Type;

const makeConfigRequest = <TOperation extends ConfigOperation>(literal: S.Literal<TOperation>) =>
  S.Struct({
    operation: S.tag(literal.literal).annotateKey({
      description: "Configuration command to perform.",
    }),
    keys: S.OptionFromOptionalKey(S.Array(S.String)).annotateKey({
      description: "Optional config keys referenced by the command.",
    }),
    values: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey({
      description: "Optional config values supplied for put-style operations.",
    }),
    type: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional config type selector for typed config queries.",
    }),
  });

/**
 * Request payload for the graph configuration service.
 *
 * @since 0.1.0
 * @category models
 */
export const ConfigRequest = ConfigOperation.mapMembers((members) =>
  pipe(members, Tuple.evolve([makeConfigRequest, makeConfigRequest, makeConfigRequest, makeConfigRequest, makeConfigRequest, makeConfigRequest]))
).pipe(
  S.toTaggedUnion("operation"),
  $I.annoteSchema("ConfigRequest", {
    description: "Request payload for the graph configuration service.",
  }),
);

/**
 * Type for {@link ConfigRequest}. {@inheritDoc ConfigRequest}
 *
 * @category models
 * @since 0.1.0
 */
export type ConfigRequest = typeof ConfigRequest.Type;

/**
 * Response payload for the graph configuration service.
 *
 * @since 0.1.0
 * @category models
 */
export class ConfigResponse extends S.Class<ConfigResponse>($I`ConfigResponse`)({
  version: S.OptionFromOptionalKey(S.Number).annotateKey({
    description: "Current configuration version when provided by the service.",
  }),
  values: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey({
    description: "Resolved configuration values returned by the service.",
  }),
  directory: S.OptionFromOptionalKey(S.Array(S.String)).annotateKey({
    description: "Available config keys returned by list-style commands.",
  }),
  config: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey({
    description: "Raw configuration object returned by snapshot commands.",
  }),
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when the config command fails.",
  }),
}, $I.annote("ConfigResponse", {
  description: "Response payload for the graph configuration service.",
})) {}
