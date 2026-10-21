/**
 * Registered JSON Schema node transforms, composed into the generator's `onEnter` hook.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { composeTransforms as composeRegisteredTransforms } from "./internal/transforms.ts";
import type * as JsonSchema from "effect/JsonSchema";
import type { NamedTransform } from "./CodegenKit.models.ts";
import type { NodeTransform as InternalNodeTransform } from "./internal/transforms.ts";

/**
 * Pure rewrite applied to one JSON Schema node by the generator's `onEnter` hook.
 *
 * **Example** (Apply a composed transform to one node)
 *
 * ```ts
 * import { composeTransforms } from "@beep/codegen-kit/CodegenKit.transforms"
 * import type { NodeTransform } from "@beep/codegen-kit/CodegenKit.transforms"
 *
 * const hook: NodeTransform = composeTransforms(["nullableTypeArray"], {})
 *
 * console.log(hook({ type: ["string", "null"] })) // => { anyOf: [{ type: "string" }, { type: "null" }] }
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type NodeTransform = InternalNodeTransform;

/**
 * Composes registered transforms, in order, into the node hook the generator runs on every schema node.
 *
 * **Details**
 *
 * The kit passes this hook to the upstream generator as `onEnter`, so it receives the raw document
 * definitions. `distributeAllOf` applies the other selected transforms to every subtree and every
 * inlined `$ref` target before it distributes, and all registered transforms are idempotent, so a
 * node that was already rewritten passes through unchanged. Unsupported shapes throw a
 * `CodegenTransformError`, which generation reports as the cause of a `CodegenGenerateError`.
 *
 * **Example** (Lower an ACP forward-compatible variant)
 *
 * ```ts
 * import { composeTransforms } from "@beep/codegen-kit/CodegenKit.transforms"
 *
 * const hook = composeTransforms(["unevaluatedPropertiesOpen", "notDiscriminatorPattern"], {})
 * const other = hook({
 *   type: "object",
 *   properties: { type: { type: "string" } },
 *   unevaluatedProperties: true,
 *   not: { anyOf: [{ properties: { type: { const: "text" } } }] }
 * })
 *
 * console.log(other.additionalProperties) // => true
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const composeTransforms: {
  (definitions: JsonSchema.Definitions): (names: ReadonlyArray<NamedTransform>) => NodeTransform;
  (names: ReadonlyArray<NamedTransform>, definitions: JsonSchema.Definitions): NodeTransform;
} = composeRegisteredTransforms;
