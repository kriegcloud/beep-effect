// import {Effect, flow, pipe, identity, Layer, Cause, Context} from "effect";
// import * as S from "effect/Schema";
// import {$ScratchId} from "@beep/identity";
// import {LiteralKit, TaggedErrorClass, FilePath} from "@beep/schema";
// import {P, Struct, A, O} from "@beep/utils";
// import {dual} from "effect/Function";
// import {FFmpeg as FfmpegWasm} from "@ffmpeg/ffmpeg"
// import coreURL from "@ffmpeg/core?url"
// import wasmURL from "@ffmpeg/core/wasm?url"
//
// const GPU_PERMITS = 6;
// const CPU_PERMITS = 12;
// // Support for multi threaded ffmpeg needs https://github.com/ffmpegwasm/ffmpeg.wasm/pull/760
// // import mtCoreURL from "@ffmpeg/core-mt?url"
// // import mtWasmURL from "@ffmpeg/core-mt/wasm?url"
// // import mtWorkerURL from "@ffmpeg/core-mt/worker?url"
// const $I = $ScratchId.create("index");
//
// export class FFmpegError extends TaggedErrorClass<FFmpegError>($I`FFmpegError`)("FFmpegError",
//   {
//     cause: S.DefectWithStack,
//     message: S.String,
//   },
// ) {
//   static readonly new: {
//     (cause: unknown, message: string): FFmpegError,
//     (message: string): (cause: unknown) => FFmpegError
//   } = dual(
//     2,
//     (cause: unknown, message: string): FFmpegError => new FFmpegError({
//       message,
//       cause,
//     }),
//   );
// }
//
// /**
//  * Ffmpeg Service
//  *
//  * See https://effect.website/docs/guides/context-management/services
//  */
// export class FFmpegCommandsService extends Context.Service<FFmpegCommandsService, {
//   exec: (args: Array<string>) => Effect.Effect<void, FFmpegError>
//   deleteFile: (path: FilePath) => Effect.Effect<void, FFmpegError>
//   readFile: (path: FilePath) => Effect.Effect<Uint8Array, FFmpegError>
//   writeFile: {
//     (path: FilePath, data: Uint8Array): Effect.Effect<void, FFmpegError>
//     (_data: Uint8Array): (path: FilePath) => Effect.Effect<void, FFmpegError>
//   }
// }>()($I`FFmpegCommandsService`) {
//   static readonly layer = Layer.effect(
//     FFmpegCommandsService,
//     Effect.gen(function* () {
//       const ffmpegWasm = yield* ffmpegWasmResource
//       // for debug purpose, to remove or expose
//       ffmpegWasm.on("log", ({
//         type,
//         message,
//       }) => console.debug(`[${type}]${message}`))
//       const exec = Effect.fn("FFmpegCommandsService.exec")(
//         function* (args: Array<string>) {
//           return yield* ffmpegTryPromise(
//             // no timeout support here, should use effect timeout capabilities if wanted
//             signal => ffmpegWasm.exec(args, -1, {signal}))
//         });
//
//       const deleteFile = Effect.fn("FFmpegCommandsService.deleteFile")(
//         function* (path: FilePath) {
//           return yield* ffmpegTryPromise(signal => ffmpegWasm.deleteFile(
//             path,
//             {signal},
//           ))
//         });
//
//       const readFile = Effect.fn("FFmpegCommandsService.readFile")(
//         function* (path: FilePath) {
//           return yield* ffmpegTryPromise(signal => ffmpegWasm.readFile(
//             path,
//             "binary",
//             {signal},
//           ) as Promise<Uint8Array>)
//         });
//
//       const writeFile: {
//         (path: FilePath, data: Uint8Array): Effect.Effect<void, FFmpegError>
//         (_data: Uint8Array): (path: FilePath) => Effect.Effect<void, FFmpegError>
//       } = dual(
//         2,
//         Effect.fn("FFmpegCommandsService.writeFile")(
//           function* (path: FilePath, data: Uint8Array) {
//             return yield* ffmpegTryPromise(signal => ffmpegWasm.writeFile(
//               path,
//               data,
//               {signal},
//             ))
//           }),
//       );
//
//       return {
//         exec,
//         readFile,
//         writeFile,
//         deleteFile,
//       }
//     }),
//   )
// }
//
// /**
//  * A utility function to create effect from promises with a FfmpegError in the exception channel
//  */
// const ffmpegTryPromise = Effect.fn("ffmpegTryPromise")(
//   function* <A>(try_: (signal: AbortSignal) => PromiseLike<A>) {
//     return yield* Effect.tryPromise({
//       try: try_,
//       catch: FFmpegError.new("Failed to execute ffmpeg"),
//     })
//   },
//   Effect.tapCause(flow(Cause.pretty, Effect.logError)),
// )
//
// /**
//  * Ffmpeg Resource
//  * Logic to acquire (initialize and load) and release (terminate) a ffmpeg wasm instance
//  */
// const ffmpegWasmResource = Effect.acquireRelease(Effect.gen(function* () {
//   yield* Effect.logDebug("load ffmpeg");
//   const ffmpeg = new FfmpegWasm()
//
//   yield* ffmpegTryPromise((signal) => ffmpeg.load({
//     coreURL,
//     wasmURL,
//   }, {signal}))
//   return ffmpeg
// }), Effect.fnUntraced(function* (ffmpeg: FfmpegWasm) {
//   yield* Effect.logDebug("terminate ffmpeg")
//   yield* Effect.sync(() => ffmpeg.terminate())
// }))
