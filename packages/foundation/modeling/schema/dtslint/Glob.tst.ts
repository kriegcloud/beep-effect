import { Glob } from "@beep/schema/Glob";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type * as GlobModule from "@beep/schema/Glob";
import type { Glob as GlobType } from "@beep/schema/Glob";
import type * as Brand from "effect/Brand";

describe("Glob", () => {
  it("preserves the branded schema surface", () => {
    expect<Glob>().type.toBe<string & Brand.Brand<"Glob">>();
    expect<typeof Glob.Encoded>().type.toBe<string>();
    expect<GlobType>().type.toBe<string & Brand.Brand<"Glob">>();
  });

  it("exposes decode helpers that produce the branded type", () => {
    const decode = S.decodeSync(Glob);
    const decoded = decode("src/**/*.ts");

    expect(decoded).type.toBe<GlobType>();
  });

  it("exposes a guard that narrows to the branded type", () => {
    const isGlob = S.is(Glob);
    const value: unknown = "src/**/*.ts";

    if (isGlob(value)) {
      expect(value).type.toBe<GlobType>();
    }
  });

  it("integrates into object schemas with a glob property", () => {
    const Payload = S.Struct({
      glob: Glob,
    });
    const decode = S.decodeUnknownSync(Payload);
    const payload = decode({ glob: "src/**/*.ts" });

    expect<typeof Payload.Type>().type.toBe<Readonly<{ glob: GlobType }>>();
    expect<typeof Payload.Encoded>().type.toBe<Readonly<{ glob: string }>>();
    expect(payload).type.toBe<Readonly<{ glob: GlobType }>>();
  });

  it("exposes the canonical namespace schema role", () => {
    expect<GlobModule.Schema>().type.toBe<GlobType>();
    expect<typeof GlobModule.Schema.Encoded>().type.toBe<string>();
    expect<typeof GlobModule.Glob>().type.toBe<typeof GlobModule.Schema>();
  });
});
