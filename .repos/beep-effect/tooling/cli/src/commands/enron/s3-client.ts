import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

export const ENRON_TEST_DATA_S3_PREFIX_URI = "s3://static.vaultctx.com/todox/test-data";
export const ENRON_CURATED_S3_PREFIX_URI = `${ENRON_TEST_DATA_S3_PREFIX_URI}/enron/curated`;

export const ENRON_CURATED_THREADS_URI = `${ENRON_CURATED_S3_PREFIX_URI}/threads.json`;
export const ENRON_CURATED_DOCUMENTS_URI = `${ENRON_CURATED_S3_PREFIX_URI}/documents.json`;
export const ENRON_CURATED_MANIFEST_URI = `${ENRON_CURATED_S3_PREFIX_URI}/manifest.json`;

const S3_URI_PATTERN = /^s3:\/\/([^/]+)\/(.+)$/;

export class EnronS3UriError extends S.TaggedError<EnronS3UriError>()("EnronS3UriError", {
  uri: S.String,
  message: S.String,
}) {}

export class EnronS3ObjectNotFoundError extends S.TaggedError<EnronS3ObjectNotFoundError>()(
  "EnronS3ObjectNotFoundError",
  {
    uri: S.String,
    message: S.String,
  }
) {}

export class EnronS3TransportError extends S.TaggedError<EnronS3TransportError>()("EnronS3TransportError", {
  uri: S.String,
  message: S.String,
  status: S.optional(S.Number),
  cause: S.optional(S.String),
}) {}

export type EnronS3DataSourceError = EnronS3UriError | EnronS3ObjectNotFoundError | EnronS3TransportError;

interface ParsedS3Uri {
  readonly bucket: string;
  readonly key: string;
}

export interface S3DataSource {
  readonly downloadText: (uri: string) => Effect.Effect<string, EnronS3DataSourceError>;
}

export const S3DataSource = Context.GenericTag<S3DataSource>("@beep/repo-cli/enron/S3DataSource");

const parseS3Uri = (uri: string): Effect.Effect<ParsedS3Uri, EnronS3UriError> =>
  Effect.try({
    try: () => {
      const match = uri.match(S3_URI_PATTERN);
      if (match === null) {
        throw new Error("Invalid S3 URI format. Expected s3://<bucket>/<key>");
      }

      const bucket = match[1] ?? "";
      const key = match[2] ?? "";

      if (bucket !== "static.vaultctx.com") {
        throw new Error(`Unsupported S3 bucket: ${bucket}. Expected static.vaultctx.com`);
      }

      if (!key.startsWith("todox/test-data/")) {
        throw new Error("Unsupported key prefix. Only todox/test-data/* is allowed");
      }

      return { bucket, key };
    },
    catch: (cause) =>
      new EnronS3UriError({
        uri,
        message: cause instanceof Error ? cause.message : String(cause),
      }),
  });

const toHttpsUrl = (uri: string): Effect.Effect<string, EnronS3UriError> =>
  parseS3Uri(uri).pipe(Effect.map(({ bucket, key }) => `https://${bucket}/${key}`));

const downloadText = (uri: string): Effect.Effect<string, EnronS3DataSourceError> =>
  Effect.gen(function* () {
    const url = yield* toHttpsUrl(uri);

    const response = yield* Effect.tryPromise({
      try: () => fetch(url),
      catch: (cause) =>
        new EnronS3TransportError({
          uri,
          message: "Failed to fetch S3 object",
          cause: cause instanceof Error ? cause.message : String(cause),
        }),
    });

    if (response.status === 404) {
      return yield* Effect.fail(
        new EnronS3ObjectNotFoundError({
          uri,
          message: `S3 object not found: ${uri}`,
        })
      );
    }

    if (!response.ok) {
      return yield* Effect.fail(
        new EnronS3TransportError({
          uri,
          message: `Unexpected response status while fetching S3 object: ${response.status}`,
          status: response.status,
        })
      );
    }

    return yield* Effect.tryPromise({
      try: () => response.text(),
      catch: (cause) =>
        new EnronS3TransportError({
          uri,
          message: "Failed to read S3 object response body",
          cause: cause instanceof Error ? cause.message : String(cause),
        }),
    });
  });

const s3DataSource: S3DataSource = {
  downloadText,
};

export const S3DataSourceLive: Layer.Layer<S3DataSource> = Layer.succeed(S3DataSource, s3DataSource);
