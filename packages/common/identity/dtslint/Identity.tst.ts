import { ServiceMap } from "effect";
import { describe, expect, it } from "tstyche";
import type {
  IdentityAnnotationResult,
  IdentityComposer,
  IdentityString,
  IdentitySymbol,
  ModuleSegmentValue,
  SegmentValue,
} from "../src/index.js";
import { make } from "../src/index.js";

describe("Identity", () => {
  it("preserves literal types for make, compose, string, and symbol", () => {
    const $BeepId = make("beep").$BeepId;
    const $SchemaId = $BeepId.compose("schema");
    const tenantId = $SchemaId.compose("entities").make("Tenant");
    const serviceId = $SchemaId`TenantService`;

    expect($BeepId).type.toBeAssignableTo<IdentityComposer<"@beep">>();
    expect($SchemaId).type.toBeAssignableTo<IdentityComposer<"@beep/schema">>();
    expect(tenantId).type.toBe<IdentityString<"@beep/schema/entities/Tenant">>();
    expect(serviceId).type.toBe<IdentityString<`@beep/schema/${string}`>>();
    expect($SchemaId.string()).type.toBe<IdentityString<"@beep/schema">>();
    expect($SchemaId.symbol()).type.toBe<IdentitySymbol<"@beep/schema">>();
  });

  it("preserves literal types for annotate", () => {
    const $SchemaId = make("beep").$BeepId.compose("schema");
    const annotation = $SchemaId.annotate("Tenant", {
      default: { version: 1 as const },
      description: "Tenant schema",
    });

    expect(annotation).type.toBe<IdentityAnnotationResult<"@beep/schema/Tenant", "Tenant", { version: 1 }>>();
    expect(annotation.schemaId).type.toBe<IdentitySymbol<"@beep/schema/Tenant">>();
  });

  it("supports base normalization while preserving keys/literals", () => {
    const fromPrefixed = make("@beep/schema").$SchemaId;
    const fromAt = make("@schema").$SchemaId;

    expect(fromPrefixed.string()).type.toBe<IdentityString<"@beep/schema">>();
    expect(fromAt.string()).type.toBe<IdentityString<"@beep/schema">>();
  });

  it("supports create + ServiceMap.Service class keys", () => {
    const $BeepId = make("beep").$BeepId;
    const $I = $BeepId.create("module");

    interface FsUtilsShape {
      readonly cwd: () => string;
    }

    class FsUtils extends ServiceMap.Service<FsUtils, FsUtilsShape>()($I`MyService`) {}

    expect(FsUtils.key).type.toBe<IdentityString<`@beep/module/${string}`>>();
  });

  it("enforces segment invariants at compile time", () => {
    expect<SegmentValue<"schema">>().type.toBe<"schema">();
    expect<SegmentValue<"/schema">>().type.toBe<never>();
    expect<SegmentValue<"schema/">>().type.toBe<never>();
    expect<ModuleSegmentValue<"schema_core">>().type.toBe<"schema_core">();
    expect<ModuleSegmentValue<"1schema">>().type.toBe<never>();
  });

  it("rejects invalid compose and make arguments at compile time", () => {
    const $BeepId = make("beep").$BeepId;
    const $I = $BeepId.create("module");

    // @ts-expect-error not assignable to parameter of type 'never'
    $BeepId.compose("1schema");
    // @ts-expect-error not assignable to parameter of type 'never'
    $BeepId.make("/bad");
    // @ts-expect-error not assignable to parameter of type 'never'
    $BeepId.make("bad/");
    expect($I`1bad`).type.toBe<IdentityString<`@beep/module/${string}`>>();
  });
});
// bench
