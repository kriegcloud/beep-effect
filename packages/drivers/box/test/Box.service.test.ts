import { Buffer } from "node:buffer";
import { Readable } from "node:stream";
import { text as readableText } from "node:stream/consumers";
import * as B from "@beep/box";
import { describe, expect, it, layer } from "@effect/vitest";
import { Cause, ConfigProvider, Effect, Layer as EffectLayer, Exit, Fiber, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

type FakeUploadRequestBody = {
  readonly attributes: {
    readonly name: string;
    readonly parent: {
      readonly id: string;
    };
  };
  readonly file: Readable;
  readonly fileContentType?: string;
  readonly fileFileName?: string;
};

type FakeUsersManager = {
  readonly getUserMe: (
    queryParams: unknown,
    headersInput: unknown,
    cancellationToken: AbortSignal | undefined
  ) => Promise<unknown>;
};

type FakeDownloadsManager = {
  readonly downloadFile: (fileId: string, optionalsInput: unknown) => Promise<unknown>;
  readonly getDownloadFileUrl: (fileId: string, optionalsInput: unknown) => Promise<unknown>;
};

type FakeUploadsManager = {
  readonly uploadFile: (requestBody: FakeUploadRequestBody, optionalsInput: unknown) => Promise<unknown>;
};

type FakeEventsManager = {
  readonly getEventStream: (queryParams: unknown, headersInput: unknown) => unknown;
};

type FakeBoxClient = {
  readonly downloads: FakeDownloadsManager;
  readonly events: FakeEventsManager;
  readonly uploads: FakeUploadsManager;
  readonly users: FakeUsersManager;
};

type FakeBoxClientOverrides = {
  readonly [K in keyof FakeBoxClient]?: Partial<FakeBoxClient[K]>;
};

type PromiseController<A> = {
  readonly promise: Promise<A>;
  readonly reject: (reason?: unknown) => void;
  readonly resolve: (value: A | PromiseLike<A>) => void;
};

class FakeEventStream extends Readable {
  readonly emissions: ReadonlyArray<unknown>;
  wasClosed = false;
  private emitted = false;

  constructor(emissions: ReadonlyArray<unknown>) {
    super({ objectMode: true });
    this.emissions = emissions;
  }

  override _read(): void {
    if (this.emitted) {
      return;
    }

    this.emitted = true;
    for (const emission of this.emissions) {
      this.push(emission);
    }
    this.push(null);
  }

  override _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
    this.wasClosed = true;
    callback(error);
  }
}

const userFull = {
  id: "user-id",
  login: "ada@example.com",
  name: "Ada Lovelace",
  type: "user",
};

const fileFull = {
  id: "file-id",
  name: "document.txt",
  type: "file",
};

const files = {
  entries: [fileFull],
  totalCount: 1,
};

const makeFakeClient = (overrides: FakeBoxClientOverrides = {}): FakeBoxClient => {
  const defaults: FakeBoxClient = {
    downloads: {
      downloadFile: (_fileId, _optionalsInput) => Promise.resolve(Readable.from([Buffer.from("downloaded")])),
      getDownloadFileUrl: (fileId, _optionalsInput) => Promise.resolve(`https://box.example/files/${fileId}/download`),
    },
    events: {
      getEventStream: (_queryParams, _headersInput) =>
        new FakeEventStream([
          {
            eventId: "event-id",
            eventType: "FUTURE_BOX_EVENT",
            type: "event",
          },
        ]),
    },
    uploads: {
      uploadFile: (_requestBody, _optionalsInput) => Promise.resolve(files),
    },
    users: {
      getUserMe: (_queryParams, _headersInput, _cancellationToken) => Promise.resolve(userFull),
    },
  };

  return {
    downloads: { ...defaults.downloads, ...overrides.downloads },
    events: { ...defaults.events, ...overrides.events },
    uploads: { ...defaults.uploads, ...overrides.uploads },
    users: { ...defaults.users, ...overrides.users },
  };
};

const chunksToText = (chunks: Iterable<Uint8Array>): string =>
  Buffer.concat(A.map(A.fromIterable(chunks), (chunk) => Buffer.from(chunk))).toString("utf8");

const byteAbortProbe: {
  aborted: PromiseController<void> | undefined;
  cancellationToken: AbortSignal | undefined;
  entered: PromiseController<void> | undefined;
  pending: PromiseController<unknown> | undefined;
} = {
  aborted: undefined,
  cancellationToken: undefined,
  entered: undefined,
  pending: undefined,
};

