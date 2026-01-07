import { $UiId } from "@beep/identity/packages";
import { arrayBufferToUint8Array } from "@beep/utils/array-buffer-to-uint8-array";
import { BlobWriter, Uint8ArrayReader, ZipWriter } from "@zip.js/zip.js";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

const $I = $UiId.create("services/zip.service");

export class ZipService extends Effect.Service<ZipService>()($I`ZipService`, {
  effect: Effect.gen(function* () {
    const blobWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(blobWriter);
    const zipFiles = Effect.fn("zipFiles")(function* (
      files: ReadonlyArray<{
        readonly name: string;
        readonly data: ArrayBuffer;
      }>
    ) {
      const fileFxs = files.map((f) =>
        Effect.tryPromise({
          try: () => zipWriter.add(f.name, new Uint8ArrayReader(arrayBufferToUint8Array(f.data))),
          catch: (e) =>
            new Error(`couldn't add file to zip ${(e instanceof Error && "message" in e && e?.message) || ""}`),
        })
      );

      const chunks = A.chunksOf(fileFxs, 3).map((fxs) => Effect.all(fxs).pipe(Effect.tap(Effect.sleep("100 millis"))));

      const closeWriter = () =>
        Effect.tryPromise({
          try: () => zipWriter.close(),
          catch: () => new Error("couldn't close zip file"),
        });

      return yield* Effect.all(chunks, { concurrency: 0 }).pipe(Effect.map(A.flatten), Effect.flatMap(closeWriter));
    });

    return {
      zipFiles,
    };
  }),
}) {}
