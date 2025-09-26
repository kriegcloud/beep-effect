import {DomainError, getWorkspaceDir} from "@beep/tooling-utils/repo";
import {collectConvertableFiles} from "@beep/repo-scripts/utils/convert-to-nextgen";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as Effect from "effect/Effect";
import * as Path from "@effect/platform/Path";
import * as Console from "effect/Console";
import * as F from "effect/Function";
import * as FileSystem from "@effect/platform/FileSystem";
import * as A from "effect/Array";
import {FsUtils, FsUtilsLive} from "@beep/tooling-utils/FsUtils";
import * as Match from "effect/Match";
import nodeFs from "node:fs";
import * as Str from "effect/String";
import decodeJpeg, {init as initJpegDecode} from "@jsquash/jpeg/decode";
import decodePng, {init as initPngDecode} from "@jsquash/png/decode";
import decodeAvif, {init as initAvifDecode} from "@jsquash/avif/decode";
import encodeWebp, {init as initWebpEncode} from "@jsquash/webp/encode";
import {removeExt} from "@beep/constants/paths/utils";

// Normalises Node buffers and typed-array views so jsquash decoders receive true ArrayBuffers.
const toArrayBuffer = (input: ArrayBuffer | ArrayBufferView): ArrayBuffer => {
  if (input instanceof ArrayBuffer) {
    return input;
  }

  if (ArrayBuffer.isView(input)) {
    const {buffer, byteOffset, byteLength} = input;

    if (buffer instanceof ArrayBuffer) {
      return buffer.slice(byteOffset, byteOffset + byteLength);
    }

    const copy = new Uint8Array(byteLength);
    copy.set(new Uint8Array(buffer, byteOffset, byteLength));
    return copy.buffer;
  }

  throw new TypeError("Expected ArrayBuffer or ArrayBufferView");
};
const program = Effect.gen(function* () {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const fsUtils = yield* FsUtils;
  const webDir = yield* getWorkspaceDir("@beep/web");
  yield* Console.log("WEB_DIR: ", webDir);
  const publicDir = yield* fsUtils.existsOrThrow(path.resolve(webDir, "public"));
  yield* Console.log("PUBLIC_DIR: ", publicDir);

  const {files, modsToLoad} = yield* collectConvertableFiles({
    dir: publicDir
  });

  const webpWasmBufferPath = yield* fsUtils.existsOrThrow("./node_modules/@jsquash/webp/codec/enc/webp_enc.wasm");
  const webpBuffer = yield* Effect.try({
    try: () => nodeFs.readFileSync(webpWasmBufferPath),
    catch: (e) => new DomainError({
      message: `Failed to read wasm file ${webpWasmBufferPath}`,
      cause: e
    })
  });
  const webpMod = yield* Effect.tryPromise({
    try: () => WebAssembly.compile(webpBuffer),
    catch: (e) => new DomainError({
      message: `Failed to compile wasm file ${webpWasmBufferPath}`,
      cause: e
    })
  });
  yield* Effect.tryPromise({
    try: () => initWebpEncode(webpMod),
    catch: (e) => new DomainError({
      message: `Failed to initialize webp encoder`,
      cause: e
    })
  });

  const wasmMods = yield* F.pipe(
    A.map(A.fromIterable(modsToLoad.values()), (modPathObj) => Effect.flatMap(
      Effect.try({
        try: () => Match.value(modPathObj).pipe(
          Match.tagsExhaustive({
            jpg: ({_tag, modPath}) => ({
              _tag,
              modBuffer: nodeFs.readFileSync(modPath)
            }),
            jpeg: ({_tag, modPath}) => ({
              _tag,
              modBuffer: nodeFs.readFileSync(modPath)
            }),
            png: ({_tag, modPath}) => ({
              _tag,
              modBuffer: nodeFs.readFileSync(modPath)
            } as const),
            avif: ({_tag, modPath}) => ({
              _tag,
              modBuffer: nodeFs.readFileSync(modPath)
            } as const),
          })
        ),
        catch: (e) => new DomainError({cause: e, message: `Failed to read module ${modPathObj.modPath}`})
      }),
      (bufferModObj) => Effect.tryPromise({
        try: () => Match.value(bufferModObj).pipe(
          Match.tagsExhaustive({
            jpg: async ({_tag, modBuffer}) => {
              const mod = await WebAssembly.compile(modBuffer);
              return {
                _tag,
                mod,
              } as const;
            },
            jpeg: async ({_tag, modBuffer}) => {
              const mod = await WebAssembly.compile(modBuffer);
              return {
                _tag,
                mod,
              } as const;
            },
            png: async ({_tag, modBuffer}) => {
              const mod = await WebAssembly.compile(modBuffer);
              return {
                _tag,
                mod,
              } as const;
            },
            avif: async ({_tag, modBuffer}) => {
              const mod = await WebAssembly.compile(modBuffer);
              return {
                _tag,
                mod,
              } as const;
            }
          })
        ),
        catch: (e) => new DomainError({cause: e, message: `Failed to compile module ${modPathObj.modPath}`})
      })
    )),
    Effect.all,
  );

  yield* F.pipe(
    A.map(wasmMods, (wasmModObj) => Match.value(wasmModObj).pipe(
      Match.tagsExhaustive({
        jpg: ({_tag, mod}) => Effect.tryPromise({
          try: () => initJpegDecode(mod),
          catch: (e) => new DomainError({cause: e, message: `Failed to initialize JPEG decoder for module ${mod}`})
        }),
        jpeg: ({_tag, mod}) => Effect.tryPromise({
          try: () => initJpegDecode(mod),
          catch: (e) => new DomainError({cause: e, message: `Failed to initialize JPEG decoder for module ${mod}`})
        }),
        avif: ({_tag, mod}) => Effect.tryPromise({
          try: () => initAvifDecode(mod),
          catch: (e) => new DomainError({cause: e, message: `Failed to initialize AVIF decoder for module ${mod}`})
        }),
        png: ({_tag, mod}) => Effect.tryPromise({
          try: () => initPngDecode(mod),
          catch: (e) => new DomainError({cause: e, message: `Failed to initialize PNG decoder for module ${mod}`})
        })
      })
    )),
    Effect.all,
  );

  const bufferedFiles = F.pipe(
    files,
    A.map((fileObj) => {
      return Match.value(fileObj).pipe(
        Match.tagsExhaustive({
          jpg: (m) => ({_tag: m._tag, buffer: toArrayBuffer(nodeFs.readFileSync(m.path)), path: m.path} as const),
          jpeg: (m) => ({_tag: m._tag, buffer: toArrayBuffer(nodeFs.readFileSync(m.path)), path: m.path} as const),
          png: (m) => ({_tag: m._tag, buffer: toArrayBuffer(nodeFs.readFileSync(m.path)), path: m.path} as const),
          avif: (m) => ({_tag: m._tag, buffer: toArrayBuffer(nodeFs.readFileSync(m.path)), path: m.path} as const),
        })
      );
    })
  );

  const decodedFiles = yield* F.pipe(
    bufferedFiles,
    A.map((bufferedFileObj) => Match.value(bufferedFileObj).pipe(
      Match.tagsExhaustive({
        jpg: (m) => Effect.tryPromise({
          try: async () => {
            const decoded = await decodeJpeg(m.buffer);
            return {
              _tag: m._tag,
              decoded,
              path: m.path,
            };
          },
          catch: (e) => new DomainError({cause: e, message: `Failed to decode JPEG file buffer ${m.path}`})
        }),
        jpeg: (m) => Effect.tryPromise({
          try: async () => {
            const decoded = await decodeJpeg(m.buffer);
            return {
              _tag: m._tag,
              decoded,
              path: m.path,
            };
          },
          catch: (e) => new DomainError({cause: e, message: `Failed to decode JPEG file buffer ${m.path}`})
        }),
        png: (m) => Effect.tryPromise({
          try: async () => {
            const decoded = await decodePng(m.buffer);
            return {
              _tag: m._tag,
              decoded,
              path: m.path,
            };
          },
          catch: (e) => new DomainError({cause: e, message: `Failed to decode PNG file buffer ${m.path}`})
        }),
        avif: (m) => Effect.tryPromise({
          try: async () => {
            const decoded = await decodeAvif(m.buffer);
            return {
              _tag: m._tag,
              decoded,
              path: m.path,
            };
          },
          catch: (e) => new DomainError({cause: e, message: `Failed to decode AVIF file buffer ${m.path}`})
        })
      })
    )),
    Effect.all,
  );

  const newPath = (fileObj: { path: string }) => Str.replace("/public/", "/public-tmp/")(fileObj.path);

  const encodedFiles = yield* F.pipe(
    decodedFiles,
    A.map((decodedFileObj) => Match.value(decodedFileObj).pipe(
      Match.tagsExhaustive({
        jpg: ({decoded, ...m}) => Effect.tryPromise({
          try: async () => {
            const encoded = new Uint8Array(await encodeWebp(decoded));
            return {
              ...m,
              encoded,
              newPath: `${removeExt(`${newPath(m)}`)}.webp`
            } as const;
          },
          catch: (e) => new DomainError({cause: e, message: `Failed to encode JPEG file buffer ${m.path}`})
        }),
        jpeg: ({decoded, ...m}) => Effect.tryPromise({
          try: async () => {
            const encoded = new Uint8Array(await encodeWebp(decoded));
            return {
              ...m,
              encoded,
              newPath: `${removeExt(`${newPath(m)}`)}.webp`
            } as const;
          },
          catch: (e) => new DomainError({cause: e, message: `Failed to encode JPEG file buffer ${m.path}`})
        }),
        png: ({decoded, ...m}) => Effect.tryPromise({
          try: async () => {
            const encoded = new Uint8Array(await encodeWebp(decoded, {}));
            return {
              ...m,
              encoded,
              newPath: `${removeExt(`${newPath(m)}`)}.webp`
            } as const;
          },
          catch: (e) => new DomainError({cause: e, message: `Failed to encode PNG file buffer ${m.path}`})
        }),
        avif: ({decoded, ...m}) => Effect.tryPromise({
          try: async () => {
            if (!decoded) {
              throw new DomainError({message: `Failed to encode AVIF file buffer ${m.path}`});
            }
            const encoded = new Uint8Array(await encodeWebp(decoded));
            return {
              ...m,
              encoded,
              newPath: `${removeExt(`${newPath(m)}`)}.webp`
            } as const;
          },
          catch: (e) => new DomainError({cause: e, message: `Failed to encode AVIF file buffer ${m.path}`})
        })
      })
    )),
    Effect.all,
  );


  yield* Console.log(JSON.stringify(A.map(encodedFiles, (f) => [f.path, f.newPath] as const), null, 2));


  yield* F.pipe(
    encodedFiles,
    A.map(({newPath, encoded}) =>
      Effect.flatMap(
        fs.makeDirectory(path.dirname(newPath), {recursive: true}),
        () => fs.writeFile(newPath, encoded)
      )
    ),
    Effect.all,
  );
  // yield* Console.log(JSON.stringify(p, null, 2));
});

NodeRuntime.runMain(program.pipe(
  Effect.provide([
    FsUtilsLive,
    NodeContext.layer,
  ])
));
