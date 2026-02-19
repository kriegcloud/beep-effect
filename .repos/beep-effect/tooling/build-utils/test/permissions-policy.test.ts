import {
  createPermissionsPolicyHeader,
  createPermissionsPolicyHeaderValue,
  PermissionsPolicyHeaderSchema,
  PermissionsPolicyOptionSchema,
} from "@beep/build-utils/secure-headers/permissions-policy";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option, Schema as S } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> => Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) => Effect.runSyncExit(effect);

describe("createPermissionsPolicyHeader", () => {
  let headerValueCreatorMock: ReturnType<typeof mock<typeof createPermissionsPolicyHeaderValue>>;
  beforeEach(() => {
    headerValueCreatorMock = mock(createPermissionsPolicyHeaderValue);
  });

  describe("when giving undefined", () => {
    it("should return None", async () => {
      const result = await runEffect(createPermissionsPolicyHeader());
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving false", () => {
    it("should return None", async () => {
      const result = await runEffect(createPermissionsPolicyHeader(false));
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving valid option", () => {
    it("should return Some with Permissions-Policy header when value is provided", async () => {
      const dummyValue = "camera=(), microphone=(self)";
      headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

      const result = await runEffect(
        createPermissionsPolicyHeader({ directives: { camera: "none", microphone: "self" } }, headerValueCreatorMock)
      );

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value).toEqual({
          name: "Permissions-Policy",
          value: dummyValue,
        });
      }
    });

    it("should return None when value creator returns undefined", async () => {
      headerValueCreatorMock.mockReturnValue(Effect.void.pipe(Effect.as(undefined)));

      const result = await runEffect(createPermissionsPolicyHeader(false, headerValueCreatorMock));

      expect(Option.isNone(result)).toBe(true);
    });
  });
});

describe("createPermissionsPolicyHeaderValue", () => {
  describe("when giving undefined", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createPermissionsPolicyHeaderValue())).toBeUndefined();
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createPermissionsPolicyHeaderValue(false))).toBeUndefined();
    });
  });

  describe("when giving single directive with none", () => {
    it('should return "camera=()"', async () => {
      expect(await runEffect(createPermissionsPolicyHeaderValue({ directives: { camera: "none" } }))).toBe("camera=()");
    });
  });

  describe("when giving single directive with self", () => {
    it('should return "microphone=(self)"', async () => {
      expect(await runEffect(createPermissionsPolicyHeaderValue({ directives: { microphone: "self" } }))).toBe(
        "microphone=(self)"
      );
    });
  });

  describe("when giving single directive with *", () => {
    it('should return "fullscreen=*"', async () => {
      expect(await runEffect(createPermissionsPolicyHeaderValue({ directives: { fullscreen: "*" } }))).toBe(
        "fullscreen=*"
      );
    });
  });

  describe("when giving single directive with specific origin", () => {
    it('should return "geolocation=("https://example.com")"', async () => {
      expect(
        await runEffect(
          createPermissionsPolicyHeaderValue({
            directives: { geolocation: '"https://example.com"' },
          })
        )
      ).toBe('geolocation=("https://example.com")');
    });
  });

  describe("when giving multiple origins", () => {
    it('should return "camera=(self "https://example.com")"', async () => {
      expect(
        await runEffect(
          createPermissionsPolicyHeaderValue({
            directives: { camera: ["self", '"https://example.com"'] },
          })
        )
      ).toBe('camera=(self "https://example.com")');
    });
  });

  describe("when giving multiple directives", () => {
    it("should return correct comma-separated output", async () => {
      const result = await runEffect(
        createPermissionsPolicyHeaderValue({
          directives: {
            camera: "none",
            microphone: "self",
            fullscreen: "*",
          },
        })
      );
      expect(result).toContain("camera=()");
      expect(result).toContain("microphone=(self)");
      expect(result).toContain("fullscreen=*");
    });
  });

  describe("when giving invalid directive name", () => {
    it("should raise error", () => {
      expect(
        Exit.isFailure(
          runEffectExit(
            createPermissionsPolicyHeaderValue({
              directives: { "invalid-directive": "none" } as never,
            })
          )
        )
      ).toBe(true);
    });
  });
});

describe("PermissionsPolicyOptionSchema", () => {
  it("should accept valid directive objects", () => {
    const decoded = S.decodeUnknownSync(PermissionsPolicyOptionSchema)({
      directives: { camera: "none", microphone: "self" },
    });
    expect(decoded).toEqual({
      directives: { camera: "none", microphone: "self" },
    });
  });

  it("should accept false", () => {
    expect(S.decodeUnknownSync(PermissionsPolicyOptionSchema)(false)).toBe(false);
  });

  it("should accept directives with array values", () => {
    const decoded = S.decodeUnknownSync(PermissionsPolicyOptionSchema)({
      directives: { camera: ["self", '"https://example.com"'] },
    });
    expect(decoded).toEqual({
      directives: { camera: ["self", '"https://example.com"'] },
    });
  });
});

describe("PermissionsPolicyHeaderSchema", () => {
  describe("decode", () => {
    it("should transform undefined to disabled header", () => {
      const result = S.decodeUnknownSync(PermissionsPolicyHeaderSchema)(undefined);
      expect(result).toEqual({
        name: "Permissions-Policy",
        value: undefined,
      });
    });

    it("should transform false to disabled header", () => {
      const result = S.decodeUnknownSync(PermissionsPolicyHeaderSchema)(false);
      expect(result).toEqual({
        name: "Permissions-Policy",
        value: undefined,
      });
    });

    it("should transform directives to header string", () => {
      const result = S.decodeUnknownSync(PermissionsPolicyHeaderSchema)({
        directives: { camera: "none" },
      });
      expect(result).toEqual({
        name: "Permissions-Policy",
        value: "camera=()",
      });
    });
  });
});
