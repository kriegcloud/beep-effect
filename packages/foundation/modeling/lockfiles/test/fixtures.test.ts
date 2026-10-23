import { JsoncFingerprint } from "@beep/jsonc/JsoncFingerprint";
import { assert, describe, layer } from "@effect/vitest";
import * as A from "effect/Array";
import * as Crypto from "effect/Crypto";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as R from "effect/Record";
import * as Str from "effect/String";
import captures from "./fixtures/digests.json" with { type: "json" };
import { corpus, fixture, unsuffixedCaptures } from "./support/fixtures.ts";

// A real SHA-256 backend over WebCrypto, wired through core's Crypto.make: the
// oracle that hashes each capture's UTF-8 bytes through @beep/jsonc's
// content fingerprint.
const WebCrypto = Layer.succeed(
  Crypto.Crypto,
  Crypto.make({
    randomBytes: (size) => globalThis.crypto.getRandomValues(new Uint8Array(size)),
    digest: (algorithm, data) =>
      Effect.map(
        Effect.promise(() => globalThis.crypto.subtle.digest(algorithm, new Uint8Array(data))),
        (buffer) => new Uint8Array(buffer)
      ),
  })
);

describe("historical lockfile documents", () => {
  layer(WebCrypto)((it) => {
    it.effect("preserves every captured document verbatim behind a non-installable filename", () =>
      Effect.gen(function* () {
        assert.strictEqual(captures.length, 38);
        assert.deepStrictEqual(unsuffixedCaptures, []);
        for (const { logicalPath, sha256 } of captures) {
          assert.isTrue(R.has(corpus, logicalPath), logicalPath);
          assert.strictEqual(yield* JsoncFingerprint.hashText(fixture(logicalPath)), sha256, logicalPath);
        }
      })
    );

    it.effect("enumerates the stored corpus so a new capture cannot escape the byte-preservation guard", () =>
      Effect.sync(() => {
        assert.deepStrictEqual(
          A.sort(
            A.map(captures, ({ logicalPath }) => logicalPath),
            Str.Order
          ),
          A.sort(R.keys(corpus), Str.Order)
        );
      })
    );
  });
});
