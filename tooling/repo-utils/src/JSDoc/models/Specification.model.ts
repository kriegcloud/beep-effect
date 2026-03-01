import type { Specification as SpecificationTypeModel } from "./JSDoc.model.js";
import { Specification as SpecificationSchema } from "./JSDoc.model.js";

/**
 * Runtime schema export for canonical documentation standards.
 *
 * @since 0.0.0
 * @category models
 */
export const Specification = SpecificationSchema;

/**
 * Type alias export for the canonical specification union.
 *
 * @since 0.0.0
 * @category models
 */
export type SpecificationType = SpecificationTypeModel;
