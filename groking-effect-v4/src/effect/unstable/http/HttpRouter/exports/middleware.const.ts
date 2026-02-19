/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/http/HttpRouter
 * Export: middleware
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/http/HttpRouter.ts
 * Generated: 2026-02-19T04:14:26.512Z
 *
 * Overview:
 * Create a middleware layer that can be used to modify requests and responses.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as Layer from "effect/Layer"
 * import * as ServiceMap from "effect/ServiceMap"
 * import * as HttpMiddleware from "effect/unstable/http/HttpMiddleware"
 * import * as HttpRouter from "effect/unstable/http/HttpRouter"
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
 * 
 * // Here we are defining a CORS middleware
 * const CorsMiddleware = HttpRouter.middleware(HttpMiddleware.cors()).layer
 * // You can also use HttpRouter.cors() to create a CORS middleware
 * 
 * class CurrentSession extends ServiceMap.Service<CurrentSession, {
 *   readonly token: string
 * }>()("CurrentSession") {}
 * 
 * // You can create middleware that provides a service to the HTTP requests.
 * const SessionMiddleware = HttpRouter.middleware<{
 *   provides: CurrentSession
 * }>()(
 *   Effect.gen(function*() {
 *     yield* Effect.log("SessionMiddleware initialized")
 * 
 *     return (httpEffect) =>
 *       Effect.provideService(httpEffect, CurrentSession, {
 *         token: "dummy-token"
 *       })
 *   })
 * ).layer
 * 
 * Effect.gen(function*() {
 *   const router = yield* HttpRouter.HttpRouter
 *   yield* router.add(
 *     "GET",
 *     "/hello",
 *     Effect.gen(function*() {
 *       // Requests can now access the current session
 *       const session = yield* CurrentSession
 *       return HttpServerResponse.text(
 *         `Hello, World! Your token is ${session.token}`
 *       )
 *     })
 *   )
 * }).pipe(
 *   Layer.effectDiscard,
 *   // Provide the SessionMiddleware & CorsMiddleware to some routes
 *   Layer.provide([SessionMiddleware, CorsMiddleware])
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as HttpRouterModule from "effect/unstable/http/HttpRouter";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "middleware";
const exportKind = "const";
const moduleImportPath = "effect/unstable/http/HttpRouter";
const sourceSummary = "Create a middleware layer that can be used to modify requests and responses.";
const sourceExample = "import { Effect } from \"effect\"\nimport * as Layer from \"effect/Layer\"\nimport * as ServiceMap from \"effect/ServiceMap\"\nimport * as HttpMiddleware from \"effect/unstable/http/HttpMiddleware\"\nimport * as HttpRouter from \"effect/unstable/http/HttpRouter\"\nimport * as HttpServerResponse from \"effect/unstable/http/HttpServerResponse\"\n\n// Here we are defining a CORS middleware\nconst CorsMiddleware = HttpRouter.middleware(HttpMiddleware.cors()).layer\n// You can also use HttpRouter.cors() to create a CORS middleware\n\nclass CurrentSession extends ServiceMap.Service<CurrentSession, {\n  readonly token: string\n}>()(\"CurrentSession\") {}\n\n// You can create middleware that provides a service to the HTTP requests.\nconst SessionMiddleware = HttpRouter.middleware<{\n  provides: CurrentSession\n}>()(\n  Effect.gen(function*() {\n    yield* Effect.log(\"SessionMiddleware initialized\")\n\n    return (httpEffect) =>\n      Effect.provideService(httpEffect, CurrentSession, {\n        token: \"dummy-token\"\n      })\n  })\n).layer\n\nEffect.gen(function*() {\n  const router = yield* HttpRouter.HttpRouter\n  yield* router.add(\n    \"GET\",\n    \"/hello\",\n    Effect.gen(function*() {\n      // Requests can now access the current session\n      const session = yield* CurrentSession\n      return HttpServerResponse.text(\n        `Hello, World! Your token is ${session.token}`\n      )\n    })\n  )\n}).pipe(\n  Layer.effectDiscard,\n  // Provide the SessionMiddleware & CorsMiddleware to some routes\n  Layer.provide([SessionMiddleware, CorsMiddleware])\n)";
const moduleRecord = HttpRouterModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
