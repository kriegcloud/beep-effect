/**
 * Layout schema definitions for resizable panels.
 *
 * This file intentionally has NO "use client" directive so it can be
 * imported by both Server Components and Client Components.
 *
 * The schema and parsing logic are pure - they don't use any browser
 * or React-specific APIs.
 */
import * as S from "effect/Schema";

const layoutSchema = S.parseJson(
  S.Struct({
    leftSize: S.optional(S.Number),
    rightSize: S.optional(S.Number),
  })
);

export const parseLayout = S.decodeUnknownOption(layoutSchema);

export type Layout = { leftSize?: undefined | number; rightSize?: undefined | number };
