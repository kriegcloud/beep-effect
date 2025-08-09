// #!/usr/bin/env node
// import * as nodePath from "node:path";
// import { Json } from "@beep/domain/primitives";
// import { invariant } from "@beep/shared/invariant";
// import * as FileSystem from "@effect/platform/FileSystem";
// import * as NodeContext from "@effect/platform-node/NodeContext";
// import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
// import * as A from "effect/Array";
// import * as Cause from "effect/Cause";
// import * as Console from "effect/Console";
// import * as Effect from "effect/Effect";
// import * as HashMap from "effect/HashMap";
// import * as HashSet from "effect/HashSet";
// import * as O from "effect/Option";
// import * as ParseResult from "effect/ParseResult";
// import * as S from "effect/Schema";
// import {
//   createRepoDepMap,
//   repoWorkspaceMap,
//   TsconfigMap,
//   WorkspacePkgKeyPrefix,
// } from "./util";
// import { getRepoRoot } from "./util/getRepoRoot";
// export const BasicTsConfigSchema = S.Struct(
//   {
//     references: S.optional(
//       S.Array(
//         S.Struct({
//           path: S.String,
//         }),
//       ),
//     ),
//     compilerOptions: S.optional(
//       S.Struct(
//         {
//           paths: S.optional(
//             S.Record({
//               key: S.TemplateLiteral(`@beep/`, S.String),
//               value: S.NonEmptyArray(S.TemplateLiteral(`.`, S.String)),
//             }),
//           ),
//         },
//         S.Record({
//           key: S.String,
//           value: Json,
//         }),
//       ),
//     ),
//   },
//   S.Record({
//     key: S.String,
//     value: Json,
//   }),
// );
//
// export const BasicTsConfigFromString = S.transformOrFail(
//   S.String,
//   BasicTsConfigSchema,
//   {
//     strict: true,
//     decode: (str, _, ast) => {
//       try {
//         const parsed = JSON.parse(str);
//         return ParseResult.succeed(parsed);
//       } catch (e) {
//         return ParseResult.fail(
//           new ParseResult.Type(ast, str, "Invalid JSON string"),
//         );
//       }
//     },
//     encode: (pkgJson, _, ast) => {
//       try {
//         return ParseResult.succeed(JSON.stringify(pkgJson));
//       } catch (e) {
//         return ParseResult.fail(
//           new ParseResult.Type(ast, pkgJson, "Invalid date"),
//         );
//       }
//     },
//   },
// );
//
// const program = Effect.gen(function* () {
//   const fs = yield* FileSystem.FileSystem;
//   yield* Effect.log("Program started");
//
//   const repoDepMap = yield* createRepoDepMap;
//   const repoTsConfigPathMap = yield* TsconfigMap;
//   const repoPkgPathsMap = yield* repoWorkspaceMap;
//   const repoRoot = yield* getRepoRoot;
//
//   yield* Console.log(`\n...Repository Package Dependency HashMap...\n`);
//   yield* Console.log(JSON.stringify(repoDepMap, null, 2));
//   yield* Console.log(`\n...Repository TSConfig file paths HashMap...\n`);
//   yield* Console.log(JSON.stringify(repoTsConfigPathMap, null, 2));
//   yield* Console.log(`\n...Repository Package HashMap...\n`);
//   yield* Console.log(JSON.stringify(repoPkgPathsMap, null, 2));
//
//   const allWorkspaces = A.filter(
//     Array.from(HashMap.keys(repoPkgPathsMap)),
//     (k) => k !== "@beep/root",
//   );
//
//   // Enforce root tsconfig policies
//   const rootTsConfigsO = HashMap.get(repoTsConfigPathMap, "@beep/root");
//   if (O.isNone(rootTsConfigsO)) {
//     return yield* Effect.fail(new Error("No tsconfigs found for root"));
//   }
//   const rootTsConfigs = rootTsConfigsO.value;
//
//   // Helper to compute expected paths for root (all workspaces)
//   const expectedRootPaths: Record<string, string[]> = {};
//   for (const w of allWorkspaces) {
//     const wDirO = HashMap.get(repoPkgPathsMap, w);
//     if (O.isNone(wDirO)) continue;
//     const wDir = wDirO.value;
//     const rel = nodePath.relative(repoRoot, wDir).replace(/\\/g, "/");
//     expectedRootPaths[w] = [`./${rel}/src/index`];
//     expectedRootPaths[`${w}/*`] = [`./${rel}/src/*`];
//
//     // Include test/* if the workspace has tsconfig.test.json
//     const wTsConfigsO = HashMap.get(repoTsConfigPathMap, w);
//     if (
//       O.isSome(wTsConfigsO) &&
//       A.some(wTsConfigsO.value, (p) => p.endsWith("tsconfig.test.json"))
//     ) {
//       expectedRootPaths[`${w}/test/*`] = [`./${rel}/test/*`];
//     }
//   }
//
//   // tsconfig.base.json at root
//   const basePathO = A.findFirst(rootTsConfigs, (p) =>
//     p.endsWith("tsconfig.base.json"),
//   );
//   if (O.isNone(basePathO)) {
//     return yield* Effect.fail(new Error("Missing tsconfig.base.json at root"));
//   }
//   const baseContent = yield* fs.readFileString(basePathO.value);
//   const decodedBase = yield* S.decodeUnknown(BasicTsConfigFromString)(
//     baseContent,
//   );
//   if (decodedBase.references && decodedBase.references.length > 0) {
//     return yield* Effect.fail(
//       new Error("tsconfig.base.json must not have references"),
//     );
//   }
//   if (!decodedBase.compilerOptions || !decodedBase.compilerOptions.paths) {
//     return yield* Effect.fail(
//       new Error("tsconfig.base.json must have compilerOptions.paths"),
//     );
//   }
//   const actualBasePaths = decodedBase.compilerOptions.paths;
//   for (const [key, value] of Object.entries(expectedRootPaths)) {
//     // invariant(S.is(WorkspacePkgKeyPrefix)(key))
//
//     if (
//       // @ts-ignore
//       !actualBasePaths[key] ||
//       // @ts-ignore
//       JSON.stringify([...actualBasePaths[key]].sort()) !==
//         JSON.stringify(value.sort())
//     ) {
//       return yield* Effect.fail(
//         new Error(`Mismatch in tsconfig.base.json paths for ${key}`),
//       );
//     }
//   }
//
//   // tsconfig.json at root
//   const rootJsonPathO = A.findFirst(rootTsConfigs, (p) =>
//     p.endsWith("tsconfig.json"),
//   );
//   if (O.isNone(rootJsonPathO)) {
//     return yield* Effect.fail(new Error("Missing tsconfig.json at root"));
//   }
//   const rootJsonContent = yield* fs.readFileString(rootJsonPathO.value);
//   const decodedRootJson = yield* S.decodeUnknown(BasicTsConfigFromString)(
//     rootJsonContent,
//   );
//   if (!decodedRootJson.references) {
//     return yield* Effect.fail(
//       new Error("tsconfig.json at root must have references"),
//     );
//   }
//   const expectedRootJsonRefs = allWorkspaces
//     .map((w) => {
//       const wDirO = HashMap.get(repoPkgPathsMap, w);
//       if (O.isNone(wDirO)) return null;
//       const rel = nodePath.relative(repoRoot, wDirO.value).replace(/\\/g, "/");
//       return { path: rel };
//     })
//     .filter((r) => r !== null)
//     .sort((a, b) => a!.path.localeCompare(b!.path));
//   const actualRootJsonRefs = [...decodedRootJson.references].sort((a, b) =>
//     a.path.localeCompare(b.path),
//   );
//   if (
//     JSON.stringify(expectedRootJsonRefs) !== JSON.stringify(actualRootJsonRefs)
//   ) {
//     return yield* Effect.fail(
//       new Error("Mismatch in tsconfig.json references at root"),
//     );
//   }
//
//   // tsconfig.build.json at root
//   const rootBuildPathO = A.findFirst(rootTsConfigs, (p) =>
//     p.endsWith("tsconfig.build.json"),
//   );
//   if (O.isNone(rootBuildPathO)) {
//     return yield* Effect.fail(new Error("Missing tsconfig.build.json at root"));
//   }
//   const rootBuildContent = yield* fs.readFileString(rootBuildPathO.value);
//   const decodedRootBuild = yield* S.decodeUnknown(BasicTsConfigFromString)(
//     rootBuildContent,
//   );
//   if (!decodedRootBuild.references) {
//     return yield* Effect.fail(
//       new Error("tsconfig.build.json at root must have references"),
//     );
//   }
//   const expectedRootBuildRefs = allWorkspaces
//     .map((w) => {
//       const wDirO = HashMap.get(repoPkgPathsMap, w);
//       if (O.isNone(wDirO)) return null;
//       const rel = nodePath.relative(repoRoot, wDirO.value).replace(/\\/g, "/");
//       const wTsConfigsO = HashMap.get(repoTsConfigPathMap, w);
//       const buildSuffix =
//         O.isSome(wTsConfigsO) &&
//         A.some(wTsConfigsO.value, (p) => p.endsWith("tsconfig.build.json"))
//           ? "tsconfig.build.json"
//           : "tsconfig.json";
//       return { path: `${rel}/${buildSuffix}` };
//     })
//     .filter((r) => r !== null)
//     .sort((a, b) => a!.path.localeCompare(b!.path));
//   const actualRootBuildRefs = [...decodedRootBuild.references].sort((a, b) =>
//     a.path.localeCompare(b.path),
//   );
//   if (
//     JSON.stringify(expectedRootBuildRefs) !==
//     JSON.stringify(actualRootBuildRefs)
//   ) {
//     return yield* Effect.fail(
//       new Error("Mismatch in tsconfig.build.json references at root"),
//     );
//   }
//
//   // Enforce policies for packages in ./packages and ./tooling
//   for (const pkg of allWorkspaces) {
//     const pkgDirO = HashMap.get(repoPkgPathsMap, pkg);
//     if (O.isNone(pkgDirO) || pkgDirO.value.includes("/apps/")) continue; // Skip apps
//     const pkgDir = pkgDirO.value;
//
//     const tsConfigsO = HashMap.get(repoTsConfigPathMap, pkg);
//     if (O.isNone(tsConfigsO)) continue;
//     const tsConfigs = tsConfigsO.value;
//
//     invariant(S.is(WorkspacePkgKeyPrefix)(pkg));
//     const depDataO = HashMap.get(repoDepMap, pkg);
//     if (O.isNone(depDataO)) continue;
//     const depData = depDataO.value;
//     const workspaceDeps = HashSet.union(
//       depData.dependencies.workspace,
//       depData.devDependencies.workspace,
//     );
//     const deps = Array.from(workspaceDeps);
//
//     // Check required tsconfigs exist
//     if (
//       !A.some(tsConfigs, (p) => p.endsWith("tsconfig.json")) ||
//       !A.some(tsConfigs, (p) => p.endsWith("tsconfig.build.json")) ||
//       !A.some(tsConfigs, (p) => p.endsWith("tsconfig.src.json"))
//     ) {
//       return yield* Effect.fail(
//         new Error(`Missing required tsconfig in ${pkg}`),
//       );
//     }
//
//     // Compute expected paths (for deps + self)
//     const depList = [...deps, pkg];
//     const expectedPaths: Record<string, string[]> = {};
//     for (const d of depList) {
//       const dDirO = HashMap.get(repoPkgPathsMap, d);
//       if (O.isNone(dDirO)) continue;
//       const dDir = dDirO.value;
//       const rel = nodePath.relative(pkgDir, dDir).replace(/\\/g, "/") || ".";
//       expectedPaths[d] = [`${rel === "." ? "./" : `${rel}/`}src/index`];
//       expectedPaths[`${d}/*`] = [`${rel === "." ? "./" : `${rel}/`}src/*`];
//
//       // Include test/* if has tsconfig.test.json
//       const dTsConfigsO = HashMap.get(repoTsConfigPathMap, d);
//       if (
//         O.isSome(dTsConfigsO) &&
//         A.some(dTsConfigsO.value, (p) => p.endsWith("tsconfig.test.json"))
//       ) {
//         expectedPaths[`${d}/test/*`] = [
//           `${rel === "." ? "./" : `${rel}/`}test/*`,
//         ];
//       }
//     }
//
//     // Check paths in tsconfigs that require them
//     const pathsRequired = [
//       "tsconfig.json",
//       "tsconfig.src.json",
//       "tsconfig.test.json",
//       "tsconfig.drizzle.json",
//       "tsconfig.tsx.json",
//     ];
//     for (const tcPath of tsConfigs) {
//       const tcName = nodePath.basename(tcPath);
//       if (!pathsRequired.includes(tcName)) continue;
//       const content = yield* fs.readFileString(tcPath);
//       const decoded = yield* S.decodeUnknown(BasicTsConfigFromString)(content);
//       if (!decoded.compilerOptions || !decoded.compilerOptions.paths) {
//         return yield* Effect.fail(
//           new Error(`Missing paths in ${pkg} ${tcName}`),
//         );
//       }
//       const actualPaths = decoded.compilerOptions.paths;
//       for (const [key, value] of Object.entries(expectedPaths)) {
//         invariant(S.is(WorkspacePkgKeyPrefix)(key));
//         if (
//           !actualPaths[key] ||
//           JSON.stringify([...actualPaths[key]].sort()) !==
//             JSON.stringify(value.sort())
//         ) {
//           return yield* Effect.fail(
//             new Error(`Mismatch in ${pkg} ${tcName} paths for ${key}`),
//           );
//         }
//       }
//     }
//
//     // Check references in tsconfig.src.json
//     const srcPathO = A.findFirst(tsConfigs, (p) =>
//       p.endsWith("tsconfig.src.json"),
//     );
//     if (O.isNone(srcPathO)) continue;
//     const decodedSrc = yield* S.decodeUnknown(BasicTsConfigFromString)(
//       yield* fs.readFileString(srcPathO.value),
//     );
//     if (!decodedSrc.references) {
//       return yield* Effect.fail(
//         new Error(`Missing references in ${pkg} tsconfig.src.json`),
//       );
//     }
//     let expectedSrcRefs = deps
//       .map((d) => {
//         const dDirO = HashMap.get(repoPkgPathsMap, d);
//         if (O.isNone(dDirO)) return null;
//         const rel = nodePath.relative(pkgDir, dDirO.value).replace(/\\/g, "/");
//         return { path: rel };
//       })
//       .filter((r) => r !== null);
//     const optionalVariants = [
//       "tsconfig.test.json",
//       "tsconfig.drizzle.json",
//       "tsconfig.tsx.json",
//     ];
//     for (const v of optionalVariants) {
//       if (A.some(tsConfigs, (p) => p.endsWith(v))) {
//         expectedSrcRefs.push({ path: v });
//       }
//     }
//     expectedSrcRefs = expectedSrcRefs.sort((a, b) =>
//       a.path.localeCompare(b.path),
//     );
//     const actualSrcRefs = [...decodedSrc.references].sort((a, b) =>
//       a.path.localeCompare(b.path),
//     );
//     if (JSON.stringify(expectedSrcRefs) !== JSON.stringify(actualSrcRefs)) {
//       return yield* Effect.fail(
//         new Error(`Mismatch in ${pkg} tsconfig.src.json references`),
//       );
//     }
//
//     // Check references in tsconfig.build.json
//     const buildPathO = A.findFirst(tsConfigs, (p) =>
//       p.endsWith("tsconfig.build.json"),
//     );
//     if (O.isNone(buildPathO)) continue;
//     const decodedBuild = yield* S.decodeUnknown(BasicTsConfigFromString)(
//       yield* fs.readFileString(buildPathO.value),
//     );
//     if (!decodedBuild.references) {
//       return yield* Effect.fail(
//         new Error(`Missing references in ${pkg} tsconfig.build.json`),
//       );
//     }
//     const expectedBuildRefs = deps
//       .map((d) => {
//         const dDirO = HashMap.get(repoPkgPathsMap, d);
//         if (O.isNone(dDirO)) return null;
//         const rel = nodePath.relative(pkgDir, dDirO.value).replace(/\\/g, "/");
//         return { path: `${rel}/tsconfig.build.json` };
//       })
//       .filter((r) => r !== null)
//       .sort((a, b) => a!.path.localeCompare(b!.path));
//     const actualBuildRefs = [...decodedBuild.references].sort((a, b) =>
//       a.path.localeCompare(b.path),
//     );
//     if (JSON.stringify(expectedBuildRefs) !== JSON.stringify(actualBuildRefs)) {
//       return yield* Effect.fail(
//         new Error(`Mismatch in ${pkg} tsconfig.build.json references`),
//       );
//     }
//
//     // Check references in tsconfig.json
//     const jsonPathO = A.findFirst(tsConfigs, (p) =>
//       p.endsWith("tsconfig.json"),
//     );
//     if (O.isNone(jsonPathO)) continue;
//     const decodedJson = yield* S.decodeUnknown(BasicTsConfigFromString)(
//       yield* fs.readFileString(jsonPathO.value),
//     );
//     if (!decodedJson.references) {
//       return yield* Effect.fail(
//         new Error(`Missing references in ${pkg} tsconfig.json`),
//       );
//     }
//     let expectedJsonRefs = [{ path: "tsconfig.src.json" }];
//     for (const v of optionalVariants) {
//       if (A.some(tsConfigs, (p) => p.endsWith(v))) {
//         expectedJsonRefs.push({ path: v });
//       }
//     }
//     expectedJsonRefs = expectedJsonRefs.sort((a, b) =>
//       a.path.localeCompare(b.path),
//     );
//     const actualJsonRefs = [...decodedJson.references].sort((a, b) =>
//       a.path.localeCompare(b.path),
//     );
//     if (JSON.stringify(expectedJsonRefs) !== JSON.stringify(actualJsonRefs)) {
//       return yield* Effect.fail(
//         new Error(`Mismatch in ${pkg} tsconfig.json references`),
//       );
//     }
//
//     // Check references in optional tsconfigs (test, drizzle, tsx)
//     for (const v of optionalVariants) {
//       const optPathO = A.findFirst(tsConfigs, (p) => p.endsWith(v));
//       if (O.isNone(optPathO)) continue;
//       const decodedOpt = yield* S.decodeUnknown(BasicTsConfigFromString)(
//         yield* fs.readFileString(optPathO.value),
//       );
//       const expectedOptRefs = deps
//         .map((d) => {
//           const dDirO = HashMap.get(repoPkgPathsMap, d);
//           if (O.isNone(dDirO)) return null;
//           const rel = nodePath
//             .relative(pkgDir, dDirO.value)
//             .replace(/\\/g, "/");
//           return { path: rel };
//         })
//         .filter((r) => r !== null)
//         .sort((a, b) => a!.path.localeCompare(b!.path));
//       const actualOptRefs = [...(decodedOpt.references ?? [])].sort((a, b) =>
//         a.path.localeCompare(b.path),
//       );
//       if (JSON.stringify(expectedOptRefs) !== JSON.stringify(actualOptRefs)) {
//         return yield* Effect.fail(
//           new Error(`Mismatch in ${pkg} ${v} references`),
//         );
//       }
//     }
//   }
//
//   yield* Console.log("\n✅ All tsconfig policies enforced successfully");
// });
//
// const mainProgram = program.pipe(
//   Effect.provide(NodeContext.layer),
//   Effect.catchAll((error) =>
//     Effect.gen(function* () {
//       yield* Effect.log(`Program failed with error: ${String(error)}`);
//       yield* Console.log(`\n💥 Program failed: ${String(error)}`);
//
//       const cause = Cause.fail(error);
//       yield* Effect.log(`Error cause: ${Cause.pretty(cause)}`);
//       yield* Console.log(`\n🔍 Error details: ${Cause.pretty(cause)}`);
//
//       return yield* Effect.fail(error);
//     }),
//   ),
// );
//
// NodeRuntime.runMain(mainProgram);
