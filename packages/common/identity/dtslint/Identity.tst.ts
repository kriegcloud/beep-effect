import type {
  IdentityAnnotationResult,
  IdentityComposer,
  IdentityString,
  IdentitySymbol,
  ModuleSegmentValue,
  SegmentValue,
} from "@beep/identity";
import { make } from "@beep/identity";
import { ServiceMap } from "effect";
import { describe, expect, it } from "tstyche";

describe("Identity", () => {
  it("preserves literal types for make, compose, string, and symbol", () => {
    const $BeepId = make("beep").$BeepId;
    const { $SchemaId } = $BeepId.compose("schema");
    const { $EntitiesId } = $SchemaId.compose("entities");
    const tenantId = $EntitiesId.make("Tenant");
    const serviceId = $SchemaId`TenantService`;

    expect($BeepId).type.toBeAssignableTo<IdentityComposer<"@beep">>();
    expect($SchemaId).type.toBeAssignableTo<IdentityComposer<"@beep/schema">>();
    expect(tenantId).type.toBe<IdentityString<"@beep/schema/entities/Tenant">>();
    expect(serviceId).type.toBe<IdentityString<`@beep/schema/${string}`>>();
    expect($SchemaId.string()).type.toBe<IdentityString<"@beep/schema">>();
    expect($SchemaId.symbol()).type.toBe<IdentitySymbol<"@beep/schema">>();
  });

  it("preserves literal types for annote", () => {
    const { $SchemaId } = make("beep").$BeepId.compose("schema");
    const annotation = $SchemaId.annote("Tenant", {
      default: { version: 1 as const },
      description: "Tenant schema",
    });
    const secondAnnotation = $SchemaId.annote("Tenant", {
      default: { version: 1 as const },
      description: "Tenant schema",
    });

    expect(annotation).type.toBe<IdentityAnnotationResult<"@beep/schema/Tenant", "Tenant", { version: 1 }>>();
    expect(annotation.schemaId).type.toBe<IdentitySymbol<"@beep/schema/Tenant">>();
    expect(secondAnnotation).type.toBe<IdentityAnnotationResult<"@beep/schema/Tenant", "Tenant", { version: 1 }>>();
    expect(secondAnnotation.schemaId).type.toBe<IdentitySymbol<"@beep/schema/Tenant">>();
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
    const $PathI = $BeepId.create("lib/graphiti/client");

    interface FsUtilsShape {
      readonly cwd: () => string;
    }

    class FsUtils extends ServiceMap.Service<FsUtils, FsUtilsShape>()($I`MyService`) {}

    expect(FsUtils.key).type.toBe<IdentityString<`@beep/module/${string}`>>();
    expect($PathI).type.toBeAssignableTo<IdentityComposer<"@beep/lib/graphiti/client">>();
  });

  it("enforces segment invariants at compile time", () => {
    expect<SegmentValue<"schema">>().type.toBe<"schema">();
    expect<SegmentValue<"/schema">>().type.toBe<never>();
    expect<SegmentValue<"schema/">>().type.toBe<never>();
    expect<ModuleSegmentValue<"schema_core">>().type.toBe<"schema_core">();
    expect<ModuleSegmentValue<"1schema">>().type.toBe<never>();
  });

  it("supports template tags for dynamic module names", () => {
    const $BeepId = make("beep").$BeepId;
    const $I = $BeepId.create("module");

    expect($I`1bad`).type.toBe<IdentityString<`@beep/module/${string}`>>();
  });
});
// bench
