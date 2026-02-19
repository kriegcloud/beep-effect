/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Inspectable
 * Export: Class
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/Inspectable.ts
 * Generated: 2026-02-19T04:14:14.188Z
 *
 * Overview:
 * Abstract base class that implements the Inspectable interface.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Inspectable } from "effect"
 * 
 * class User extends Inspectable.Class {
 *   constructor(
 *     public readonly id: number,
 *     public readonly name: string,
 *     public readonly email: string
 *   ) {
 *     super()
 *   }
 * 
 *   toJSON() {
 *     return {
 *       _tag: "User",
 *       id: this.id,
 *       name: this.name,
 *       email: this.email
 *     }
 *   }
 * }
 * 
 * const user = new User(1, "Alice", "alice@example.com")
 * console.log(user.toString()) // Pretty printed JSON with _tag, id, name, email
 * console.log(user) // In Node.js, shows the same formatted output
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as InspectableModule from "effect/Inspectable";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Class";
const exportKind = "class";
const moduleImportPath = "effect/Inspectable";
const sourceSummary = "Abstract base class that implements the Inspectable interface.";
const sourceExample = "import { Inspectable } from \"effect\"\n\nclass User extends Inspectable.Class {\n  constructor(\n    public readonly id: number,\n    public readonly name: string,\n    public readonly email: string\n  ) {\n    super()\n  }\n\n  toJSON() {\n    return {\n      _tag: \"User\",\n      id: this.id,\n      name: this.name,\n      email: this.email\n    }\n  }\n}\n\nconst user = new User(1, \"Alice\", \"alice@example.com\")\nconsole.log(user.toString()) // Pretty printed JSON with _tag, id, name, email\nconsole.log(user) // In Node.js, shows the same formatted output";
const moduleRecord = InspectableModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
