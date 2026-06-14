---
title: Box.streaming.ts
nav_order: 6
parent: "@beep/box"
---

## Box.streaming.ts overview

Hand-written byte and event stream adapters for the Box Node SDK.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeStreamingOperations](#makestreamingoperations)
- [models](#models)
  - [BoxByteInput (type alias)](#boxbyteinput-type-alias)
  - [BoxByteStream (type alias)](#boxbytestream-type-alias)
  - [BoxChunkedUploadReducerPayload (class)](#boxchunkeduploadreducerpayload-class)
  - [BoxCreateUserAvatarPayload (class)](#boxcreateuseravatarpayload-class)
  - [BoxDownloadFilePayload (class)](#boxdownloadfilepayload-class)
  - [BoxDownloadZipPayload (class)](#boxdownloadzippayload-class)
  - [BoxGetEventStreamPayload (class)](#boxgeteventstreampayload-class)
  - [BoxGetFileThumbnailByIdPayload (class)](#boxgetfilethumbnailbyidpayload-class)
  - [BoxGetUserAvatarPayload (class)](#boxgetuseravatarpayload-class)
  - [BoxGetZipDownloadContentPayload (class)](#boxgetzipdownloadcontentpayload-class)
  - [BoxPartAccumulator (class)](#boxpartaccumulator-class)
  - [BoxUploadBigFilePayload (class)](#boxuploadbigfilepayload-class)
  - [BoxUploadFilePartByUrlPayload (class)](#boxuploadfilepartbyurlpayload-class)
  - [BoxUploadFilePartPayload (class)](#boxuploadfilepartpayload-class)
  - [BoxUploadFilePayload (class)](#boxuploadfilepayload-class)
  - [BoxUploadFileVersionPayload (class)](#boxuploadfileversionpayload-class)
  - [BoxUploadWithPreflightCheckPayload (class)](#boxuploadwithpreflightcheckpayload-class)
- [services](#services)
  - [BoxStreamingOperations (type alias)](#boxstreamingoperations-type-alias)
---

# constructors

## makeStreamingOperations

Build hand-written Box byte/event operation groups from a SDK client.

**Example**

```ts
import { makeStreamingOperations } from "@beep/box"

console.log(makeStreamingOperations)
```

**Signature**

```ts
declare const makeStreamingOperations: (client: unknown) => BoxStreamingOperations
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L884)

Since v0.0.0

# models

## BoxByteInput (type alias)

Byte input accepted by Box upload adapters.

**Example**

```ts
import { Stream } from "effect"
import type { BoxByteInput } from "@beep/box"

const bytes: BoxByteInput = Stream.make(new Uint8Array([1, 2, 3]))
console.log(bytes)
```

**Signature**

```ts
type BoxByteInput = typeof BoxByteInputValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L59)

Since v0.0.0

## BoxByteStream (type alias)

Byte stream returned by Box download adapters.

**Example**

```ts
import { Stream } from "effect"
import type { BoxByteStream } from "@beep/box"

const bytes: BoxByteStream = Stream.empty
console.log(bytes)
```

**Signature**

```ts
type BoxByteStream = Stream.Stream<Uint8Array, BoxError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L76)

Since v0.0.0

## BoxChunkedUploadReducerPayload (class)

Payload for `chunkedUploads.reducer`.

**Example**

```ts
import type { BoxChunkedUploadReducerPayload } from "@beep/box"

type Acc = BoxChunkedUploadReducerPayload["acc"]
```

**Signature**

```ts
declare class BoxChunkedUploadReducerPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L393)

Since v0.0.0

## BoxCreateUserAvatarPayload (class)

Payload for `avatars.createUserAvatar`.

**Example**

```ts
import type { BoxCreateUserAvatarPayload } from "@beep/box"

type RequestBody = BoxCreateUserAvatarPayload["requestBody"]
```

**Signature**

```ts
declare class BoxCreateUserAvatarPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L170)

Since v0.0.0

## BoxDownloadFilePayload (class)

Payload for `downloads.downloadFile`.

**Example**

```ts
import type { BoxDownloadFilePayload } from "@beep/box"

const payload: BoxDownloadFilePayload = { fileId: "12345" }
console.log(payload.fileId)
```

**Signature**

```ts
declare class BoxDownloadFilePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L219)

Since v0.0.0

## BoxDownloadZipPayload (class)

Payload for `zipDownloads.downloadZip`.

**Example**

```ts
import type { BoxDownloadZipPayload } from "@beep/box"

type RequestBody = BoxDownloadZipPayload["requestBody"]
```

**Signature**

```ts
declare class BoxDownloadZipPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L493)

Since v0.0.0

## BoxGetEventStreamPayload (class)

Payload for `events.getEventStream`.

**Example**

```ts
import type { BoxGetEventStreamPayload } from "@beep/box"

const payload: BoxGetEventStreamPayload = {}
console.log(payload)
```

**Signature**

```ts
declare class BoxGetEventStreamPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L444)

Since v0.0.0

## BoxGetFileThumbnailByIdPayload (class)

Payload for `files.getFileThumbnailById`.

**Example**

```ts
import type { BoxGetFileThumbnailByIdPayload } from "@beep/box"

const payload: BoxGetFileThumbnailByIdPayload = { extension: "png", fileId: "12345" }
console.log(payload.extension)
```

**Signature**

```ts
declare class BoxGetFileThumbnailByIdPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L243)

Since v0.0.0

## BoxGetUserAvatarPayload (class)

Payload for `avatars.getUserAvatar`.

**Example**

```ts
import type { BoxGetUserAvatarPayload } from "@beep/box"

const payload: BoxGetUserAvatarPayload = { userId: "12345" }
console.log(payload.userId)
```

**Signature**

```ts
declare class BoxGetUserAvatarPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L195)

Since v0.0.0

## BoxGetZipDownloadContentPayload (class)

Payload for `zipDownloads.getZipDownloadContent`.

**Example**

```ts
import type { BoxGetZipDownloadContentPayload } from "@beep/box"

const payload: BoxGetZipDownloadContentPayload = { downloadUrl: "https://example.com/content" }
console.log(payload.downloadUrl)
```

**Signature**

```ts
declare class BoxGetZipDownloadContentPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L468)

Since v0.0.0

## BoxPartAccumulator (class)

Technical accumulator used by the Box chunked-upload reducer helper.

**Example**

```ts
import type { BoxPartAccumulator } from "@beep/box"

type LastIndex = BoxPartAccumulator["lastIndex"]
```

**Signature**

```ts
declare class BoxPartAccumulator
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L91)

Since v0.0.0

## BoxUploadBigFilePayload (class)

Payload for `chunkedUploads.uploadBigFile`.

**Example**

```ts
import type { BoxUploadBigFilePayload } from "@beep/box"

type FileSize = BoxUploadBigFilePayload["fileSize"]
```

**Signature**

```ts
declare class BoxUploadBigFilePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L418)

Since v0.0.0

## BoxUploadFilePartByUrlPayload (class)

Payload for `chunkedUploads.uploadFilePartByUrl`.

**Example**

```ts
import type { BoxUploadFilePartByUrlPayload } from "@beep/box"

type Headers = BoxUploadFilePartByUrlPayload["headersInput"]
```

**Signature**

```ts
declare class BoxUploadFilePartByUrlPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L341)

Since v0.0.0

## BoxUploadFilePartPayload (class)

Payload for `chunkedUploads.uploadFilePart`.

**Example**

```ts
import type { BoxUploadFilePartPayload } from "@beep/box"

type Headers = BoxUploadFilePartPayload["headersInput"]
```

**Signature**

```ts
declare class BoxUploadFilePartPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L368)

Since v0.0.0

## BoxUploadFilePayload (class)

Payload for `uploads.uploadFile`.

**Example**

```ts
import type { BoxUploadFilePayload } from "@beep/box"

type RequestBody = BoxUploadFilePayload["requestBody"]
```

**Signature**

```ts
declare class BoxUploadFilePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L293)

Since v0.0.0

## BoxUploadFileVersionPayload (class)

Payload for `uploads.uploadFileVersion`.

**Example**

```ts
import type { BoxUploadFileVersionPayload } from "@beep/box"

type RequestBody = BoxUploadFileVersionPayload["requestBody"]
```

**Signature**

```ts
declare class BoxUploadFileVersionPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L269)

Since v0.0.0

## BoxUploadWithPreflightCheckPayload (class)

Payload for `uploads.uploadWithPreflightCheck`.

**Example**

```ts
import type { BoxUploadWithPreflightCheckPayload } from "@beep/box"

type RequestBody = BoxUploadWithPreflightCheckPayload["requestBody"]
```

**Signature**

```ts
declare class BoxUploadWithPreflightCheckPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L316)

Since v0.0.0

# services

## BoxStreamingOperations (type alias)

Hand-written streaming operation groups for the Box SDK.

**Example**

```ts
import type { BoxStreamingOperations } from "@beep/box"

type StreamingManagers = keyof BoxStreamingOperations
```

**Signature**

```ts
type BoxStreamingOperations = {
  readonly avatars: {
    readonly createUserAvatar: (payload: BoxCreateUserAvatarPayload) => Effect.Effect<M.UserAvatar, BoxError>;
    readonly getUserAvatar: (payload: BoxGetUserAvatarPayload) => BoxByteStream;
  };
  readonly chunkedUploads: {
    readonly reducer: (payload: BoxChunkedUploadReducerPayload) => Effect.Effect<BoxPartAccumulator, BoxError>;
    readonly uploadBigFile: (payload: BoxUploadBigFilePayload) => Effect.Effect<M.FileFull, BoxError>;
    readonly uploadFilePart: (payload: BoxUploadFilePartPayload) => Effect.Effect<M.UploadedPart, BoxError>;
    readonly uploadFilePartByUrl: (payload: BoxUploadFilePartByUrlPayload) => Effect.Effect<M.UploadedPart, BoxError>;
  };
  readonly downloads: {
    readonly downloadFile: (payload: BoxDownloadFilePayload) => BoxByteStream;
  };
  readonly events: {
    readonly getEventStream: (payload: BoxGetEventStreamPayload) => Stream.Stream<M.Event, BoxError>;
  };
  readonly files: {
    readonly getFileThumbnailById: (payload: BoxGetFileThumbnailByIdPayload) => BoxByteStream;
  };
  readonly uploads: {
    readonly uploadFile: (payload: BoxUploadFilePayload) => Effect.Effect<M.Files, BoxError>;
    readonly uploadFileVersion: (payload: BoxUploadFileVersionPayload) => Effect.Effect<M.Files, BoxError>;
    readonly uploadWithPreflightCheck: (
      payload: BoxUploadWithPreflightCheckPayload
    ) => Effect.Effect<M.Files, BoxError>;
  };
  readonly zipDownloads: {
    readonly downloadZip: (payload: BoxDownloadZipPayload) => BoxByteStream;
    readonly getZipDownloadContent: (payload: BoxGetZipDownloadContentPayload) => BoxByteStream;
  };
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.streaming.ts#L516)

Since v0.0.0