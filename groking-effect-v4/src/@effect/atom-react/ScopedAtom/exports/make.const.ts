/**
 * Export Playground
 *
 * Package: @effect/atom-react
 * Module: @effect/atom-react/ScopedAtom
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/atom/react/src/ScopedAtom.ts
 * Generated: 2026-02-19T04:13:59.410Z
 *
 * Overview:
 * Creates a ScopedAtom from a factory function.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Atom from "effect/unstable/reactivity/Atom"
 * import * as React from "react"
 * import * as ScopedAtom from "@effect/atom-react/ScopedAtom"
 * import { useAtomValue } from "@effect/atom-react"
 *
 * const User = ScopedAtom.make((name: string) => Atom.make(name))
 *
 * function UserName() {
 *   const atom = User.use()
 *   const value = useAtomValue(atom)
 *   return React.createElement("span", null, value)
 * }
 *
 * export function App() {
 *   return React.createElement(
 *     User.Provider,
 *     { value: "Ada" },
 *     React.createElement(UserName)
 *   )
 * }
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
import * as ScopedAtomModule from "@effect/atom-react/ScopedAtom";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "@effect/atom-react/ScopedAtom";
const sourceSummary = "Creates a ScopedAtom from a factory function.";
const sourceExample =
  'import * as Atom from "effect/unstable/reactivity/Atom"\nimport * as React from "react"\nimport * as ScopedAtom from "@effect/atom-react/ScopedAtom"\nimport { useAtomValue } from "@effect/atom-react"\n\nconst User = ScopedAtom.make((name: string) => Atom.make(name))\n\nfunction UserName() {\n  const atom = User.use()\n  const value = useAtomValue(atom)\n  return React.createElement("span", null, value)\n}\n\nexport function App() {\n  return React.createElement(\n    User.Provider,\n    { value: "Ada" },\n    React.createElement(UserName)\n  )\n}';
const moduleRecord = ScopedAtomModule as Record<string, unknown>;

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
