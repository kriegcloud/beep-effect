/**
 * Namespace of noop helpers surfaced via `@beep/utils`, giving docs a clear
 * place to describe synchronous and Effect-based placeholders.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const noOpsExample: FooTypes.Prettify<{ completed: boolean }> = { completed: false };
 * Utils.noOp();
 * void noOpsExample;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import * as Effect from "effect/Effect";

type NoOp = () => void;
type NullOp = () => null;
type AsyncNoOp = () => Promise<void>;
type AsyncNullOp = () => Promise<null>;
type NullOpE = () => Effect.Effect<null, never, never>;
/**
 * Synchronous no-op used when callbacks are required but no behavior is
 * desired.
 *
 * @example
 * import { noOp } from "@beep/utils/noOps";
 *
 * const noOpsButton: { onclick?: undefined | (() => void) } = {};
 * noOpsButton.onclick = noOp;
 * void noOpsButton;
 *
 * @category Core/NoOps
 * @since 0.1.0
 */
export const noOp: NoOp = () => {};
/**
 * Returns `null` consistently; useful for placeholder reducers.
 *
 * @example
 * import { nullOp } from "@beep/utils/noOps";
 *
 * const value = nullOp();
 *
 * @category Core/NoOps
 * @since 0.1.0
 */
export const nullOp: NullOp = () => null;
/**
 * Async void no-op.
 *
 * @example
 * import { asyncNoOp } from "@beep/utils/noOps";
 *
 * await asyncNoOp();
 *
 * @category Core/NoOps
 * @since 0.1.0
 */
export const asyncNoOp: AsyncNoOp = async () => {};
/**
 * Async null no-op.
 *
 * @example
 * import { asyncNullOp } from "@beep/utils/noOps";
 *
 * await asyncNullOp();
 *
 * @category Core/NoOps
 * @since 0.1.0
 */
export const asyncNullOp: AsyncNullOp = async () => null;

/**
 * Effect-based no-op returning `null` in the success channel.
 *
 * @example
 * import { nullOpE } from "@beep/utils/noOps";
 * import * as Effect from "effect/Effect";
 *
 * await Effect.runPromise(nullOpE());
 *
 * @category Core/NoOps
 * @since 0.1.0
 */
export const nullOpE: NullOpE = () => Effect.succeed(null);
