import { describe, expect, expectTypeOf, it, spyOn } from "bun:test";
import * as Identifier from "@beep/identity/Identifier";
import { __internal } from "@beep/identity/Identifier";
import type { IdentityString } from "@beep/identity/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
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

describe("Identity Registry", () => {
  it("registers root identity on make() call", () => {
    const { $TestId } = Identifier.make("test");

    const values = [...$TestId.identityRegistry];
    expect(values).toEqual(["@beep/test"]);
  });

  it("tracks identities created via compose", () => {
    const { $TestId } = Identifier.make("test");
    $TestId.compose("module-a", "module-b");

    const values = [...$TestId.identityRegistry];
    expect(values).toContain("@beep/test");
    expect(values).toContain("@beep/test/module-a");
    expect(values).toContain("@beep/test/module-b");
  });

  it("tracks identities created via create", () => {
    const { $TestId } = Identifier.make("test");
    const child = $TestId.create("child");
    child.create("grandchild");

    const values = [...$TestId.identityRegistry];
    expect(values).toContain("@beep/test/child");
    expect(values).toContain("@beep/test/child/grandchild");
  });

  it("tracks identities created via template tags", () => {
    const { $TestId } = Identifier.make("test");
    const { $ModuleId } = $TestId.compose("module");
    $ModuleId`ServiceA`;
    $ModuleId`ServiceB`;

    const values = [...$TestId.identityRegistry];
    expect(values).toContain("@beep/test/module/ServiceA");
    expect(values).toContain("@beep/test/module/ServiceB");
  });

  it("tracks identities created via make method", () => {
    const { $TestId } = Identifier.make("test");
    $TestId.make("CustomPath");

    const values = [...$TestId.identityRegistry];
    expect(values).toContain("@beep/test/CustomPath");
  });

  it("tracks identities created via annotations with #annotation suffix", () => {
    const { $TestId } = Identifier.make("test");
    const { $SchemaId } = $TestId.compose("schema");
    $SchemaId.annotations("MyEntity");
    $SchemaId.annotations("AnotherEntity", { description: "With extras" });

    const values = [...$TestId.identityRegistry];
    // Annotations are registered with #annotation suffix to avoid collision with template tags
    expect(values).toContain("@beep/test/schema/MyEntity#annotation");
    expect(values).toContain("@beep/test/schema/AnotherEntity#annotation");
  });

  it("shares registry across all derived composers", () => {
    const { $TestId } = Identifier.make("test");
    const { $ChildId } = $TestId.compose("child");
    const grandchild = $ChildId.create("grandchild");
    grandchild`Service`;

    // All share the same registry reference
    expect($TestId.identityRegistry).toBe($ChildId.identityRegistry);
    expect($ChildId.identityRegistry).toBe(grandchild.identityRegistry);

    // Verify all expected values are present
    const values = [...$TestId.identityRegistry];
    expect(values).toEqual(
      expect.arrayContaining([
        "@beep/test",
        "@beep/test/child",
        "@beep/test/child/grandchild",
        "@beep/test/child/grandchild/Service",
      ])
    );
    expect(values).toHaveLength(4);
  });

  it("isolates registries between different make() calls", () => {
    const { $FooId } = Identifier.make("foo");
    const { $BarId } = Identifier.make("bar");

    $FooId.compose("module");
    $BarId.compose("other");

    const fooValues = [...$FooId.identityRegistry];
    const barValues = [...$BarId.identityRegistry];

    expect(fooValues).toContain("@beep/foo/module");
    expect(fooValues).not.toContain("@beep/bar/other");
    expect(barValues).toContain("@beep/bar/other");
    expect(barValues).not.toContain("@beep/foo/module");
  });

  it("warns on duplicate identity registration", () => {
    const { $TestId } = Identifier.make("test");
    const warnSpy = spyOn(console, "warn");

    // First registration - no warning
    $TestId.make("Duplicate");
    expect(warnSpy).not.toHaveBeenCalled();

    // Second registration - should warn
    $TestId.make("Duplicate");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain("Duplicate identity detected");
    expect(warnSpy.mock.calls[0]?.[0]).toContain("@beep/test/Duplicate");

    // Third registration - should warn again
    $TestId.make("Duplicate");
    expect(warnSpy).toHaveBeenCalledTimes(2);

    // Value is still only stored once (HashSet deduplicates)
    const values = [...$TestId.identityRegistry];
    const duplicateCount = F.pipe(
      values,
      A.filter((v) => v === "@beep/test/Duplicate"),
      A.length
    );
    expect(duplicateCount).toBe(1);

    warnSpy.mockRestore();
  });

  it("warns on cross-slice duplicate (simulating copy-paste error)", () => {
    // Simulate the copy-paste error scenario from the docs
    const { $DocumentsDomainId } = Identifier.make("documents-domain");
    const warnSpy = spyOn(console, "warn");

    // First slice registers Document
    const docsModels = $DocumentsDomainId.create("models");
    docsModels`Document`;

    // Second slice (simulating wrong import - same base composer)
    // This would happen if someone copy-pasted and forgot to change the import
    docsModels`Document`; // Same path = duplicate!

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain("@beep/documents-domain/models/Document");
    expect(warnSpy.mock.calls[0]?.[0]).toContain("copy-paste error");

    warnSpy.mockRestore();
  });

  it("does not warn when template tag and annotations use same name", () => {
    // This is the common pattern where $I`Model` and $I.annotations("Model") are both used
    const { $TestId } = Identifier.make("test");
    const warnSpy = spyOn(console, "warn");

    const { $ModelsId } = $TestId.compose("models");

    // Use template tag for Model class identifier
    $ModelsId`SessionModel`;

    // Use annotations for schema annotations (same name)
    $ModelsId.annotations("SessionModel", { description: "Session model" });

    // No warning should occur because annotations uses #annotation suffix
    expect(warnSpy).not.toHaveBeenCalled();

    // Both should be in registry with different keys
    const values = [...$TestId.identityRegistry];
    expect(values).toContain("@beep/test/models/SessionModel");
    expect(values).toContain("@beep/test/models/SessionModel#annotation");

    warnSpy.mockRestore();
  });
});
