import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import {DomainError} from "@beep/tooling-utils/repo";
import {NextgenConvertableExtensionKit} from "./asset-path.schema";
import nodeFs from "node:fs";
import nodePath from "node:path";
import * as S from "effect/Schema";
import * as O from "effect/Option";
import * as Str from "effect/String";
import {BS} from "@beep/schema";
import {FsUtils} from "@beep/tooling-utils/FsUtils";
import * as Match from "effect/Match";

export function collectFiles(dir: string, baseDir: string = dir): string[] {
  const entries = nodeFs.readdirSync(dir, {withFileTypes: true});
  return entries.flatMap((entry) => {
    const fullPath = nodePath.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(fullPath, baseDir);
    }

    return nodePath.join(dir, entry.name);
  });
}

export const collectConvertableFiles = Effect.fn("collectConvertableFiles")(function* (opts: { readonly dir: string }) {
  const fsUtils = yield* FsUtils;
  const dir = yield* fsUtils.existsOrThrow(opts.dir);

  return F.pipe(
    collectFiles(dir),
    A.filter((path) => {
      return F.pipe(
        Str.split(".")(path)[1],
        O.fromNullable,
        O.match({
          onNone: () => false,
          onSome: NextgenConvertableExtensionKit.is
        }));
    }),
    A.map((path) => {
      const ext = O.fromNullable(Str.split(".")(path)[1]).pipe(
        O.getOrThrowWith(() => new DomainError({
          message: `Invalid path: ${path}`
        })),
        S.decodeUnknownSync(NextgenConvertableExtensionKit.Schema),
      );

      return {
        path,
        _tag: ext,
      };
    }),
    S.decodeUnknownSync(ConvertableFiles),
    (convertableFiles) => ({
      modsToLoad: new Set<Pick<typeof ConvertableFile.Type, "modPath" | "_tag">>(A.map(convertableFiles, (e) => Match.value(e).pipe(
        Match.tag("jpg", "jpeg", ({ _tag, modPath }) => ({_tag, modPath})),
        Match.tagsExhaustive({
          png: ({ _tag, modPath }) => ({_tag, modPath}),
          avif: ({ _tag, modPath }) => ({_tag, modPath}),
        })
      ))),
      files: convertableFiles,
    } as const)
  );
});

export const ConvertableFile = BS.destructiveTransform(
  (i: { _tag: string, path: string }) => {
    const taggedSchema = S.Union(
      S.TaggedStruct("png", {path: S.NonEmptyTrimmedString, modPath: BS.toOptionalWithDefault(S.NonEmptyTrimmedString)("./node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm")}),
      S.TaggedStruct("jpg", {path: S.NonEmptyTrimmedString, modPath: BS.toOptionalWithDefault(S.NonEmptyTrimmedString)("./node_modules/@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm")}),
      S.TaggedStruct("jpeg", {path: S.NonEmptyTrimmedString, modPath: BS.toOptionalWithDefault(S.NonEmptyTrimmedString)("./node_modules/@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm")}),
      S.TaggedStruct("avif", {path: S.NonEmptyTrimmedString, modPath: BS.toOptionalWithDefault(S.NonEmptyTrimmedString)("./node_modules/@jsquash/avif/codec/dec/avif_dec.wasm")}),
    );
    return S.decodeUnknownSync(taggedSchema)(i);
  }
)(S.Struct({_tag: S.String, path: S.NonEmptyTrimmedString}));

export const ConvertableFiles = S.NonEmptyArray(ConvertableFile);


const loadWasmMod = Effect.fn("loadWasmMod")(function* (path: string) {
  const fsUtils = yield* FsUtils;

  const wasmDecoderPath = yield* fsUtils.existsOrThrow(path);
  const buffer = yield* Effect.try({
    try: () => nodeFs.readFileSync(wasmDecoderPath),
    catch: (e) => new DomainError({
      message: `Failed to read wasm file ${wasmDecoderPath}`,
      cause: e
    })
  });
  return yield* Effect.tryPromise({
    try: () => WebAssembly.compile(buffer),
    catch: (e) => new DomainError({
      message: `Failed to compile wasm file ${wasmDecoderPath}`,
      cause: e
    })
  });
});

