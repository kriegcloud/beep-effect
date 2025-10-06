import * as Errors from "@beep/files-domain/errors";
import * as Effect from "effect/Effect";

export const readFileArrayBuffer = Effect.fn("readFileArrayBuffer")(function* (file: File) {
  return yield* Effect.tryPromise({
    try: () => file.arrayBuffer(),
    catch: (e) =>
      new Errors.FileReadError({
        message: "Array buffer could not be read",
        cause: e,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        phase: "read",
      }),
  });
});
