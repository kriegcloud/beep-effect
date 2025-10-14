import { describe } from "bun:test";
import { IconifyCollectionsResponseSchema, IconifyIconSetSchema } from "@beep/repo-scripts/iconify/schema";
import { assertTrue, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as S from "effect/Schema";

describe("Iconify schemas", () => {
  effect("decodes a valid collections response", () =>
    Effect.gen(function* () {
      const input = {
        mdi: {
          name: "Material Design",
          total: 2,
          version: "1.0.0",
          samples: ["mdi:account", "mdi:plus"],
        },
        ic: {
          name: "Material Icons",
          total: 1,
          samples: ["ic:outline-home"],
        },
      } as const;

      const result = yield* S.decodeUnknown(IconifyCollectionsResponseSchema)(input);

      strictEqual(result.mdi?.total, 2);
      strictEqual(result.ic?.name, "Material Icons");
    })
  );

  effect("fails decoding an icon set without SVG body", () =>
    Effect.gen(function* () {
      const invalid = {
        prefix: "mdi",
        icons: {
          account: {},
        },
      };

      const exit = yield* Effect.exit(S.decodeUnknown(IconifyIconSetSchema)(invalid));
      assertTrue(Exit.isFailure(exit));
    })
  );
});