describe("@beep/box", () => {
  it.effect(
    "accepts future Box enum values generated as open unions",
    Effect.fnUntraced(function* () {
      const eventType = yield* S.decodeUnknownEffect(B.EventEventTypeField)("FUTURE_BOX_EVENT");

      expect(eventType).toBe("FUTURE_BOX_EVENT");
    })
  );

  it("drops non-finite SDK status codes from sanitized errors", () => {
    const error = B.BoxError.fromUnknown("users.getUserMe", {
      responseInfo: {
        statusCode: Number.NaN,
      },
    });

    expect(error.status).toBeUndefined();
    expect(error.sdkVersion).toBe("10.11.1");
  });

  it.effect(
    "maps developer-token config failures into BoxError",
    Effect.fnUntraced(function* () {
      const exit = yield* Effect.exit(
        Effect.scoped(
          EffectLayer.build(
            B.BoxConfigLayer.pipe(EffectLayer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))))
          ).pipe(Effect.flatMap((context) => B.BoxConfig.pipe(Effect.provide(context))))
        )
      );

      expect(Exit.isFailure(exit)).toBe(true);
      if (Exit.isFailure(exit)) {
        const error = Cause.findErrorOption(exit.cause);
        expect(O.isSome(error)).toBe(true);
        if (O.isSome(error)) {
          expect(error.value).toBeInstanceOf(B.BoxError);
          expect(error.value.reason).toBe("config");
          expect(error.value.sdkVersion).toBe("10.11.1");
        }
      }
    })
  );

  layer(B.Box.makeLayerFromClient(makeFakeClient()))((it) => {
    it.effect(
      "wraps SDK JSON operations in decoded success schemas",
      Effect.fnUntraced(function* () {
        const box = yield* B.Box;
        const response = yield* box.users.getUserMe(B.UsersGetUserMePayload.make({}));

        expect(response).toBeInstanceOf(B.UserFull);
        expect(response.id).toBe("user-id");
      })
    );

    it.effect(
      "keeps generated JSON operations alongside handwritten byte operations",
      Effect.fnUntraced(function* () {
        const box = yield* B.Box;
        const url = yield* box.downloads.getDownloadFileUrl(
          B.DownloadsGetDownloadFileUrlPayload.make({ fileId: "file-id" })
        );

        expect(B.BoxMethodName.is["downloads.downloadFile"]("downloads.downloadFile")).toBe(true);
        expect(B.BoxMethodName.is["downloads.getDownloadFileUrl"]("downloads.getDownloadFileUrl")).toBe(true);
        expect(url).toBe("https://box.example/files/file-id/download");
      })
    );

    it.effect(
      "bridges SDK byte downloads into Effect streams",
      Effect.fnUntraced(function* () {
        const box = yield* B.Box;
        const chunks = yield* box.downloads.downloadFile({ fileId: "file-id" }).pipe(Stream.runCollect);

        expect(chunksToText(chunks)).toBe("downloaded");
      })
    );
  });

  layer(
    B.Box.makeLayerFromClient(
      makeFakeClient({
        downloads: {
          downloadFile: (_fileId, optionalsInput) => {
            byteAbortProbe.cancellationToken = (
              optionalsInput as { readonly cancellationToken?: AbortSignal }
            ).cancellationToken;
            byteAbortProbe.cancellationToken?.addEventListener(
              "abort",
              () => byteAbortProbe.aborted?.resolve(undefined),
              { once: true }
            );
            byteAbortProbe.entered?.resolve(undefined);
            byteAbortProbe.pending = Promise.withResolvers<unknown>();
            return byteAbortProbe.pending.promise;
          },
        },
      })
    )
  )((it) => {
    it.effect(
      "aborts byte download setup when interrupted before the SDK returns",
      Effect.fnUntraced(function* () {
        byteAbortProbe.aborted = Promise.withResolvers<void>();
        byteAbortProbe.cancellationToken = undefined;
        byteAbortProbe.entered = Promise.withResolvers<void>();
        byteAbortProbe.pending = undefined;

        const box = yield* B.Box;
        const fiber = yield* box.downloads.downloadFile({ fileId: "file-id" }).pipe(Stream.runDrain, Effect.forkChild);

        yield* Effect.promise(() => byteAbortProbe.entered?.promise ?? Promise.reject("download did not start"));
        expect(byteAbortProbe.cancellationToken).toBeInstanceOf(AbortSignal);
        yield* Fiber.interrupt(fiber);
        yield* Effect.promise(() => byteAbortProbe.aborted?.promise ?? Promise.reject("download did not abort"));
      })
    );
  });

  layer(
    B.Box.makeLayerFromClient(
      makeFakeClient({
        users: {
          getUserMe: (_queryParams, _headersInput, _cancellationToken) =>
            Promise.reject({
              requestInfo: {
                body: "must-not-leak",
              },
              responseInfo: {
                code: "rate_limit",
                contextInfo: { retry: "later" },
                helpUrl: "https://box.dev/help",
                requestId: "request-id",
                statusCode: 429,
              },
            }),
        },
      })
    )
  )((it) => {
    it.effect(
      "translates SDK throws into sanitized BoxError values",
      Effect.fnUntraced(function* () {
        const box = yield* B.Box;
        const exit = yield* Effect.exit(box.users.getUserMe(B.UsersGetUserMePayload.make({})));

        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.findErrorOption(exit.cause);
          expect(O.isSome(error)).toBe(true);
          if (O.isSome(error)) {
            expect(error.value).toBeInstanceOf(B.BoxError);
            expect(error.value.reason).toBe("response status");
            expect(error.value.method).toBe("users.getUserMe");
            expect(error.value.status).toBe(429);
            expect(error.value.code).toBe("rate_limit");
            expect(error.value.requestId).toBe("request-id");
            expect(error.value.sdkVersion).toBe("10.11.1");
            expect(error.value.cause).toBe("Unknown");
          }
        }
      })
    );
  });

  const uploaded: { content: string | undefined } = { content: undefined };

  layer(
    B.Box.makeLayerFromClient(
      makeFakeClient({
        uploads: {
          uploadFile: (requestBody, _optionalsInput) =>
            readableText(requestBody.file).then((content) => {
              uploaded.content = content;
              return files;
            }),
        },
      })
    )
  )((it) => {
    it.effect(
      "bridges Effect byte streams into SDK upload readables",
      Effect.fnUntraced(function* () {
        const box = yield* B.Box;
        const response = yield* box.uploads.uploadFile({
          requestBody: {
            attributes: {
              name: "document.txt",
              parent: { id: "0" },
            },
            file: Stream.make(new Uint8Array(Buffer.from("uploaded"))),
          },
        });

        expect(response).toBeInstanceOf(B.Files);
        expect(uploaded.content).toBe("uploaded");
      })
    );
  });

  const eventStream = new FakeEventStream([
    {
      eventId: "event-id",
      eventType: "FUTURE_BOX_EVENT",
      type: "event",
    },
  ]);

  layer(B.Box.makeLayerFromClient(makeFakeClient({ events: { getEventStream: () => eventStream } })))((it) => {
    it.effect(
      "streams SDK event objects and closes the SDK readable",
      Effect.fnUntraced(function* () {
        const box = yield* B.Box;
        const events = yield* box.events.getEventStream({}).pipe(Stream.runCollect);
        const values = A.fromIterable(events);

        expect(A.map(values, (event) => event.eventType)).toEqual(["FUTURE_BOX_EVENT"]);
        expect(eventStream.wasClosed).toBe(true);
      })
    );
  });

  const invalidEventStream = new FakeEventStream([{ createdAt: 123 }]);

  layer(B.Box.makeLayerFromClient(makeFakeClient({ events: { getEventStream: () => invalidEventStream } })))((it) => {
    it.effect(
      "fails event streams when SDK event payloads cannot decode",
      Effect.fnUntraced(function* () {
        const box = yield* B.Box;
        const exit = yield* Effect.exit(box.events.getEventStream({}).pipe(Stream.runCollect));

        expect(Exit.isFailure(exit)).toBe(true);
        expect(invalidEventStream.wasClosed).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.findErrorOption(exit.cause);
          expect(O.isSome(error)).toBe(true);
          if (O.isSome(error)) {
            expect(error.value).toBeInstanceOf(B.BoxError);
            expect(error.value.reason).toBe("response decoding");
            expect(error.value.method).toBe("events.getEventStream");
          }
        }
      })
    );
  });
});
