/**
 * Shared schema codec public exports.
 *
 * @since 0.0.0
 * @module
 */

import type { JsoncCodecServiceShape as JsoncCodecServiceShape_ } from "./JsoncCodecs.js";
import {
  decodeJsoncTextAs as decodeJsoncTextAs_,
  JsoncCodecService as JsoncCodecService_,
  JsoncCodecServiceLive as JsoncCodecServiceLive_,
  JsoncParseDiagnostic as JsoncParseDiagnostic_,
  JsoncTextToUnknown as JsoncTextToUnknown_,
} from "./JsoncCodecs.js";
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
 * @since 0.0.0
 * @description Service interface for JSONC parsing and schema decoding.
 * @category DomainModel
 */
export type JsoncCodecServiceShape = JsoncCodecServiceShape_;

/**
 * Service contract type for YAML parsing.
 *
 * @since 0.0.0
 * @description Service interface for YAML parsing and schema decoding.
 * @category DomainModel
 */
export type YamlCodecServiceShape = YamlCodecServiceShape_;

/**
 * Decode JSONC text into a target schema using the shared JSONC codec.
 *
 * @since 0.0.0
 * @category Utility
 */
export const decodeJsoncTextAs = decodeJsoncTextAs_;

/**
 * Service tag for JSONC parsing.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const JsoncCodecService = JsoncCodecService_;

/**
 * Live JSONC codec service layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const JsoncCodecServiceLive = JsoncCodecServiceLive_;

/**
 * JSONC parse diagnostic payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsoncParseDiagnostic = JsoncParseDiagnostic_;

/**
 * Effectful JSONC text-to-unknown schema transformation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsoncTextToUnknown = JsoncTextToUnknown_;

/**
 * Decode YAML text into a target schema using the shared YAML codec.
 *
 * @since 0.0.0
 * @category Utility
 */
export const decodeYamlTextAs = decodeYamlTextAs_;

/**
 * Service tag for YAML parsing.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const YamlCodecService = YamlCodecService_;

/**
 * Live YAML codec service layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const YamlCodecServiceLive = YamlCodecServiceLive_;

/**
 * Effectful YAML text-to-unknown schema transformation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const YamlTextToUnknown = YamlTextToUnknown_;
