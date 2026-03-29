/**
 * Shared schema codec public exports.
 *
 * @module
 * @since 0.0.0
 */

import { Effect, Layer } from "effect";
import type * as S from "effect/Schema";
import type { JsoncCodecServiceShape as JsoncCodecServiceShape_ } from "./JsoncCodecs.js";
import {
  decodeJsoncTextAs as decodeJsoncTextAs_,
  JsoncCodecService as JsoncCodecService_,
  JsoncCodecServiceLive as JsoncCodecServiceLive_,
  JsoncParseDiagnostic as JsoncParseDiagnostic_,
  JsoncTextToUnknown as JsoncTextToUnknown_,
} from "./JsoncCodecs.js";
import type { XmlCodecServiceShape as XmlCodecServiceShape_ } from "./XmlCodecs.js";
import {
  decodeXmlTextAs as decodeXmlTextAs_,
  XmlCodecService as XmlCodecService_,
  XmlCodecServiceLive as XmlCodecServiceLive_,
  XmlTextToUnknown as XmlTextToUnknown_,
} from "./XmlCodecs.js";
import type { YamlCodecServiceShape as YamlCodecServiceShape_ } from "./YamlCodecs.js";
import {
  decodeYamlTextAs as decodeYamlTextAs_,
  YamlCodecService as YamlCodecService_,
  YamlCodecServiceLive as YamlCodecServiceLive_,
  YamlTextToUnknown as YamlTextToUnknown_,
} from "./YamlCodecs.js";

/**
 * Service contract type for JSONC parsing.
 *
 * @description Service interface for JSONC parsing and schema decoding.
 * @category DomainModel
 * @since 0.0.0
 */
export type JsoncCodecServiceShape = JsoncCodecServiceShape_;

/**
 * Service contract type for YAML parsing.
 *
 * @description Service interface for YAML parsing and schema decoding.
 * @category DomainModel
 * @since 0.0.0
 */
export type YamlCodecServiceShape = YamlCodecServiceShape_;

/**
 * Service contract type for XML parsing.
 *
 * @description Service interface for XML parsing and schema decoding.
 * @category DomainModel
 * @since 0.0.0
 */
export type XmlCodecServiceShape = XmlCodecServiceShape_;

/**
 * Decode JSONC text into a target schema using the shared JSONC codec.
 *
 * @category Utility
 * @since 0.0.0
 */
export const decodeJsoncTextAs = decodeJsoncTextAs_;

/**
 * Decode JSONC text using the shared live codec implementation.
 *
 * @param schema - Target schema used to decode JSONC input.
 * @returns Effectful decoder wired with the live JSONC codec layer.
 * @category Utility
 * @since 0.0.0
 */
export const decodeJsoncTextAsLive = <Schema extends S.Top>(schema: Schema) => {
  const decode = decodeJsoncTextAs(schema);
  return (content: string) =>
    Effect.scoped(
      Layer.build(JsoncCodecServiceLive).pipe(
        Effect.flatMap((context) => decode(content).pipe(Effect.provide(context)))
      )
    );
};

/**
 * Service tag for JSONC parsing.
 *
 * @category PortContract
 * @since 0.0.0
 */
export const JsoncCodecService = JsoncCodecService_;

/**
 * Live JSONC codec service layer.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const JsoncCodecServiceLive = JsoncCodecServiceLive_;

/**
 * JSONC parse diagnostic payload.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const JsoncParseDiagnostic = JsoncParseDiagnostic_;

/**
 * Effectful JSONC text-to-unknown schema transformation.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const JsoncTextToUnknown = JsoncTextToUnknown_;

/**
 * Decode YAML text into a target schema using the shared YAML codec.
 *
 * @category Utility
 * @since 0.0.0
 */
export const decodeYamlTextAs = decodeYamlTextAs_;

/**
 * Decode XML text into a target schema using the shared XML codec.
 *
 * @category Utility
 * @since 0.0.0
 */
export const decodeXmlTextAs = decodeXmlTextAs_;

/**
 * Decode YAML text using the shared live codec implementation.
 *
 * @param schema - Target schema used to decode YAML input.
 * @returns Effectful decoder wired with the live YAML codec layer.
 * @category Utility
 * @since 0.0.0
 */
export const decodeYamlTextAsLive = <Schema extends S.Top>(schema: Schema) => {
  const decode = decodeYamlTextAs(schema);
  return (content: string) =>
    Effect.scoped(
      Layer.build(YamlCodecServiceLive).pipe(Effect.flatMap((context) => decode(content).pipe(Effect.provide(context))))
    );
};

/**
 * Service tag for YAML parsing.
 *
 * @category PortContract
 * @since 0.0.0
 */
export const YamlCodecService = YamlCodecService_;

/**
 * Live YAML codec service layer.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const YamlCodecServiceLive = YamlCodecServiceLive_;

/**
 * Effectful YAML text-to-unknown schema transformation.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const YamlTextToUnknown = YamlTextToUnknown_;

/**
 * Decode XML text using the shared live codec implementation.
 *
 * @param schema - Target schema used to decode XML input.
 * @returns Effectful decoder wired with the live XML codec layer.
 * @category Utility
 * @since 0.0.0
 */
export const decodeXmlTextAsLive = <Schema extends S.Top>(schema: Schema) => {
  const decode = decodeXmlTextAs(schema);
  return (content: string) =>
    Effect.scoped(
      Layer.build(XmlCodecServiceLive).pipe(Effect.flatMap((context) => decode(content).pipe(Effect.provide(context))))
    );
};

/**
 * Service tag for XML parsing.
 *
 * @category PortContract
 * @since 0.0.0
 */
export const XmlCodecService = XmlCodecService_;

/**
 * Live XML codec service layer.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const XmlCodecServiceLive = XmlCodecServiceLive_;

/**
 * Effectful XML text-to-unknown schema transformation.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const XmlTextToUnknown = XmlTextToUnknown_;
