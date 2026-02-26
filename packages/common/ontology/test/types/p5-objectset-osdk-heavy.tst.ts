import { describe, expect, it } from "tstyche";
import type { ConvertProps, ExtractOptions, Osdk } from "../../src/OsdkObjectFrom.js";
import type { PropertySecurity } from "../../src/object/PropertySecurity.js";
import type { ObjectSet } from "../../src/objectSet/ObjectSet.js";
import type { InterfaceDefinition, InterfaceMetadata } from "../../src/ontology/InterfaceDefinition.js";
import type { ObjectMetadata, ObjectTypeDefinition, PropertyDef } from "../../src/ontology/ObjectTypeDefinition.js";
import type { PageResult } from "../../src/PageResult.js";

interface WorkerInterfaceDefinition extends InterfaceDefinition {
  readonly type: "interface";
  readonly apiName: "acme.hr.Worker";
  readonly __DefinitionMetadata?: InterfaceMetadata & {
    readonly type: "interface";
    readonly apiName: "acme.hr.Worker";
    readonly displayName: "Worker";
    readonly description: undefined;
    readonly rid: "ri.ontology.main.interface.Worker";
    readonly properties: {
      readonly employeeId: PropertyDef<"integer", "non-nullable", "single">;
      readonly employeeName: PropertyDef<"string", "non-nullable", "single">;
      readonly employeeSalary: PropertyDef<"double", "nullable", "single">;
      readonly employeeTags: PropertyDef<"string", "non-nullable", "array">;
      readonly teamId: PropertyDef<"integer", "non-nullable", "single">;
    };
    readonly links: {};
    readonly implementedBy: readonly ["acme.hr.Employee"];
    readonly objectSet?: ObjectSet<WorkerInterfaceDefinition>;
    readonly props?: {
      readonly employeeId: number;
      readonly employeeName: string;
      readonly employeeSalary: number | undefined;
      readonly employeeTags: ReadonlyArray<string>;
      readonly teamId: number;
    };
    readonly strictProps?: unknown;
    readonly linksType?: unknown;
  };
}

interface TeamDefinition extends ObjectTypeDefinition {
  readonly type: "object";
  readonly apiName: "acme.hr.Team";
  readonly __DefinitionMetadata?: {
    readonly type: "object";
    readonly apiName: "acme.hr.Team";
    readonly displayName: "Team";
    readonly description: undefined;
    readonly rid: "ri.ontology.main.object.Team";
    readonly properties: {
      readonly teamId: PropertyDef<"integer", "non-nullable", "single">;
      readonly title: PropertyDef<"string", "non-nullable", "single">;
    };
    readonly primaryKeyApiName: "teamId";
    readonly titleProperty: "title";
    readonly links: {
      readonly members: ObjectMetadata.Link<EmployeeDefinition, true>;
    };
    readonly primaryKeyType: "integer";
    readonly icon: undefined;
    readonly visibility: undefined;
    readonly pluralDisplayName: "Teams";
    readonly status: undefined;
    readonly interfaceMap: {};
    readonly inverseInterfaceMap: {};
    readonly objectSet?: ObjectSet<TeamDefinition>;
    readonly props?: {
      readonly teamId: number;
      readonly title: string;
    };
    readonly strictProps?: unknown;
    readonly linksType?: unknown;
  };
}

