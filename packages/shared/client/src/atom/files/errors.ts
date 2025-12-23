import { $SharedClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedClientId.create("atom/files/errors");

export class ImageTooLargeAfterCompression extends S.TaggedError<ImageTooLargeAfterCompression>(
  $I`ImageTooLargeAfterCompression`
)(
  "ImageTooLargeAfterCompression",
  {
    fileName: S.String,
    originalSizeBytes: S.Number,
    compressedSizeBytes: S.Number,
  },
  $I.annotations("ImageTooLargeAfterCompression", {
    description: "Image too large after compression",
  })
) {}
