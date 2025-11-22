import { describe, expect, expectTypeOf, it } from "bun:test";
import * as Identifier from "@beep/identity/Identifier";
import { __internal } from "@beep/identity/Identifier";
import type { IdentityString } from "@beep/identity/types";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

describe("Identifier v2", () => {
  it("builds root and composed namespaces with $ accessors", () => {
    const { $BeepId } = Identifier.make("beep");
    const { $SchemaId, $SharedDomainId } = $BeepId.compose("schema", "shared-domain");
    expect($BeepId.string()).toBe("@beep" as IdentityString<"@beep">);
    expect($SchemaId.string()).toBe("@beep/schema" as IdentityString<"@beep/schema">);

    expect($SharedDomainId.string()).toBe("@beep/shared-domain" as IdentityString<"@beep/shared-domain">);

    const nested = $SchemaId.make("custom/dates");
    expect(nested).toBe("@beep/schema/custom/dates" as IdentityString<"@beep/schema/custom/dates">);
  });

  it("returns identity strings from tagged templates", () => {
    const { $BeepId } = Identifier.make("beep");
    const { $SchemaId } = $BeepId.compose("schema");

    const serviceId = $SchemaId`TenantService`;
    expect(serviceId).toBe("@beep/schema/TenantService" as IdentityString<"@beep/schema/TenantService">);
    expectTypeOf(serviceId).toMatchTypeOf<IdentityString<`@beep/schema/${string}`>>();
  });

  it("rejects interpolations and invalid tag shapes", () => {
    const { $BeepId } = Identifier.make("beep");
    const { $SchemaId } = $BeepId.compose("schema");

    // TS2345: Argument of type "X" is not assignable to parameter of type never
    expect(() => $SchemaId`Service-${"X"}`).toThrow("Identifier template tags do not allow interpolations.");
    expect(() =>
      ($SchemaId as unknown as (strings: TemplateStringsArray) => string)(["a", "b"] as unknown as TemplateStringsArray)
    ).toThrow("Identifier template tags must use a single literal segment.");
  });

  it("rejects invalid bases and module segments", () => {
    expect(() => Identifier.make("!beep" as unknown as "!beep")).toThrow(
      "Identity bases must use alphanumeric, hyphen, or underscore characters and start/end with alphanumeric."
    );
    expect(() => Identifier.make("" as unknown as "")).toThrow("Identity bases cannot be empty.");
    expect(() => Identifier.make(123 as unknown as "123")).toThrow("Identity bases must be strings.");

    const { $BeepId } = Identifier.make("beep");
    expect(() => $BeepId.compose("1invalid")).toThrow(
      "Module segments must start with an alphabetic character to create valid accessors."
    );
    expect(() => $BeepId.compose("ann@tations" as unknown as "ann@tations")).toThrow(
      "Module segments must contain only alphanumeric characters, hyphens, or underscores."
    );
    expect(() => $BeepId.compose("" as unknown as "")).toThrow("Identity segments cannot be empty.");
    expect(() => $BeepId.compose(123 as unknown as "123")).toThrow("Identity segments must be strings.");
    expect(() => $BeepId.compose("/annotations" as unknown as "/annotations")).toThrow(
      'Identity segments cannot start with "/"'
    );
    expect(() => $BeepId.compose("annotations/" as unknown as "annotations/")).toThrow(
      'Identity segments cannot end with "/"'
    );
  });

  it("normalizes optional @beep prefix on base", () => {
    const { $RuntimeId } = Identifier.make("@beep/runtime");
    expect($RuntimeId.string()).toBe("@beep/runtime" as IdentityString<"@beep/runtime">);

    const { $ServicesId } = $RuntimeId.compose("services");
    expect($ServicesId.symbol().description).toBe("@beep/runtime/services");

    const { $BeepId: $RootBeepId } = Identifier.make("@beep");
    expect($RootBeepId.string()).toBe("@beep" as IdentityString<"@beep">);

    const { $FooId } = Identifier.make("@beep/foo");
    expect($FooId.string()).toBe("@beep/foo" as IdentityString<"@beep/foo">);

    const { $FooId: $BeepFooId } = Identifier.make("@beep/foo");
    expect($BeepFooId.string()).toBe("@beep/foo" as IdentityString<"@beep/foo">);

    const { $XId } = Identifier.make("@beep/x");
    expect($XId.string()).toBe("@beep/x" as IdentityString<"@beep/x">);
  });

  it("provides annotations with titles and stable symbols", () => {
    const { $BeepId } = Identifier.make("beep");
    const { $SchemaId } = $BeepId.compose("schema");

    const base = $SchemaId.annotations("MySchema");
    const extended = $SchemaId.annotations<string>("MySchema", { description: "Custom" });

    const schema = S.String.annotations(extended);
    const identifier = AST.getIdentifierAnnotation(schema.ast);
    const schemaSymbol = AST.getSchemaIdAnnotation(schema.ast);
    const description = AST.getDescriptionAnnotation(schema.ast);

    expect(O.isSome(identifier)).toBe(true);
    expect(O.isSome(schemaSymbol)).toBe(true);
    expect(O.isSome(description)).toBe(true);

    expect(base.identifier).toBe("MySchema");
    expect(base.title).toBe("MySchema");
    expect(base.schemaId.description).toBe("@beep/schema/MySchema");
    expect(extended.schemaId).toBe(base.schemaId);
  });

  it("covers internal helpers", () => {
    expect(__internal.toTaggedKey("foo")).toBe("$FooId");
    expect(__internal.toPascalIdentifier("foo-bar")).toBe("FooBar");
    expect(__internal.toTitle("fooBar_baz")).toBe("FooBar Baz");
    expect(() => __internal.ensureSegment(123 as unknown as "123")).toThrow("Identity segments must be strings.");
    expect(() => __internal.ensureBaseSegment("" as unknown as string)).toThrow("Identity bases cannot be empty.");
    expect(() => __internal.ensureBaseSegment(123 as unknown as string)).toThrow("Identity bases must be strings.");
    expect(__internal.normalizeBase("@beep/foo" as const)).toBe("foo");
  });
});
