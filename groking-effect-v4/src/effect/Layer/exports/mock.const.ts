/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: mock
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:50:37.315Z
 *
 * Overview:
 * Creates a mock layer for testing purposes. You can provide a partial implementation of the service, and any methods not provided will throw an unimplemented defect when called.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap } from "effect"
 *
 * class UserService extends ServiceMap.Service<UserService, {
 *   readonly config: { apiUrl: string }
 *   readonly getUser: (
 *     id: string
 *   ) => Effect.Effect<{ id: string; name: string }, Error>
 *   readonly deleteUser: (id: string) => Effect.Effect<void, Error>
 *   readonly updateUser: (
 *     id: string,
 *     data: object
 *   ) => Effect.Effect<{ id: string; name: string }, Error>
 * }>()("UserService") {}
 *
 * // Create a partial mock - only implement what you need for testing
 * const testUserLayer = Layer.mock(UserService)({
 *   config: { apiUrl: "https://test-api.com" }, // Required - non-Effect property
 *   getUser: (id: string) => Effect.succeed({ id, name: "Test User" }) // Mock implementation
 *   // deleteUser and updateUser are omitted - will throw UnimplementedError if called
 * })
 *
 * // Use in tests
 * const testProgram = Effect.gen(function*() {
 *   const userService = yield* UserService
 *
 *   // This works - we provided an implementation
 *   const user = yield* userService.getUser("123")
 *   console.log(user.name) // "Test User"
 *
 *   // This would throw - we didn't implement deleteUser
 *   // yield* userService.deleteUser("123") // UnimplementedError
 * }).pipe(
 *   Effect.provide(testUserLayer)
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mock";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary =
  "Creates a mock layer for testing purposes. You can provide a partial implementation of the service, and any methods not provided will throw an unimplemented defect when called.";
const sourceExample =
  'import { Effect, Layer, ServiceMap } from "effect"\n\nclass UserService extends ServiceMap.Service<UserService, {\n  readonly config: { apiUrl: string }\n  readonly getUser: (\n    id: string\n  ) => Effect.Effect<{ id: string; name: string }, Error>\n  readonly deleteUser: (id: string) => Effect.Effect<void, Error>\n  readonly updateUser: (\n    id: string,\n    data: object\n  ) => Effect.Effect<{ id: string; name: string }, Error>\n}>()("UserService") {}\n\n// Create a partial mock - only implement what you need for testing\nconst testUserLayer = Layer.mock(UserService)({\n  config: { apiUrl: "https://test-api.com" }, // Required - non-Effect property\n  getUser: (id: string) => Effect.succeed({ id, name: "Test User" }) // Mock implementation\n  // deleteUser and updateUser are omitted - will throw UnimplementedError if called\n})\n\n// Use in tests\nconst testProgram = Effect.gen(function*() {\n  const userService = yield* UserService\n\n  // This works - we provided an implementation\n  const user = yield* userService.getUser("123")\n  console.log(user.name) // "Test User"\n\n  // This would throw - we didn\'t implement deleteUser\n  // yield* userService.deleteUser("123") // UnimplementedError\n}).pipe(\n  Effect.provide(testUserLayer)\n)';
const moduleRecord = LayerModule as Record<string, unknown>;

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
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
