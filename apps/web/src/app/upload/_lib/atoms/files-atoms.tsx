// import { $WebId } from "@beep/identity/packages";
// import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
// import type { BS } from "@beep/schema";
// import type { FileFromSelf } from "@beep/schema/integrations/files/File";
// import type { File } from "@beep/shared-domain/entities";
// import { noOp } from "@beep/utils";
// import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
// import * as HttpBody from "@effect/platform/HttpBody";
// import * as HttpClient from "@effect/platform/HttpClient";
// import * as BrowserWorker from "@effect/platform-browser/BrowserWorker";
// import * as RpcClient from "@effect/rpc/RpcClient";
// import { Atom, Registry, Result } from "@effect-atom/atom-react";
// import * as A from "effect/Array";
// import * as Console from "effect/Console";
// import * as Data from "effect/Data";
// import * as DateTime from "effect/DateTime";
// import * as Deferred from "effect/Deferred";
// import * as Effect from "effect/Effect";
// import * as Exit from "effect/Exit";
// import * as F from "effect/Function";
// import * as HashMap from "effect/HashMap";
// import * as Layer from "effect/Layer";
// import * as O from "effect/Option";
// import * as Schedule from "effect/Schedule";
// import * as S from "effect/Schema";
// import * as Stream from "effect/Stream";
// import { ImageCompressionRpc } from "./internal/image-compression-rpc";
//
// const $I = $WebId.create("app/upload/_lib/atoms/files-atoms");
//
// const ImageCompressionProtocol = RpcClient.layerProtocolWorker({
//   size: 2,
//   concurrency: 1,
// }).pipe(
//   Layer.provide(
//     BrowserWorker.layerPlatform(
//       () =>
//         new Worker(new URL("./internal/image-compression-worker.ts?worker", import.meta.url), {
//           type: "module",
//         })
//     )
//   ),
//   Layer.orDie
// );
//
// export class ImageCompressionClient extends Effect.Service<ImageCompressionClient>()($I`ImageCompressionClient`, {
//   dependencies: [ImageCompressionProtocol],
//   scoped: Effect.gen(function* () {
//     return { client: yield* RpcClient.make(ImageCompressionRpc) };
//   }),
// }) {}
//
// export class ImageTooLargeAfterCompression extends Data.TaggedError("ImageTooLargeAfterCompression")<{
//   readonly fileName: string;
//   readonly originalSizeBytes: number;
//   readonly compressedSizeBytes: number;
// }> {}
//
// export type UploadPhase = Data.TaggedEnum<{
//   readonly Compressing: {};
//   readonly Uploading: {};
//   readonly Syncing: {};
//   readonly Done: {};
// }>;
//
// const UploadPhase = Data.taggedEnum<UploadPhase>();
//
// export type ActiveUpload = {
//   readonly id: string;
//   readonly fileName: string;
//   readonly fileSize: number;
//   readonly mimeType: BS.MimeType.Type;
// };
//
// type UploadInput = {
//   readonly file: typeof FileFromSelf.Type;
// };
//
// type UploadState = Data.TaggedEnum<{
//   readonly Idle: { readonly input: UploadInput };
//   readonly Compressing: { readonly input: UploadInput };
//   readonly Uploading: { readonly input: UploadInput; readonly fileToUpload: typeof FileFromSelf.Type };
//   readonly Syncing: { readonly input: UploadInput; readonly fileKey: File.UploadKey.Type };
//   readonly Done: {};
// }>;
//
// const UploadState = Data.taggedEnum<UploadState>();
//
// const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
//
// export const activeUploadsAtom = Atom.make<ReadonlyArray<ActiveUpload>>(A.empty());
//
// export class FileSync extends Effect.Service<FileSync>()($I`FileSync`, {
//   dependencies: [],
//   scoped: Effect.gen(function* () {
//     const registry = yield* Registry.AtomRegistry;
//
//     const completionSignals = new Map<
//       File.UploadKey.Type,
//       {
//         readonly uploadId: string;
//         readonly deferred: Deferred.Deferred<void>;
//         readonly addedAt: DateTime.Utc;
//       }
//     >();
//
//     const signalFileArrived = (key: File.UploadKey.Type) =>
//       F.pipe(
//         O.fromNullable(completionSignals.get(key)),
//         O.match({
//           onNone: noOp,
//           onSome: (entry) => {
//             Deferred.unsafeDone(entry.deferred, Exit.void);
//             completionSignals.delete(key);
//           },
//         })
//       );
//
//     const waitForFile = Effect.fn("waitForFile")(function* (key: File.UploadKey.Type, uploadId: string) {
//       const deferred = yield* Deferred.make<void>();
//       completionSignals.set(key, {
//         uploadId,
//         deferred,
//         addedAt: yield* DateTime.now,
//       });
//       yield* Deferred.await(deferred);
//       registry.set(
//         activeUploadsAtom,
//         A.filter(registry.get(activeUploadsAtom), (u) => u.id !== uploadId)
//       );
//     });
//
//     yield* Effect.forkScoped(
//       Effect.gen(function* () {
//         if (completionSignals.size === 0) return;
//         const now = yield* DateTime.now;
//         const fiveSecondsAgo = DateTime.subtract(now, { seconds: 5 });
//
//         const fileKeys = F.pipe(
//           Array.from(completionSignals.entries()),
//           A.filter(([_, entry]) => DateTime.lessThan(entry.addedAt, fiveSecondsAgo)),
//           A.map(([key]) => key)
//         );
//
//         if (A.isEmptyArray(fileKeys)) return;
//
//         // const files =
//         yield* Console.log("beep");
//       }).pipe(Effect.repeat({ schedule: Schedule.spaced("5 seconds") }))
//     );
//
//     return {
//       completionSignals,
//       signalFileArrived,
//       waitForFile,
//     };
//   }),
// }) {}
//
// export class FilePicker extends Effect.Service<FilePicker>()($I`FilePicker`, {
//   dependencies: [],
//   scoped: Effect.gen(function* () {
//     const fileRef = yield* Effect.acquireRelease(
//       Effect.sync(() => {
//         const input = document.createElement("input");
//         input.type = "file";
//         input.accept = "image/*";
//         input.style.display = "none";
//         document.body.appendChild(input);
//         return input;
//       }),
//       (input) =>
//         Effect.sync(() => {
//           input.remove();
//         })
//     );
//     return {
//       open: Effect.async<O.Option<File>>((resume) => {
//         const changeHandler = (e: Event) => {
//           const selectedFile = (e.target as HTMLInputElement).files?.[0];
//           resume(Effect.succeed(O.fromNullable(selectedFile)));
//           fileRef.value = "";
//         };
//
//         const cancelHandler = () => {
//           resume(Effect.succeed(O.none()));
//         };
//
//         fileRef.addEventListener("change", changeHandler, { once: true });
//         fileRef.addEventListener("cancel", cancelHandler, { once: true });
//         fileRef.click();
//
//         return Effect.sync(() => {
//           fileRef.removeEventListener("change", changeHandler);
//           fileRef.removeEventListener("cancel", cancelHandler);
//         });
//       }),
//     };
//   }),
// }) {}
//
// export const runtime = makeAtomRuntime(
//   Layer.mergeAll(FetchHttpClient.layer, FilePicker.Default, FileSync.Default, ImageCompressionClient.Default)
// );
