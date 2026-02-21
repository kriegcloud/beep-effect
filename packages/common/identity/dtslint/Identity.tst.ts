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

    expect($BeepId).type.toBeAssignableTo<IdentityComposer<"@beep">>();
    expect($SchemaId).type.toBeAssignableTo<IdentityComposer<"@beep/schema">>();
    expect(tenantId).type.toBe<IdentityString<"@beep/schema/entities/Tenant">>();
    expect($SchemaId.string()).type.toBe<IdentityString<"@beep/schema">>();
    expect($SchemaId.symbol()).type.toBe<IdentitySymbol<"@beep/schema">>();
  });

  it("preserves literal types for annotations", () => {
    const $SchemaId = make("beep").$BeepId.compose("schema");
    const annotation = $SchemaId.annotations("Tenant", {
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

  it("enforces segment invariants at compile time", () => {
    expect<SegmentValue<"schema">>().type.toBe<"schema">();
    expect<SegmentValue<"/schema">>().type.toBe<never>();
    expect<SegmentValue<"schema/">>().type.toBe<never>();
    expect<ModuleSegmentValue<"schema_core">>().type.toBe<"schema_core">();
    expect<ModuleSegmentValue<"1schema">>().type.toBe<never>();
  });

  it("rejects invalid compose and make arguments at compile time", () => {
    const $BeepId = make("beep").$BeepId;

    // @ts-expect-error not assignable to parameter of type 'never'
    $BeepId.compose("1schema");
    // @ts-expect-error not assignable to parameter of type 'never'
    $BeepId.make("/bad");
    // @ts-expect-error not assignable to parameter of type 'never'
    $BeepId.make("bad/");
  });
});
