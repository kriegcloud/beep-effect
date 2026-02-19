/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: toStandardSchemaV1
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:14:18.722Z
 *
 * Overview:
 * Returns a "Standard Schema" object conforming to the [Standard Schema v1](https://standardschema.dev/) specification.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 *
 * // Define custom hook functions for error formatting
 * const leafHook = (issue: any) => {
 *   switch (issue._tag) {
 *     case "InvalidType":
 *       return "Expected different type"
 *     case "InvalidValue":
 *       return "Invalid value provided"
 *     case "MissingKey":
 *       return "Required property missing"
 *     case "UnexpectedKey":
 *       return "Unexpected property found"
 *     case "Forbidden":
 *       return "Operation not allowed"
 *     case "OneOf":
 *       return "Multiple valid options available"
 *     default:
 *       return "Validation error"
 *   }
 * }
 *
 * // Create a standard schema from a regular schema
 * const PersonSchema = Schema.Struct({
 *   name: Schema.NonEmptyString,
 *   age: Schema.Number.check(Schema.isBetween({ minimum: 0, maximum: 150 }))
 * })
 *
 * const standardSchema = Schema.toStandardSchemaV1(PersonSchema, {
 *   leafHook
 * })
 *
 * // The standard schema can be used with any Standard Schema v1 compatible library
 * const validResult = standardSchema["~standard"].validate({
 *   name: "Alice",
 *   age: 30
 * })
 * console.log(validResult) // { value: { name: "Alice", age: 30 } }
 *
 * const invalidResult = standardSchema["~standard"].validate({
 *   name: "",
 *   age: 200
 * })
 * console.log(invalidResult) // { issues: [{ path: ["name"], message: "..." }, { path: ["age"], message: "..." }] }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toStandardSchemaV1";
const exportKind = "function";
const moduleImportPath = "effect/Schema";
const sourceSummary =
  'Returns a "Standard Schema" object conforming to the [Standard Schema v1](https://standardschema.dev/) specification.';
const sourceExample =
  'import { Schema } from "effect"\n\n// Define custom hook functions for error formatting\nconst leafHook = (issue: any) => {\n  switch (issue._tag) {\n    case "InvalidType":\n      return "Expected different type"\n    case "InvalidValue":\n      return "Invalid value provided"\n    case "MissingKey":\n      return "Required property missing"\n    case "UnexpectedKey":\n      return "Unexpected property found"\n    case "Forbidden":\n      return "Operation not allowed"\n    case "OneOf":\n      return "Multiple valid options available"\n    default:\n      return "Validation error"\n  }\n}\n\n// Create a standard schema from a regular schema\nconst PersonSchema = Schema.Struct({\n  name: Schema.NonEmptyString,\n  age: Schema.Number.check(Schema.isBetween({ minimum: 0, maximum: 150 }))\n})\n\nconst standardSchema = Schema.toStandardSchemaV1(PersonSchema, {\n  leafHook\n})\n\n// The standard schema can be used with any Standard Schema v1 compatible library\nconst validResult = standardSchema["~standard"].validate({\n  name: "Alice",\n  age: 30\n})\nconsole.log(validResult) // { value: { name: "Alice", age: 30 } }\n\nconst invalidResult = standardSchema["~standard"].validate({\n  name: "",\n  age: 200\n})\nconsole.log(invalidResult) // { issues: [{ path: ["name"], message: "..." }, { path: ["age"], message: "..." }] }';
const moduleRecord = SchemaModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
