import { make } from "@beep/identity";
import { describe, expect, it } from "vitest";

describe("@beep/identity", () => {
  it("builds root identity strings and symbols", () => {
    const $BeepId = make("beep").$BeepId;

    expect($BeepId.string()).toBe("@beep");
    expect($BeepId.symbol()).toBe(Symbol.for("@beep"));
  });

  it("chains create for single-segment composition", () => {
    const $SchemaId = make("beep").$BeepId.create("schema");
    const entityId = $SchemaId.create("entities").make("Tenant");

    expect(entityId).toBe("@beep/schema/entities/Tenant");
  });

  it("composes variadic segments into tagged module record", () => {
    const $BeepId = make("beep").$BeepId;
    const modules = $BeepId.compose("schema", "errors");

    expect(modules.$SchemaId.string()).toBe("@beep/schema");
    expect(modules.$ErrorsId.string()).toBe("@beep/errors");
    expect(modules.$SchemaId.make("Tenant")).toBe("@beep/schema/Tenant");
  });

  it("composes single segment into tagged module record", () => {
    const $BeepId = make("beep").$BeepId;
    const { $SchemaId } = $BeepId.compose("schema");

    expect($SchemaId.string()).toBe("@beep/schema");
    expect($SchemaId`Entity`).toBe("@beep/schema/Entity");
  });

  it("supports create and template tags", () => {
    const $BeepId = make("beep").$BeepId;
    const $I = $BeepId.create("module");

    expect($I`MyService`).toBe("@beep/module/MyService");
  });

  it("creates schema annotate and merges extras", () => {
    const $SchemaId = make("beep").$BeepId.create("schema");
    const annotation = $SchemaId.annotate("Tenant", {
      description: "Tenant schema",
    });

    expect(annotation.schemaId).toBe(Symbol.for("@beep/schema/Tenant"));
    expect(annotation.identifier).toBe("Tenant");
    expect(annotation.title).toBe("Tenant");
    expect(annotation.description).toBe("Tenant schema");
  });

  it("throws schema validation messages for invalid values", () => {
    const $I = make("beep").$BeepId;
    expect(() => ($I.make as (segment: string) => unknown)("/bad")).toThrowError(
      'Identity segments cannot start with "/".'
    );
    expect(() => ($I.create as (segment: string) => unknown)("1bad")).toThrowError(
      "Module segments must start with an alphabetic character to create valid accessors."
    );
    expect(() => make("-bad")).toThrowError(
      "Identity bases must use alphanumeric, hyphen, or underscore characters and start/end with alphanumeric."
    );
  });

  it("rejects interpolations in identity template tags", () => {
    const $I = make("beep").$BeepId.create("module");
    expect(
      () => ($I as unknown as (s: TemplateStringsArray, ...v: ReadonlyArray<unknown>) => unknown)`My${"Svc"}`
    ).toThrowError("Identity template tags do not allow interpolations.");
  });

  it("shares registry across all derived composers", () => {
    const $BeepId = make("beep").$BeepId;
    const { $SchemaId } = $BeepId.compose("schema");
    $SchemaId.make("Entity");
    const serviceId = $SchemaId`Service`;

    const values = Array.from($BeepId.identityRegistry);
    expect(serviceId).toBe("@beep/schema/Service");
    expect(values).toContain("@beep");
    expect(values).toContain("@beep/schema");
    expect(values).toContain("@beep/schema/Entity");
    expect(values).toContain("@beep/schema/Service");
  });

  it("composes nested module records from sub-composers", () => {
    const { $IamServerId } = make("beep").$BeepId.compose("iam-server");
    const { $ReposId, $ServicesId } = $IamServerId.compose("repos", "services");

    expect($ReposId.make("UserRepo")).toBe("@beep/iam-server/repos/UserRepo");
    expect($ServicesId.make("AuthService")).toBe("@beep/iam-server/services/AuthService");
  });
});
// bench
