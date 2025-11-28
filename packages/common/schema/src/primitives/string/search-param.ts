// import * as S from "effect/Schema";
// import { pipe } from 'effect';
// import { constant } from "effect/Function";
// import * as Eq from "effect/Equal"
// import * as O from "effect/Option";
// import * as Str from "effect/String";
// import * as Bool from "effect/Boolean";

// const constEmptyStr = constant("")
// export const searchParam = <A = never, I extends string = never>(
//   name: string, schema: S.Schema<A, I>) => {
//   const decode = S.decodeEither(schema)
//   const encoded = S.encodeEither(schema);
//   const searchParams = Bool.match(
//     typeof window === "undefined",
//     {
//       onTrue: () => O.some(new URLSearchParams(window.location.search)),
//       onFalse: () => O.none<URLSearchParams>()
//     }
//   )
//
//   const newValue = searchParams.pipe(
//     O.match({
//       onNone: constEmptyStr,
//       onSome: (searchParams) => searchParams.get(name) || ""
//     }),
//
//   )
//
//
// }
