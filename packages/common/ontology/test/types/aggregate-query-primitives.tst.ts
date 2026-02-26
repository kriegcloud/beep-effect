import { describe, expect, it } from "tstyche";
import type { AggregateOptsThatErrorsAndDisallowsOrderingWithMultipleGroupBy } from "../../src/aggregate/AggregateOptsThatErrors.js";
import type { AggregationResultsWithGroups } from "../../src/aggregate/AggregationResultsWithGroups.js";
import type { AggregationResultsWithoutGroups } from "../../src/aggregate/AggregationResultsWithoutGroups.js";
import type { UnorderedAggregationClause } from "../../src/aggregate/AggregationsClause.js";
import type { AggregationsResults } from "../../src/aggregate/AggregationsResults.js";
import type { ArrayFilter } from "../../src/aggregate/ArrayFilter.js";
import type { BooleanFilter } from "../../src/aggregate/BooleanFilter.js";
import type { NumberFilter } from "../../src/aggregate/NumberFilter.js";
import type { PropertyWhereClause } from "../../src/aggregate/WhereClause.js";
import type { GroupByClause, NumericGroupByValue, StringGroupByValue } from "../../src/groupby/GroupByClause.js";
import type { DerivedObjectOrInterfaceDefinition } from "../../src/ontology/ObjectOrInterface.js";
import type { ObjectTypeDefinition, PropertyDef } from "../../src/ontology/ObjectTypeDefinition.js";
import type { SimplePropertyDef } from "../../src/ontology/SimplePropertyDef.js";

interface EmployeeDefinition extends ObjectTypeDefinition {
  readonly type: "object";
  readonly apiName: "Employee";
  readonly __DefinitionMetadata?: {
    readonly type: "object";
    readonly apiName: "Employee";
    readonly displayName: "Employee";
    readonly description: undefined;
    readonly rid: "ri.ontology.main.object.Employee";
    readonly properties: {
      readonly age: PropertyDef<"integer", "non-nullable", "single">;
      readonly active: PropertyDef<"boolean", "non-nullable", "single">;
      readonly createdAt: PropertyDef<"datetime", "nullable", "single">;
      readonly tags: PropertyDef<"string", "non-nullable", "array">;
      readonly city: PropertyDef<"string", "non-nullable", "single">;
    };
    readonly primaryKeyApiName: "age";
    readonly titleProperty: "city";
    readonly links: {};
    readonly primaryKeyType: "integer";
    readonly icon: undefined;
    readonly visibility: undefined;
    readonly pluralDisplayName: "Employees";
    readonly status: undefined;
    readonly interfaceMap: {};
    readonly inverseInterfaceMap: {};
    readonly objectSet?: unknown;
    readonly props?: {
      readonly age: number;
      readonly active: boolean;
      readonly createdAt: string | undefined;
      readonly tags: ReadonlyArray<string>;
      readonly city: string;
    };
    readonly strictProps?: unknown;
    readonly linksType?: unknown;
  };
}

describe("P4 aggregate/query primitives", () => {
  it("maps property types to expected where-clause filters", () => {
    expect<NonNullable<PropertyWhereClause<EmployeeDefinition>["age"]>>().type.toBe<NumberFilter>();
    expect<NonNullable<PropertyWhereClause<EmployeeDefinition>["active"]>>().type.toBe<BooleanFilter>();
    expect<NonNullable<PropertyWhereClause<EmployeeDefinition>["tags"]>>().type.toBeAssignableTo<
      ArrayFilter<unknown>
    >();
  });

  it("includes derived-property filters in where clauses", () => {
    type DerivedProps = {
      readonly score: SimplePropertyDef.Make<"double", "non-nullable", "single">;
    };

    type DerivedDefinition = DerivedObjectOrInterfaceDefinition.WithDerivedProperties<EmployeeDefinition, DerivedProps>;
    expect<NonNullable<PropertyWhereClause<DerivedDefinition>["score"]>>().type.toBe<NumberFilter>();
  });

  it("resolves non-grouped aggregation result types", () => {
    type Result = AggregationResultsWithoutGroups<
      EmployeeDefinition,
      {
        "age:avg": "unordered";
        "createdAt:max": "unordered";
        $count: "unordered";
      }
    >;

    expect<Result>().type.toBe<{
      age: { avg: number };
      createdAt: { max: string | undefined };
      $count: number;
    }>();
  });

  it("resolves grouped aggregation result types", () => {
    type Result = AggregationResultsWithGroups<
      EmployeeDefinition,
      {
        "age:avg": "unordered";
        $count: "unordered";
      },
      {
        age: "exact";
        createdAt: { $exact: { $includeNullValue: true } };
      }
    >;

    expect<Result>().type.toBe<
      Array<{
        $group: {
          age: number;
          createdAt: string | null;
        };
        age: { avg: number };
        $count: number;
      }>
    >();
  });

  it("returns descriptive selector errors for invalid aggregation keys", () => {
    type InvalidOpts = {
      $select: UnorderedAggregationClause<EmployeeDefinition> & {
        "notAProperty:avg": "unordered";
      };
    };

    type Invalid = AggregationsResults<EmployeeDefinition, InvalidOpts>;

    expect<Invalid>().type.toBe<"Sorry, the following are not valid selectors for an aggregation: notAProperty:avg">();
  });

  it("forces unordered selects for multi-group and include-null groupBy clauses", () => {
    type MultipleGroups = AggregateOptsThatErrorsAndDisallowsOrderingWithMultipleGroupBy<
      EmployeeDefinition,
      {
        $select: { "age:avg": "desc" };
        $groupBy: {
          age: "exact";
          city: "exact";
        };
      }
    >;

    type IncludeNull = AggregateOptsThatErrorsAndDisallowsOrderingWithMultipleGroupBy<
      EmployeeDefinition,
      {
        $select: { "createdAt:max": "asc" };
        $groupBy: {
          createdAt: { $exact: { $includeNullValue: true } };
        };
      }
    >;

    expect<MultipleGroups["$select"]>().type.toBe<UnorderedAggregationClause<EmployeeDefinition>>();
    expect<IncludeNull["$select"]>().type.toBe<UnorderedAggregationClause<EmployeeDefinition>>();
  });

  it("maps groupBy values by property type", () => {
    type GroupBy = GroupByClause<EmployeeDefinition>;
    expect<GroupBy["age"]>().type.toBe<NumericGroupByValue | undefined>();
    expect<GroupBy["city"]>().type.toBe<StringGroupByValue | undefined>();
  });
});
