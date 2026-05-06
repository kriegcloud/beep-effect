// /**
//  * A module containing utilities & combinators for working with non-empty sets.
//  *
//  * @module
//  * @since 0.0.0
//  */
// import * as A from "effect/Array";
// import type { Equivalence, Order } from "effect";
// import { flow, pipe, dual } from "effect/Function";
//
// /**
//  * @since 0.0.0
//  * @category models
//  */
// export interface NonEmptyBrand {
//   readonly NonEmpty: unique symbol;
// }
//
// /**
//  * @category models
//  * @since 0.0.0
//  */
// export type NonEmptySet<A> = Set<A> & NonEmptyBrand;
//
//
// function make_<A>(ord: Order.Order<A>, eq_?: Equivalence.Equivalence<A>) {
//   const eq = eq_ ?? ((x, y) => ord(x, y) === 0);
//
//   const fromArray_ = A.fromAr
// }