interface EmployeeDefinition extends ObjectTypeDefinition {
  readonly type: "object";
  readonly apiName: "acme.hr.Employee";
  readonly __DefinitionMetadata?: {
    readonly type: "object";
    readonly apiName: "acme.hr.Employee";
    readonly displayName: "Employee";
    readonly description: undefined;
    readonly rid: "ri.ontology.main.object.Employee";
    readonly implements: readonly ["acme.hr.Worker"];
    readonly properties: {
      readonly id: PropertyDef<"integer", "non-nullable", "single">;
      readonly name: PropertyDef<"string", "non-nullable", "single">;
      readonly salary: PropertyDef<"double", "nullable", "single">;
      readonly tags: PropertyDef<"string", "non-nullable", "array">;
      readonly teamId: PropertyDef<"integer", "non-nullable", "single">;
      readonly embedding: PropertyDef<"vector", "non-nullable", "single">;
    };
    readonly primaryKeyApiName: "id";
    readonly titleProperty: "name";
    readonly links: {
      readonly team: ObjectMetadata.Link<TeamDefinition, false>;
      readonly teammates: ObjectMetadata.Link<EmployeeDefinition, true>;
    };
    readonly primaryKeyType: "integer";
    readonly icon: undefined;
    readonly visibility: undefined;
    readonly pluralDisplayName: "Employees";
    readonly status: undefined;
    readonly interfaceMap: {
      readonly "acme.hr.Worker": {
        readonly employeeId: "id";
        readonly employeeName: "name";
        readonly employeeSalary: "salary";
        readonly employeeTags: "tags";
        readonly teamId: "teamId";
      };
    };
    readonly inverseInterfaceMap: {
      readonly "acme.hr.Worker": {
        readonly id: "acme.hr.employeeId";
        readonly name: "acme.hr.employeeName";
        readonly salary: "acme.hr.employeeSalary";
        readonly tags: "acme.hr.employeeTags";
        readonly teamId: "acme.hr.teamId";
      };
    };
    readonly objectSet?: ObjectSet<EmployeeDefinition>;
    readonly props?: {
      readonly id: number;
      readonly name: string;
      readonly salary: number | undefined;
      readonly tags: ReadonlyArray<string>;
      readonly teamId: number;
      readonly embedding: ReadonlyArray<number>;
    };
    readonly strictProps?: unknown;
    readonly linksType?: unknown;
  };
}

declare const employees: ObjectSet<EmployeeDefinition>;

describe("P5 ObjectSet + OsdkObjectFrom heavy generics", () => {
  it("converts object/interface property names across $as mappings", () => {
    expect<ConvertProps<EmployeeDefinition, WorkerInterfaceDefinition, "id" | "name" | "$rid">>().type.toBe<
      "employeeId" | "employeeName" | "$rid"
    >();

    expect<ConvertProps<WorkerInterfaceDefinition, EmployeeDefinition, "employeeId" | "employeeName">>().type.toBe<
      "id" | "name"
    >();
  });

  it("extracts options for rid/all-properties/property-securities combinations", () => {
    expect<ExtractOptions<true, "drop", true, true>>().type.toBe<
      "$rid" | "$allBaseProperties" | "$propertySecurities"
    >();
  });

  it("projects property security metadata with multiplicity-aware shapes", () => {
    type SecureEmployee = Osdk.Instance<EmployeeDefinition, "$propertySecurities", "name" | "tags">;

    expect<SecureEmployee["$propertySecurities"]["name"]>().type.toBe<PropertySecurity[]>();
    expect<SecureEmployee["$propertySecurities"]["tags"]>().type.toBe<PropertySecurity[][]>();
  });

  it("types fetch, derived properties, pivot, and nearest-neighbor operations on object sets", () => {
    const selectedBase: Array<"id" | "name"> = ["id", "name"];
    const basePage = employees.fetchPage({ $select: selectedBase, $includeRid: true });

    expect(basePage).type.toBeAssignableTo<
      Promise<PageResult<Osdk.Instance<EmployeeDefinition, "$rid", "id" | "name">>>
    >();

    const enriched = employees.withProperties({
      normalizedSalary: (builder) => builder.selectProperty("salary").max(100),
      salaryBucket: (builder) => builder.pivotTo("teammates").aggregate("$count"),
    });

    const selectedEnriched: Array<"name" | "normalizedSalary" | "salaryBucket"> = [
      "name",
      "normalizedSalary",
      "salaryBucket",
    ];
    const enrichedPage = enriched.fetchPage({ $select: selectedEnriched });

    type EnrichedItem = Awaited<typeof enrichedPage>["data"][number];
    expect<EnrichedItem["name"]>().type.toBe<string>();
    expect<EnrichedItem["normalizedSalary"]>().type.toBe<number>();
    expect<EnrichedItem["salaryBucket"]>().type.toBe<number>();

    const teams = employees.pivotTo("team");
    expect(teams).type.toBe<ObjectSet<TeamDefinition>>();

    const selectedName: Array<"name"> = ["name"];
    const one = employees.fetchOne(1, { $select: selectedName, $includeRid: true });
    expect(one).type.toBeAssignableTo<Promise<Osdk.Instance<EmployeeDefinition, "$rid", "name">>>();

    const nearest = employees.nearestNeighbors("ops analytics", 5, "embedding");
    expect(nearest).type.toBe<ObjectSet<EmployeeDefinition>>();
  });
});
