import { describe, expect, it } from "tstyche";
import type { InterfaceDefinition, InterfaceMetadata } from "../../src/ontology/InterfaceDefinition.js";
import type { ObjectSpecifier } from "../../src/ontology/ObjectSpecifier.js";
import type { ObjectTypeDefinition } from "../../src/ontology/ObjectTypeDefinition.js";

type EmployeeObjectDefinition = ObjectTypeDefinition & {
  readonly type: "object";
  readonly apiName: "Employee";
};

type EmployeeCompatibleInterface = InterfaceDefinition & {
  readonly type: "interface";
  readonly apiName: "FooInterface";
  readonly __DefinitionMetadata?: InterfaceMetadata & {
    readonly type: "interface";
    readonly apiName: "FooInterface";
    readonly displayName: "Foo Interface";
    readonly description: undefined;
    readonly rid: "ri.ontology.main.interface.foo";
    readonly links: {};
    readonly properties: {};
    readonly implementedBy: readonly ["Employee"];
  };
};

describe("ObjectSpecifier", () => {
  it("brands object definitions with exact apiName", () => {
    expect<ObjectSpecifier<EmployeeObjectDefinition>>().type.toBe<string & { readonly __apiName: "Employee" }>();
  });

  it("includes implementedBy api names for interfaces", () => {
    expect<ObjectSpecifier<EmployeeCompatibleInterface>>().type.toBe<
      string & { readonly __apiName: "FooInterface" | "Employee" }
    >();
  });

  it("rejects mismatched object specifier brands", () => {
    type NonEmployee = ObjectTypeDefinition & {
      readonly type: "object";
      readonly apiName: "NotEmployee";
    };

    expect<ObjectSpecifier<NonEmployee>>().type.not.toBeAssignableTo<ObjectSpecifier<EmployeeObjectDefinition>>();
  });
});
