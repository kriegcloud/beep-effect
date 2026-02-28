/**
 * Experimental media-reference upload capability token.
 *
 * @since 0.0.0
 * @module @beep/ontology/experimental/createMediaReference
 */

import type { MediaReference } from "../object/Media.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type { Experiment } from "./Experiment.js";

/**
 * Uploads media and returns a media-reference value.
 *
 * @since 0.0.0
 * @category models
 */
type CreateMediaReferenceFn = <
  Q extends ObjectOrInterfaceDefinition,
  const L extends PropertyKeys.Filtered<Q, "mediaReference">,
>(args: {
  data: Blob;
  fileName: string;
  objectType: Q;
  propertyType: L;
}) => Promise<MediaReference>;

/**
 * Experiment token for media-reference upload support.
 *
 * @since 0.0.0
 * @category experimental
 */
export const __EXPERIMENTAL__NOT_SUPPORTED_YET__createMediaReference: Experiment<
  "2.1.0",
  "__EXPERIMENTAL__NOT_SUPPORTED_YET__createMediaReference",
  { createMediaReference: CreateMediaReferenceFn }
> = {
  name: "__EXPERIMENTAL__NOT_SUPPORTED_YET__createMediaReference",
  type: "experiment",
  version: "2.1.0",
};
