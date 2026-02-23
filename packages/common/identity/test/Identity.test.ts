import { make } from "@beep/identity";
import { describe, expect, it } from "vitest";

describe("@beep/identity", () => {
  it("builds root identity strings and symbols", () => {
    const $BeepId = make("beep").$BeepId;

    expect($BeepId.string()).toBe("@beep");
    expect($BeepId.symbol()).toBe(Symbol.for("@beep"));
  });

  it("composes module segments and creates literal identifiers", () => {
    const $SchemaId = make("beep").$BeepId.compose("schema");
    const entityId = $SchemaId.compose("entities").make("Tenant");

    expect(entityId).toBe("@beep/schema/entities/Tenant");
  });

  it("supports create and template tags", () => {
    const $BeepId = make("beep").$BeepId;
    const $I = $BeepId.create("module");

    expect($I`MyService`).toBe("@beep/module/MyService");
  });

  it("creates schema annotate and merges extras", () => {
    const $SchemaId = make("beep").$BeepId.compose("schema");
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
    expect(() => ($I.compose as (segment: string) => unknown)("1bad")).toThrowError(
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
});
