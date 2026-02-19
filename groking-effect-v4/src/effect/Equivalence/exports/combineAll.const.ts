/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: combineAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:14:12.631Z
 *
 * Overview:
 * Combines multiple equivalence relations into a single equivalence using logical AND.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence } from "effect"
 * 
 * interface Point3D {
 *   x: number
 *   y: number
 *   z: number
 * }
 * 
 * const xEq = Equivalence.mapInput(
 *   Equivalence.strictEqual<number>(),
 *   (p: Point3D) => p.x
 * )
 * const yEq = Equivalence.mapInput(
 *   Equivalence.strictEqual<number>(),
 *   (p: Point3D) => p.y
 * )
 * const zEq = Equivalence.mapInput(
 *   Equivalence.strictEqual<number>(),
 *   (p: Point3D) => p.z
 * )
 * 
 * const point3DEq = Equivalence.combineAll([xEq, yEq, zEq])
 * 
 * const point1 = { x: 1, y: 2, z: 3 }
 * const point2 = { x: 1, y: 2, z: 3 }
 * const point3 = { x: 1, y: 2, z: 4 }
 * 
 * console.log(point3DEq(point1, point2)) // true
 * console.log(point3DEq(point1, point3)) // false (different z)
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
import * as EquivalenceModule from "effect/Equivalence";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "combineAll";
const exportKind = "const";
const moduleImportPath = "effect/Equivalence";
const sourceSummary = "Combines multiple equivalence relations into a single equivalence using logical AND.";
const sourceExample = "import { Equivalence } from \"effect\"\n\ninterface Point3D {\n  x: number\n  y: number\n  z: number\n}\n\nconst xEq = Equivalence.mapInput(\n  Equivalence.strictEqual<number>(),\n  (p: Point3D) => p.x\n)\nconst yEq = Equivalence.mapInput(\n  Equivalence.strictEqual<number>(),\n  (p: Point3D) => p.y\n)\nconst zEq = Equivalence.mapInput(\n  Equivalence.strictEqual<number>(),\n  (p: Point3D) => p.z\n)\n\nconst point3DEq = Equivalence.combineAll([xEq, yEq, zEq])\n\nconst point1 = { x: 1, y: 2, z: 3 }\nconst point2 = { x: 1, y: 2, z: 3 }\nconst point3 = { x: 1, y: 2, z: 4 }\n\nconsole.log(point3DEq(point1, point2)) // true\nconsole.log(point3DEq(point1, point3)) // false (different z)";
const moduleRecord = EquivalenceModule as Record<string, unknown>;

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
