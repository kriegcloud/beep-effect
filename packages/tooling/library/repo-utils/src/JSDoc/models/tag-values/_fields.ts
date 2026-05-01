/**
 * Reusable field building blocks for per-tag occurrence schemas.
 *
 * @packageDocumentation
 * @category models
 * @since 0.0.0
 */
import * as S from "effect/Schema";

/**
 * Reusable required `type` field fragment.
 *
 * @internal
 * @example
 * ```ts
 * import { typeField } from "@beep/repo-utils/JSDoc/models/tag-values/_fields"
 * void typeField
 * ```
 * @category models
 * @since 0.0.0
 */
export const typeField = { type: S.String } as const;
/**
 * Reusable optional `type` field fragment.
 *
 * @internal
 * @example
 * ```ts
 * import { optionalType } from "@beep/repo-utils/JSDoc/models/tag-values/_fields"
 * void optionalType
 * ```
 * @category models
 * @since 0.0.0
 */
export const optionalType = { type: S.optionalKey(S.String) } as const;
/**
 * Reusable required `name` field fragment.
 *
 * @internal
 * @example
 * ```ts
 * import { nameField } from "@beep/repo-utils/JSDoc/models/tag-values/_fields"
 * void nameField
 * ```
 * @category models
 * @since 0.0.0
 */
export const nameField = { name: S.String } as const;
/**
 * Reusable optional `name` field fragment.
 *
 * @internal
 * @example
 * ```ts
 * import { optionalName } from "@beep/repo-utils/JSDoc/models/tag-values/_fields"
 * void optionalName
 * ```
 * @category models
 * @since 0.0.0
 */
export const optionalName = { name: S.optionalKey(S.String) } as const;
/**
 * Reusable optional `description` field fragment.
 *
 * @internal
 * @example
 * ```ts
 * import { optionalDesc } from "@beep/repo-utils/JSDoc/models/tag-values/_fields"
 * void optionalDesc
 * ```
 * @category models
 * @since 0.0.0
 */
export const optionalDesc = { description: S.optionalKey(S.String) } as const;
/**
 * Reusable empty field fragment.
 *
 * @internal
 * @example
 * ```ts
 * import { empty } from "@beep/repo-utils/JSDoc/models/tag-values/_fields"
 * void empty
 * ```
 * @category models
 * @since 0.0.0
 */
export const empty = {} as const;
