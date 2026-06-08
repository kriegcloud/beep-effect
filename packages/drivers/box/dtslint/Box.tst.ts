import { Stream } from "effect";
import { describe, expect, it } from "tstyche";
import type * as B from "@beep/box";
import type { Effect } from "effect";

describe("@beep/box types", () => {
  it("exposes generated JSON operation typing", () => {
    expect<B.BoxShape["users"]["getUserMe"]>().type.toBeAssignableTo<
      (payload: B.UsersGetUserMePayload) => Effect.Effect<B.UsersGetUserMeSuccess, B.BoxError>
    >();

    expect<B.BoxShape["downloads"]["getDownloadFileUrl"]>().type.toBeAssignableTo<
      (payload: B.DownloadsGetDownloadFileUrlPayload) => Effect.Effect<B.DownloadsGetDownloadFileUrlSuccess, B.BoxError>
    >();
  });

  it("exposes handwritten byte and event operation typing", () => {
    expect<B.BoxShape["downloads"]["downloadFile"]>().type.toBeAssignableTo<
      (payload: B.BoxDownloadFilePayload) => B.BoxByteStream
    >();

    expect<B.BoxShape["uploads"]["uploadFile"]>().type.toBeAssignableTo<
      (payload: B.BoxUploadFilePayload) => Effect.Effect<B.Files, B.BoxError>
    >();

    expect<B.BoxShape["events"]["getEventStream"]>().type.toBeAssignableTo<
      (payload: B.BoxGetEventStreamPayload) => Stream.Stream<B.Event, B.BoxError>
    >();
  });

  it("includes generated and handwritten operation names", () => {
    const generated: B.BoxMethodName = "downloads.getDownloadFileUrl";
    const handwritten: B.BoxMethodName = "downloads.downloadFile";

    expect(generated).type.toBeAssignableTo<B.BoxMethodName>();
    expect(handwritten).type.toBeAssignableTo<B.BoxMethodName>();
  });

  it("accepts Effect byte streams as upload payload input", () => {
    const payload: B.BoxUploadFilePayload = {
      requestBody: {
        attributes: {
          name: "document.txt",
          parent: { id: "0" },
        },
        file: Stream.make(new Uint8Array([1, 2, 3])),
      },
    };

    expect(payload).type.toBe<B.BoxUploadFilePayload>();
  });
});
