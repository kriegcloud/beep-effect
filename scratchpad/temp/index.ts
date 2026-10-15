import * as O from "effect/Option";
import * as Str from "effect/String";

// export const getOrElseFalse: <A>(self: O.Option<A>) => boolean | A =
//   <A>(self: O.Option<A>): boolean | A => O.getOrElse(self, thunkFalse);

export const getOrElseFalse: <A>(self: O.Option<A>) => false | A =
  <A>(self: O.Option<A>): false | A => O.getOrElse(self, () => false);

// export const getOrElseTrue: <A>(self: O.Option<A>) => boolean | A =
//   <A>(self: O.Option<A>): boolean | A => O.getOrElse(self, thunkTrue);

export const getOrElseTrue: <A>(self: O.Option<A>) => true | A =
  <A>(self: O.Option<A>): true | A => O.getOrElse(self, () => true);

// export const getOrElse0: <A>(self: O.Option<A>) => number | A =
//   <A>(self: O.Option<A>): number | A => O.getOrElse(self, thunk0);

export const getOrElse0: <A>(self: O.Option<A>) => 0 | A =
  <A>(self: O.Option<A>): 0 | A => O.getOrElse(self, () => 0);

// export const getOrElseEmptyStr: <A>(self: O.Option<A>) => string | A =
//   <A>(self: O.Option<A>): string | A => O.getOrElse(self, thunkEmptyStr);

export const getOrElseEmptyStr: <A>(self: O.Option<A>) => "" | A =
  <A>(self: O.Option<A>): "" | A => O.getOrElse(self, () => Str.empty);

