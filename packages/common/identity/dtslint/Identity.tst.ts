import type {
  HttpApiEncoding,
  IdentityComposer,
  IdentityString,
  IdentitySymbol,
  ModuleSegmentValue,
  SegmentValue,
  TitleFromIdentifier,
} from "@beep/identity";
import { make } from "@beep/identity";
import { ServiceMap } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

declare module "effect/Schema" {
  namespace Annotations {
    interface Annotations {
      readonly version?: 1 | undefined;
    }
  }
}

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

  it("preserves literal types for annote and derived titles", () => {
    const { $SchemaId } = make("beep").$BeepId.compose("schema");
    const annotation = $SchemaId.annote("tenant_profile-name", {
      default: { version: 1 as const },
      description: "Tenant schema",
      version: 1 as const,
    });

    expect<TitleFromIdentifier<"tenant_profile-name">>().type.toBe<"Tenant Profile Name">();
    expect(annotation.schemaId).type.toBe<IdentitySymbol<"@beep/schema/tenant_profile-name">>();
    expect(annotation.identifier).type.toBe<"tenant_profile-name">();
    expect(annotation.title).type.toBe<"Tenant Profile Name">();
    expect(annotation.default).type.toBe<{ readonly version: 1 }>();
    expect(annotation.version).type.toBe<1>();
  });

  it("types annoteSchema and annoteHttp like schema annotators", () => {
    const { $SchemaId } = make("beep").$BeepId.compose("schema");
    const textEncoding = { _tag: "Text", contentType: "text/plain" } as const satisfies HttpApiEncoding;
    const schemaAnnotated = S.String.pipe(
      $SchemaId.annoteSchema("tenant_profile-name", {
        default: "tenant",
        description: "Tenant schema",
        version: 1 as const,
      })
    );
    const httpAnnotated = S.String.pipe(
      $SchemaId.annoteHttp("TextResponse", {
        description: "Text response payload",
        httpApiStatus: 202,
        "~httpApiEncoding": textEncoding,
      })
    );

    expect(schemaAnnotated).type.toBe<typeof S.String>();
    expect(httpAnnotated).type.toBe<typeof S.String>();
  });

  it("supports ergonomic and strict annoteKey typing", () => {
    const { $SchemaId } = make("beep").$BeepId.compose("schema");
    type MyClass = {
      readonly field1: string;
      readonly nested: {
        readonly count: number;
      };
    };

    const ergonomicAnnotated = S.String.pipe(
      $SchemaId.annoteKey("MyClass.field1", {
        default: "tenant",
        messageMissingKey: "Field1 is required",
      })
    );
    const strictAnnotated = S.String.pipe(
      $SchemaId.annoteKey<MyClass>()("MyClass.field1", {
        default: "tenant",
        messageMissingKey: "Field1 is required",
      })
    );
    const strictNestedAnnotated = S.Number.pipe(
      $SchemaId.annoteKey<MyClass>()("MyClass.nested.count", {
        default: 1,
      })
    );

    expect(ergonomicAnnotated).type.toBe<typeof S.String>();
    expect(strictAnnotated).type.toBe<typeof S.String>();
    expect(strictNestedAnnotated).type.toBe<typeof S.Number>();

    // @ts-expect-error!
    $SchemaId.annoteKey<MyClass>()("MyClass.missing", {
      default: "tenant",
    });

    // @ts-expect-error!
    S.String.pipe(
      $SchemaId.annoteKey<MyClass>()("MyClass.nested.count", {
        default: 1,
      })
    );
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
