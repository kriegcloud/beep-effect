import { describe, effect, expect } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { isEvent, make, TypeId } from "../src/event.ts";

describe("event", () => {
  effect("marks events with the TypeId and defaults schemas", () =>
    Effect.gen(function* () {
      const event = make({
        tag: "UserCreated",
        primaryKey: (payload: { readonly id: string }) => payload.id,
        payload: S.Struct({ id: S.String }),
      });

      expect(isEvent(event)).toBe(true);
      expect(event[TypeId]).toBe(TypeId);
      expect(event.tag).toBe("UserCreated");
      expect(event.success).toBe(S.Void);
      expect(event.error).toBe(S.Never);

      const payload = { id: "abc" };
      expect(event.primaryKey(payload)).toBe("abc");

      const encoded = yield* S.encode(event.payloadMsgPack)(payload);
      const decoded = yield* S.decode(event.payloadMsgPack)(encoded);
      expect(decoded).toEqual(payload);
    })
  );

  effect("allows overriding success and error schemas", () =>
    Effect.gen(function* () {
      const custom = make({
        tag: "Custom",
        primaryKey: () => "pk",
        payload: S.Struct({ value: S.Number }),
        success: S.Struct({ ok: S.Boolean }),
        error: S.Struct({ message: S.String }),
      });

      expect(custom.success).toBeDefined();
      expect(custom.error).toBeDefined();

      const payload = { value: 1 };
      const encoded = yield* S.encode(custom.payloadMsgPack)(payload);
      const decoded = yield* S.decode(custom.payloadMsgPack)(encoded);
      expect(decoded).toEqual(payload);
    })
  );

  effect("pipe supports chaining across the proto", () =>
    Effect.gen(function* () {
      const event = make({
        tag: "Pipeable",
        primaryKey: (payload: { readonly n: number }) => `n-${payload.n}`,
        payload: S.Struct({ n: S.Number }),
      });

      const payloads = [{ n: 1 }, { n: 2 }] as const;

      const keys = F.pipe(
        payloads,
        A.map((payload) => event.primaryKey(payload))
      );

      expect(keys).toEqual(["n-1", "n-2"]);
    })
  );
});
