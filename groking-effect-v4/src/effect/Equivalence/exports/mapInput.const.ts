/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: mapInput
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:14:12.631Z
 *
 * Overview:
 * Transforms an equivalence relation by mapping the input values before comparison.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence } from "effect"
 * 
 * interface User {
 *   id: number
 *   name: string
 *   email: string
 * }
 * 
 * // Create equivalence based on user ID only
 * const userByIdEq = Equivalence.mapInput(
 *   Equivalence.strictEqual<number>(),
 *   (user: User) => user.id
 * )
 * 
 * const user1 = { id: 1, name: "Alice", email: "alice@example.com" }
 * const user2 = { id: 1, name: "Alice Smith", email: "alice.smith@example.com" }
 * const user3 = { id: 2, name: "Bob", email: "bob@example.com" }
 * 
 * console.log(userByIdEq(user1, user2)) // true (same ID)
 * console.log(userByIdEq(user1, user3)) // false (different ID)
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
const exportName = "mapInput";
const exportKind = "const";
const moduleImportPath = "effect/Equivalence";
const sourceSummary = "Transforms an equivalence relation by mapping the input values before comparison.";
const sourceExample = "import { Equivalence } from \"effect\"\n\ninterface User {\n  id: number\n  name: string\n  email: string\n}\n\n// Create equivalence based on user ID only\nconst userByIdEq = Equivalence.mapInput(\n  Equivalence.strictEqual<number>(),\n  (user: User) => user.id\n)\n\nconst user1 = { id: 1, name: \"Alice\", email: \"alice@example.com\" }\nconst user2 = { id: 1, name: \"Alice Smith\", email: \"alice.smith@example.com\" }\nconst user3 = { id: 2, name: \"Bob\", email: \"bob@example.com\" }\n\nconsole.log(userByIdEq(user1, user2)) // true (same ID)\nconsole.log(userByIdEq(user1, user3)) // false (different ID)";
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
