// import * as HttpServerResponse from "@beep/schema/contract/http-server-response";
// import  {HttpServerRequest} from "@beep/schema/contract/http-server-request";
// import  * as Effect from "effect/Effect";
// import {Router} from "@beep/schema/contract/router";
// import {AnySchema, HttpMethod} from "@beep/schema/contract/types";
// import * as AST from "effect/SchemaAST";
// import * as S from "effect/Schema"
// const isSupportedMethod = (method: string) => S.is(HttpMethod)(method)
// const toPathname = (url: string) => {
//   try {
//     return new URL(url).pathname
//   } catch {
//     return "/"
//   }
// }
//
//
// const decodePayload = <S extends AnySchema>(schema: S) => Effect.gen(function* () {
//   const request = yield* HttpServerRequest;
//   if (AST.isNeverKeyword(schema.ast)) return undefined as S.Schema.Type<S>
//
//   return request.json.pipe(
//     Effect.flatMap
//   )
// })
//
// export const makeHttpApp = Effect.gen(function* () {
//   const router = yield* Router;
//
//   return Effect.gen(function* () {
//     const request = yield* HttpServerRequest;
//     const method = request.method.toUpperCase();
//
//     if (!isSupportedMethod(method)) return HttpServerResponse.notImplemented()
//     const pathname = toPathname(request.url);
//     const endpoint = yield* router.find(method, pathname)
//     if (!endpoint) return HttpServerResponse.notImplemented();
//
//     const handler = Effect.gen(function* () {
//       const result = yield* endpoint.handler()
//     });
//     return yield* handler
//   })
// });
//
// export type HttpApp = Effect.Effect.Success<
//  typeof makeHttpApp
// >;
