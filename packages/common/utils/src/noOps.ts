import * as Effect from "effect/Effect";

type NoOp = () => void;
type NullOp = () => null;
type AsyncNoOp = () => Promise<void>;
type AsyncNullOp = () => Promise<null>;
type NullOpE = () => Effect.Effect<null, never, never>;
export const noOp: NoOp = () => {};
export const nullOp: NullOp = () => null;
export const asyncNoOp: AsyncNoOp = async () => {};
export const asyncNullOp: AsyncNullOp = async () => null;

export const nullOpE: NullOpE = () => Effect.succeed(null);