type InitDecoderOptionsShared = {
  decoderModPath: string;
}

type InitDecoderOptions =
  | InitDecoderOptionsShared & { _tag: "jpeg" }
  | InitDecoderOptionsShared & { _tag: "jpg" }
  | InitDecoderOptionsShared & { _tag: "png" }
  | InitDecoderOptionsShared & { _tag: "avif" }

export const initDecoder = Effect.fn("initDecoder")(function* (
  opts: InitDecoderOptions
) {
  const match = Match.type<InitDecoderOptions>().pipe(
    Match.tag("jpeg", "jpg", ({decoderModPath}) => loadWasmMod(decoderModPath)),
    Match.tagsExhaustive({
      png: ({decoderModPath}) => loadWasmMod(decoderModPath),
      avif: ({decoderModPath}) => loadWasmMod(decoderModPath),
    })
  );

  return yield* match(opts);

});

// class WasmCodecService extends Effect.Service<WasmCodecService>()("WasmCodecService", {
//   dependencies: [NodeContext.layer, FsUtilsLive],
//   effect: Effect.gen(function* () {
//     const fsUtils = yield* FsUtils;
//     const webpEncode = yield* fsUtils.existsOrThrow("../../node_modules/@jsquash/webp/codec/enc/webp_enc.wasm");
//     const webpEncodeModBuffer = yield* Effect.try({
//       try: () => nodeFs.readFileSync(webpEncode),
//       catch: (e) => new DomainError({
//         message: `Failed to read wasm file ${webpEncode}`,
//         cause: e
//       })
//     });
//     const webpEncodeMod = yield* Effect.tryPromise({
//       try: () => WebAssembly.compile(webpEncodeModBuffer),
//       catch: (e) => new DomainError({
//         message: `Failed to compile wasm file ${webpEncode}`,
//         cause: e
//       })
//     });
//
//     yield* Effect.tryPromise({
//       try: () => initWebpEncode(webpEncodeMod),
//       catch: (e) => new DomainError({
//         message: `Failed to initialize webp encoder`,
//         cause: e
//       })
//     });
//
//     const encodeWebp = Effect.fn("encodeWebp")(function* (
//       path: string
//     ) {
//       const exists = yield* fsUtils.existsOrThrow(path);
//
//       if (!exists) {
//         return yield* new DomainError({
//           message: `File ${path} does not exist`,
//         });
//       }
//     });
//
//     const decodeImage = Effect.fn("decodeImage")(function* (paths: AssetPaths.Type) {
//       const filesToConvert = A.filter(paths, (path) => A.some(
//         ["jpg", "jpeg", "png", "avif"],
//         (ext) => path.endsWith(ext)
//       ));
//
//     });
//
//     const [
//       jpegDecMod,
//       pngDecMod,
//       avifDecMod,
//     ] = yield* Effect.all([
//       loadWasmMod("../../node_modules/@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm"),
//       loadWasmMod("../../node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm"),
//       loadWasmMod("../../node_modules/@jsquash/avif/codec/dec/avif_dec.wasm"),
//     ]);
//
//
//     yield* Effect.all([]);
//     const jpegWasmBuffer = yield* Effect.try({
//       try: () => nodeFs.readFileSync(jpegWasmPath),
//       catch: (e) => new DomainError({
//         message: `Failed to read wasm file ${jpegWasmPath}`,
//         cause: e
//       })
//     });
//     const jpegWasmMod = yield* Effect.tryPromise({
//       try: () => WebAssembly.compile(jpegWasmBuffer)
//     });
//
//   })
// }) {
// }

