/**
 * Reusable field building blocks for per-tag occurrence schemas.
 *
 * @since 0.0.0
 * @category DomainModel
 */
import * as S from "effect/Schema";

/** @internal */
export const typeField = { type: S.String } as const;
/** @internal */
export const optionalType = { type: S.optionalKey(S.String) } as const;
/** @internal */
export const nameField = { name: S.String } as const;
/** @internal */
export const optionalName = { name: S.optionalKey(S.String) } as const;
/** @internal */
export const optionalDesc = { description: S.optionalKey(S.String) } as const;
/** @internal */
export const empty = {} as const;
