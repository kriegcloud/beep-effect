import type { UnsafeTypes } from "@beep/types";
import type * as Effect from "effect/Effect";

export const makeRepo = <
  SE,
  SR,
  I1,
  I2,
  I3,
  I4,
  I5,
  I6,
  I7,
  A1,
  A3,
  A5,
  A7,
  E1,
  E2,
  E3,
  E4,
  E5,
  E6,
  E7,
  R1,
  R2,
  R3,
  R4,
  R5,
  R6,
  R7,
  TExtra extends Record<string, UnsafeTypes.UnsafeAny> = NonNullable<unknown>,
>(
  maker: Effect.Effect<
    {
      readonly insert: (input: I1) => Effect.Effect<A1, E1, R1>;
      readonly insertVoid: (input: I2) => Effect.Effect<void, E2, R2>;
      readonly update: (input: I3) => Effect.Effect<A3, E3, R3>;
      readonly updateVoid: (input: I4) => Effect.Effect<void, E4, R4>;
      readonly findById: (input: I5) => Effect.Effect<A5, E5, R5>;
      readonly delete: (input: I6) => Effect.Effect<void, E6, R6>;
      readonly list: (input: I7) => Effect.Effect<A7, E7, R7>;
    } & TExtra,
    SE,
    SR
  >
) => maker;
