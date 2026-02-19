/**
 * Export Playground
 *
 * Package: @effect/atom-react
 * Module: @effect/atom-react/ScopedAtom
 * Export: ScopedAtom
 * Kind: interface
 * Source: .repos/effect-smol/packages/atom/react/src/ScopedAtom.ts
 * Generated: 2026-02-19T04:13:59.410Z
 *
 * Overview:
 * Scoped Atom interface with a provider-backed instance.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Atom from "effect/unstable/reactivity/Atom"
 * import * as React from "react"
 * import * as ScopedAtom from "@effect/atom-react/ScopedAtom"
 * import { useAtomValue } from "@effect/atom-react"
 * 
 * const Counter = ScopedAtom.make(() => Atom.make(0))
 * 
 * function View() {
 *   const atom = Counter.use()
 *   const value = useAtomValue(atom)
 *   return React.createElement("div", null, value)
 * }
 * 
 * export function App() {
 *   return React.createElement(Counter.Provider, null, React.createElement(View))
 * }
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ScopedAtomModule from "@effect/atom-react/ScopedAtom";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ScopedAtom";
const exportKind = "interface";
const moduleImportPath = "@effect/atom-react/ScopedAtom";
const sourceSummary = "Scoped Atom interface with a provider-backed instance.";
const sourceExample = "import * as Atom from \"effect/unstable/reactivity/Atom\"\nimport * as React from \"react\"\nimport * as ScopedAtom from \"@effect/atom-react/ScopedAtom\"\nimport { useAtomValue } from \"@effect/atom-react\"\n\nconst Counter = ScopedAtom.make(() => Atom.make(0))\n\nfunction View() {\n  const atom = Counter.use()\n  const value = useAtomValue(atom)\n  return React.createElement(\"div\", null, value)\n}\n\nexport function App() {\n  return React.createElement(Counter.Provider, null, React.createElement(View))\n}";
const moduleRecord = ScopedAtomModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
