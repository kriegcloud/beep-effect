/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Request
 * Export: tagged
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Request.ts
 * Generated: 2026-02-19T04:14:16.507Z
 *
 * Overview:
 * Creates a constructor function for a tagged Request type. The tag is automatically added to the request, making it useful for discriminated unions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Request } from "effect"
 * 
 * declare const User: unique symbol
 * declare const UserNotFound: unique symbol
 * declare const Post: unique symbol
 * declare const PostNotFound: unique symbol
 * type User = typeof User
 * type UserNotFound = typeof UserNotFound
 * type Post = typeof Post
 * type PostNotFound = typeof PostNotFound
 * 
 * interface GetUser extends Request.Request<User, UserNotFound> {
 *   readonly _tag: "GetUser"
 *   readonly id: string
 * }
 * 
 * interface GetPost extends Request.Request<Post, PostNotFound> {
 *   readonly _tag: "GetPost"
 *   readonly id: string
 * }
 * 
 * const GetUser = Request.tagged<GetUser>("GetUser")
 * const GetPost = Request.tagged<GetPost>("GetPost")
 * 
 * const userRequest = GetUser({ id: "user-123" })
 * const postRequest = GetPost({ id: "post-456" })
 * 
 * // _tag is automatically set
 * console.log(userRequest._tag) // "GetUser"
 * console.log(postRequest._tag) // "GetPost"
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
const exportName = "tagged";
const exportKind = "const";
const moduleImportPath = "effect/Request";
const sourceSummary = "Creates a constructor function for a tagged Request type. The tag is automatically added to the request, making it useful for discriminated unions.";
const sourceExample = "import { Request } from \"effect\"\n\ndeclare const User: unique symbol\ndeclare const UserNotFound: unique symbol\ndeclare const Post: unique symbol\ndeclare const PostNotFound: unique symbol\ntype User = typeof User\ntype UserNotFound = typeof UserNotFound\ntype Post = typeof Post\ntype PostNotFound = typeof PostNotFound\n\ninterface GetUser extends Request.Request<User, UserNotFound> {\n  readonly _tag: \"GetUser\"\n  readonly id: string\n}\n\ninterface GetPost extends Request.Request<Post, PostNotFound> {\n  readonly _tag: \"GetPost\"\n  readonly id: string\n}\n\nconst GetUser = Request.tagged<GetUser>(\"GetUser\")\nconst GetPost = Request.tagged<GetPost>(\"GetPost\")\n\nconst userRequest = GetUser({ id: \"user-123\" })\nconst postRequest = GetPost({ id: \"post-456\" })\n\n// _tag is automatically set\nconsole.log(userRequest._tag) // \"GetUser\"\nconsole.log(postRequest._tag) // \"GetPost\"";
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
