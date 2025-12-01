import SQIds, { defaultOptions } from "@beep/utils/sqids";
import { pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Encoding from "effect/Encoding";
import * as Hash from "effect/Hash";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";
import { UploadError } from "./error";

const signaturePrefix = "hmac-sha256=";
const algorithm = { name: "HMAC", hash: "SHA-256" };
const encoder = new TextEncoder();
export interface FileProperties {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly lastModified?: number | undefined;
}
function shuffle(str: string, seed: string) {
  const chars = Str.split("")(str);
  const seedNum = Hash.string(seed);

  let temp: string;
  let j: number;
  for (let i = 0; i < chars.length; i++) {
    j = ((seedNum % (i + 1)) + i) % chars.length;
    temp = chars[i]!;
    chars[i] = chars[j]!;
    chars[j] = temp;
  }

  return pipe(chars, A.join(""));
}

export const signPayload = Effect.fn("signPayload")(function* (payload: string, secret: Redacted.Redacted<string>) {
  const signingKey = yield* Effect.tryPromise({
    try: () => crypto.subtle.importKey("raw", encoder.encode(Redacted.value(secret)), algorithm, false, ["sign"]),
    catch: (e) =>
      new UploadError({
        code: "BAD_REQUEST",
        message: "Invalid Signing Secret",
        cause: e,
      }),
  });

  const signature = yield* Effect.map(
    Effect.tryPromise({
      try: () => crypto.subtle.sign(algorithm, signingKey, encoder.encode(payload)),
      catch: (e) => new UploadError({ code: "BAD_REQUEST", cause: e }),
    }),
    (arrayBuffer) => Encoding.encodeHex(new Uint8Array(arrayBuffer))
  );

  return `${signaturePrefix}${signature}`;
});

export const verifySignature = Effect.fn("verifySignature")(
  function* (payload: string, signature: string | null, secret: Redacted.Redacted<string>) {
    const sigOpt = pipe(signature, O.fromNullable, O.map(Str.slice(signaturePrefix.length)));

    if (O.isNone(sigOpt)) return false;

    const sig = sigOpt.value;
    const secretBytes = encoder.encode(Redacted.value(secret));
    const signingKey = yield* Effect.promise(() =>
      crypto.subtle.importKey("raw", secretBytes, algorithm, false, ["verify"])
    );

    const sigBytes = yield* Encoding.decodeHex(sig);
    const payloadBytes = encoder.encode(payload);
    return yield* Effect.promise(() =>
      crypto.subtle.verify(algorithm, signingKey, new Uint8Array(sigBytes), payloadBytes)
    );
  },
  Effect.orElseSucceed(() => false)
);
export type ExtractHashPartsFn = (file: FileProperties) => (string | number | undefined | null | boolean)[];
export const generateKey = (file: FileProperties, appId: string, getHashParts?: undefined | ExtractHashPartsFn) =>
  Effect.sync(() => {
    // Get the parts of which we should hash to constuct the key
    // This allows the user to customize the hashing algorithm
    // If they for example want to generate the same key for the
    // same file whenever it was uploaded
    const hashParts = JSON.stringify(
      getHashParts?.(file) ?? [file.name, file.size, file.type, file.lastModified, Date.now()]
    );

    // Hash and Encode the parts and appId as sqids
    const alphabet = shuffle(defaultOptions.alphabet, appId);
    const encodedFileSeed = new SQIds({ alphabet, minLength: 36 }).encode([Math.abs(Hash.string(hashParts))]);
    const encodedAppId = new SQIds({ alphabet, minLength: 12 }).encode([Math.abs(Hash.string(appId))]);

    // Concatenate them
    return encodedAppId + encodedFileSeed;
  });

export const verifyKey = Effect.fn("verifyKey")(
  function* (key: string, appId: string) {
    return yield* Effect.sync(() => {
      const alphabet = shuffle(defaultOptions.alphabet, appId);
      const expectedPrefix = new SQIds({ alphabet, minLength: 12 }).encode([Math.abs(Hash.string(appId))]);

      return Str.startsWith(expectedPrefix)(key);
    });
  },
  Effect.orElseSucceed(() => false)
);

export const generateSignedURL = Effect.fn("generateSignedURL")(function* (
  url: string | URL,
  secretKey: Redacted.Redacted<string>,
  opts: {
    readonly ttlInSeconds?: Duration.Duration | undefined;
    readonly data?: undefined | Record<string, string | number | boolean | null | undefined>;
  }
) {
  const parsedURL = new URL(url);
  const ttl = opts.ttlInSeconds ? Duration.toSeconds(opts.ttlInSeconds) : 60 * 60;

  const expirationTime = Date.now() + ttl * 1000;
  parsedURL.searchParams.append("expires", expirationTime.toString());

  if (opts.data) {
    A.forEach(Struct.entries(opts.data), ([key, value]) => {
      if (value == null) return;
      const encoded = encodeURIComponent(value);
      parsedURL.searchParams.append(key, encoded);
    });
  }

  const signature = yield* signPayload(parsedURL.toString(), secretKey);
  parsedURL.searchParams.append("signature", signature);

  return parsedURL.href;
});
