import { Effect } from "effect";

declare const a: Effect.Effect<number, never, never>;
declare const b: Effect.Effect<number, never, unknown>;

const x: Effect.Effect<number, never, unknown> = a;
const y: Effect.Effect<number, never, never> = b;
