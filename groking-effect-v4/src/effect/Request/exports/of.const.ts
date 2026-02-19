/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Request
 * Export: of
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Request.ts
 * Generated: 2026-02-19T04:14:16.507Z
 *
 * Overview:
 * Creates a constructor function for a specific Request type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Request } from "effect"
 * 
 * declare const UserProfile: unique symbol
 * declare const ProfileError: unique symbol
 * type UserProfile = typeof UserProfile
 * type ProfileError = typeof ProfileError
 * 
 * interface GetUserProfile extends Request.Request<UserProfile, ProfileError> {
 *   readonly id: string
 *   readonly includeSettings: boolean
 * }
 * 
 * const GetUserProfile = Request.of<GetUserProfile>()
 * 
 * const request = GetUserProfile({
 *   id: "user-123",
 *   includeSettings: true
 * })
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
import * as RequestModule from "effect/Request";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "of";
const exportKind = "const";
const moduleImportPath = "effect/Request";
const sourceSummary = "Creates a constructor function for a specific Request type.";
const sourceExample = "import { Request } from \"effect\"\n\ndeclare const UserProfile: unique symbol\ndeclare const ProfileError: unique symbol\ntype UserProfile = typeof UserProfile\ntype ProfileError = typeof ProfileError\n\ninterface GetUserProfile extends Request.Request<UserProfile, ProfileError> {\n  readonly id: string\n  readonly includeSettings: boolean\n}\n\nconst GetUserProfile = Request.of<GetUserProfile>()\n\nconst request = GetUserProfile({\n  id: \"user-123\",\n  includeSettings: true\n})";
const moduleRecord = RequestModule as Record<string, unknown>;

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
