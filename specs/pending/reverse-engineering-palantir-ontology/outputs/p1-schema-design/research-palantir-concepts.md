# Palantir Ontology Concepts Research

## Methodology

This research draws primarily from the local TypeScript source code repositories:
- `osdk-ts` -- the Ontology SDK for TypeScript (OSDK), containing the core type definitions
- `foundry-platform-typescript` -- the Foundry Platform API bindings (wire-level types)
- `defense-sdk-examples` -- real-world usage examples
- `ontology-starter-react-app` -- starter application patterns
- `typescript-compute-module` -- compute module (Functions) framework

Secondary sources include Palantir's public documentation at palantir.com/docs/.

---

## Concept Catalog

### 1. Object Type

#### Definition
An Object Type is the schema definition of a real-world entity or event in the Ontology. It is analogous to a table/dataset definition -- individual Objects are analogous to rows. Examples: Airport, Customer, Transaction, Employee.

#### Properties/Fields (from `ObjectTypeV2` and `ObjectMetadata`)
| Field               | Type                                  | Description                                                                                                    |
|---------------------|---------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `apiName`           | `ObjectTypeApiName` (branded string)  | Programmatic identifier in lowerCamelCase or UpperCamelCase                                                    |
| `displayName`       | `DisplayName` (string)                | Human-readable name                                                                                            |
| `pluralDisplayName` | `string`                              | Plural form of display name (e.g., "Employees")                                                                |
| `description`       | `string?`                             | Optional textual description                                                                                   |
| `rid`               | `ObjectTypeRid` (branded string)      | Unique Resource Identifier (e.g., `ri.ontology.main.object-type.UUID`)                                         |
| `primaryKey`        | `PropertyApiName`                     | API name of the primary key property                                                                           |
| `primaryKeyType`    | `PrimaryKeyTypes`                     | Wire type of the primary key (`string`, `integer`, `long`, `double`, `datetime`, `timestamp`, `short`, `byte`) |
| `titleProperty`     | `PropertyApiName`                     | Which property serves as the display title                                                                     |
| `properties`        | `Record<PropertyApiName, PropertyV2>` | Map of all property definitions                                                                                |
| `status`            | `ReleaseStatus`                       | One of: `ACTIVE`, `EXPERIMENTAL`, `DEPRECATED`, `ENDORSED`                                                     |
| `visibility`        | `ObjectTypeVisibility?`               | One of: `NORMAL`, `PROMINENT`, `HIDDEN`                                                                        |
| `icon`              | `Icon`                                | Blueprint icon with `type: "blueprint"`, `color`, `name`                                                       |

#### Relationships to Other Concepts
- **Properties**: An Object Type owns zero or more Properties (via `properties` record)
- **Link Types**: An Object Type participates in zero or more Link Types (via `ObjectTypeFullMetadata.linkTypes`)
- **Interfaces**: An Object Type implements zero or more Interfaces (via `implementsInterfaces`, `implementsInterfaces2`)
- **Shared Properties**: Maps shared property API names to local property API names (via `sharedPropertyTypeMapping`)
- **Actions**: Actions reference Object Types in their `modifiedEntities` and logic rules (create/modify/delete object)
- **Queries/Functions**: Query parameters can reference Object Types and ObjectSets of specific types

#### OSDK TypeScript Representation
```typescript
// Definition (compile-time type marker)
export interface ObjectTypeDefinition {
  type: "object";
  apiName: string;
  osdkMetadata?: OsdkMetadata;
  __DefinitionMetadata?: ObjectMetadata & ObjectInterfaceCompileDefinition;
}

// Runtime metadata
export interface ObjectMetadata extends ObjectInterfaceBaseMetadata {
  type: "object";
  primaryKeyApiName: keyof this["properties"];
  titleProperty: keyof this["properties"];
  links: Record<string, ObjectMetadata.Link<any, any>>;
  primaryKeyType: PrimaryKeyTypes;
  icon: Icon | undefined;
  visibility: ObjectTypeVisibility | undefined;
  pluralDisplayName: string;
  status: ReleaseStatus | undefined;
  interfaceMap: Record<string, Record<string, string>>;
  inverseInterfaceMap: Record<string, Record<string, string>>;
}
```

The generated code merges interface + namespace + const:
- `interface Employee extends ObjectTypeDefinition { ... }` -- compile-time type
- `namespace Employee { Props, Links, PropertyKeys, ObjectSet, OsdkInstance }` -- helper types
- `const Employee: Employee = { type: "object", apiName: "Employee", ... }` -- runtime value

#### Sub-concepts
- **ObjectTypeFullMetadata**: Bundles an `ObjectTypeV2` with its `linkTypes`, `implementsInterfaces`, `implementsInterfaces2`, and `sharedPropertyTypeMapping`
- **ObjectTypeInterfaceImplementation**: Per-interface property mapping, including both V1 (shared property to local) and V2 (interface property to local) mappings, plus interface link implementations

#### Constraints
- Must have exactly one primary key property
- Primary key type restricted to 8 scalar types (no geospatial, timeseries, etc.)
- RID format: `ri.ontology.main.object-type.<UUID>`

---

### 2. Property

#### Definition
A Property is a typed attribute on an Object Type, analogous to a column in a dataset. Each Property has a data type, nullability, multiplicity (single vs. array), and presentation metadata.

#### Properties/Fields (from `PropertyV2` and `ObjectMetadata.Property`)
| Field              | Type                               | Description                                            |
|--------------------|------------------------------------|--------------------------------------------------------|
| `rid`              | `PropertyTypeRid` (branded string) | Unique Resource Identifier                             |
| `displayName`      | `DisplayName?`                     | Human-readable name                                    |
| `description`      | `string?`                          | Textual description                                    |
| `dataType`         | `ObjectPropertyType`               | Union of all supported wire types                      |
| `status`           | `PropertyTypeStatus?`              | Release status with optional deprecation metadata      |
| `visibility`       | `PropertyTypeVisibility?`          | `NORMAL`, `PROMINENT`, `HIDDEN`                        |
| `valueTypeApiName` | `ValueTypeApiName?`                | Optional reference to a Value Type for semantic typing |
| `valueFormatting`  | `PropertyValueFormattingRule?`     | Display formatting rules                               |
| `typeClasses`      | `Array<TypeClass>`                 | Semantic type class annotations                        |
| `readonly`         | `boolean?`                         | Whether the property is read-only (OSDK metadata)      |
| `nullable`         | `boolean?`                         | Whether the property can be null (OSDK)                |
| `multiplicity`     | `boolean?`                         | `true` = array, `false` = single value (OSDK)          |

#### OSDK Compact Representation (`PropertyDef`)
```typescript
export interface PropertyDef<
  T extends WirePropertyTypes,
  N extends "nullable" | "non-nullable" = "nullable",
  M extends "array" | "single" = "single",
> extends ObjectMetadata.Property {
  type: T;
  multiplicity: M extends "array" ? true : false;
  nullable: N extends "nullable" ? true : false;
}
```

#### Base Wire Types (`BaseWirePropertyTypes`)
| Type                     | TS Runtime Type                        | Description                                        |
|--------------------------|----------------------------------------|----------------------------------------------------|
| `string`                 | `string`                               | Text values                                        |
| `boolean`                | `boolean`                              | True/false                                         |
| `integer`                | `number`                               | 32-bit signed integer                              |
| `long`                   | `string`                               | 64-bit integer (string to avoid JS precision loss) |
| `short`                  | `number`                               | 16-bit signed integer                              |
| `byte`                   | `number`                               | 8-bit signed integer                               |
| `float`                  | `number`                               | 32-bit floating point                              |
| `double`                 | `number`                               | 64-bit floating point                              |
| `decimal`                | `string`                               | Arbitrary precision decimal                        |
| `datetime`               | `string`                               | ISO 8601 date (date only, no time)                 |
| `timestamp`              | `string`                               | ISO 8601 timestamp (date + time)                   |
| `geopoint`               | `GeoJSON.Point`                        | Geographic point                                   |
| `geoshape`               | `GeoJSON.GeoJSON`                      | Geographic shape (polygon, line, etc.)             |
| `attachment`             | `Attachment`                           | File attachment                                    |
| `marking`                | `string`                               | Security marking identifier                        |
| `mediaReference`         | `Media`                                | Reference to media in a media set                  |
| `numericTimeseries`      | `TimeSeriesProperty<number>`           | Numeric time series                                |
| `stringTimeseries`       | `TimeSeriesProperty<string>`           | String time series                                 |
| `sensorTimeseries`       | `TimeSeriesProperty<string \| number>` | Sensor time series (mixed)                         |
| `geotimeSeriesReference` | `GeotimeSeriesProperty<Point>`         | Geotime series reference                           |
| `vector`                 | `number[]`                             | Embedding vector for semantic search               |

Additional wire-level types not in OSDK (from `ObjectPropertyType`):
- `cipherText` -- encrypted string values
- `struct` -- nested object with `structFieldTypes`
- `array` -- array wrapper around any other type

#### Relationships to Other Concepts
- **Object Type**: A Property belongs to exactly one Object Type
- **Shared Property**: A Property can be the local implementation of a Shared Property
- **Interface**: Interface properties are mapped to local Object Type properties
- **Value Type**: A Property can reference a Value Type for semantic constraints
- **Action**: Action parameters can reference property types; Actions can modify property values
- **Property Security**: Each property instance can carry security markings (conjunctive/disjunctive)

#### Sub-concepts
- **PropertyDef<T, N, M>**: Compile-time property definition with type, nullability, and multiplicity
- **SimplePropertyDef**: Union type for simple property representation (`WirePropertyTypes | undefined | Array<WirePropertyTypes>`)
- **PropertyValueFormattingRule**: Formatting for display (number formatting, boolean labels, date/timestamp formatting, known type formatting)
- **PropertySecurity**: Security markings on property values (`propertyMarkings`, `unsupportedPolicy`, `errorComputingSecurity`)

#### Constraints
- Arrays cannot contain `vector` or `timeseries` types
- `map`, `decimal`, and `binary` are not valid base property types
- Primary key properties must be non-nullable and one of the 8 primary key types
- Struct properties have their own nested field type definitions

---

### 3. Shared Property Type

#### Definition
A Shared Property Type is a reusable property definition that can be implemented across multiple Object Types and referenced by Interfaces. It provides a consistent schema for properties that semantically represent the same thing across different entity types.

#### Properties/Fields (from `SharedPropertyType`)
| Field              | Type                                         | Description                     |
|--------------------|----------------------------------------------|---------------------------------|
| `rid`              | `SharedPropertyTypeRid` (branded string)     | Unique Resource Identifier      |
| `apiName`          | `SharedPropertyTypeApiName` (branded string) | API name in lowerCamelCase      |
| `displayName`      | `DisplayName`                                | Human-readable name             |
| `description`      | `string?`                                    | Textual description             |
| `dataType`         | `ObjectPropertyType`                         | The wire data type              |
| `valueTypeApiName` | `ValueTypeApiName?`                          | Optional Value Type reference   |
| `valueFormatting`  | `PropertyValueFormattingRule?`               | Display formatting              |
| `typeClasses`      | `Array<TypeClass>`                           | Semantic type class annotations |

#### Relationships to Other Concepts
- **Object Type**: A Shared Property is mapped to local properties on each implementing Object Type via `sharedPropertyTypeMapping`
- **Interface**: Interfaces reference Shared Properties in their `properties` record (as `InterfaceSharedPropertyType`)
- **Ontology**: Listed in `OntologyFullMetadata.sharedPropertyTypes` record

#### OSDK TypeScript Representation
Shared Properties appear in the `OntologyFullMetadata.sharedPropertyTypes` record, keyed by `SharedPropertyTypeApiName`. They are used during code generation to create the interface-to-object-type property mappings (`interfaceMap` / `inverseInterfaceMap`).

#### Constraints
- The `SharedPropertyTypeApiName` must be in lowerCamelCase
- The data type of the shared property constrains which local properties can implement it (types must be compatible)

---

### 4. Link Type

#### Definition
A Link Type is the schema definition of a typed, directed relationship between two Object Types. It defines how entities relate to each other (e.g., an Employee "manages" other Employees, a Flight "departs from" an Airport). Links have a cardinality of ONE or MANY on each side.

#### Properties/Fields (from `LinkTypeSideV2`)
| Field                       | Type                               | Description                                         |
|-----------------------------|------------------------------------|-----------------------------------------------------|
| `apiName`                   | `LinkTypeApiName` (branded string) | API name for this direction of the link             |
| `displayName`               | `DisplayName`                      | Human-readable name                                 |
| `status`                    | `ReleaseStatus`                    | `ACTIVE`, `EXPERIMENTAL`, `DEPRECATED`              |
| `objectTypeApiName`         | `ObjectTypeApiName`                | The **target** Object Type on this side             |
| `cardinality`               | `LinkTypeSideCardinality`          | `ONE` or `MANY`                                     |
| `foreignKeyPropertyApiName` | `PropertyApiName?`                 | For one-to-many: the FK property on the "many" side |
| `linkTypeRid`               | `LinkTypeRid` (branded string)     | Unique Resource Identifier                          |

#### Link Type Definitions (from OntologyIR)
The underlying IR reveals two fundamental link definition types:
- **oneToMany**: Has `objectTypeRidOneSide`, `objectTypeRidManySide`, `oneSidePrimaryKeyToManySidePropertyMapping` (FK relationship), separate metadata for each direction (`oneToManyLinkMetadata`, `manyToOneLinkMetadata`)
- **manyToMany**: Has `objectTypeRidA`, `objectTypeRidB`, separate metadata for each direction (`objectTypeAToBLinkMetadata`, `objectTypeBToALinkMetadata`)

#### OSDK TypeScript Representation
```typescript
// In ObjectMetadata
links: Record<string, ObjectMetadata.Link<TargetType, Multiplicity>>;

// Link metadata
export namespace ObjectMetadata {
  export interface Link<Q extends ObjectTypeDefinition, M extends boolean> {
    __OsdkLinkTargetType?: Q;
    targetType: Q["apiName"];
    multiplicity: M;  // false = single, true = many
  }
}
```

At the client level, links become:
- **Single links** (`multiplicity: false`): `SingleLinkAccessor<T>` with `fetchOne()` and `fetchOneWithErrors()`
- **Many links** (`multiplicity: true`): `ObjectSet<T>` for traversal, filtering, and aggregation

#### Relationships to Other Concepts
- **Object Type**: Links connect exactly two Object Types (possibly the same type for self-referential links)
- **Interface**: Interface Links (`InterfaceLinkType`) define abstract link contracts with cardinality and required-ness
- **Action**: Actions can create or delete links (`createLink`, `deleteLink` logic rules)
- **ObjectSet**: `pivotTo()` traverses links to create new ObjectSets

#### Sub-concepts
- **InterfaceLinkType**: Abstract link definition on an Interface, with `linkedEntityApiName` (target interface or object type), `cardinality` (`ONE` | `MANY`), and `required` flag
- **LinkReference**: In action results, references a link instance with `linkTypeApiNameAtoB`, `linkTypeApiNameBtoA`, `aSideObject`, `bSideObject`
- **DirectedObjectLinkInstance**: In bulk link operations, represents a directed edge with source and target primary keys

#### Constraints
- Each link type has exactly two sides (A and B), each with its own API name
- For one-to-many links, the FK property must exist on the "many" side object type
- Link cardinality is always binary: ONE or MANY (no "zero or one" vs "exactly one" distinction at the type level; `required` on interface links provides this)
- Link API names are directional -- `aSideToB` and `bSideToA` may have different names

---

### 5. Action Type

#### Definition
An Action Type is the schema definition of a set of mutations (edits) to objects, property values, and links that a user can execute atomically. Actions capture operator decisions and orchestrate changes, with validation, authorization, and side effects.

#### Properties/Fields (from `ActionTypeV2` and `ActionMetadata`)
| Field             | Type                                     | Description                                  |
|-------------------|------------------------------------------|----------------------------------------------|
| `apiName`         | `ActionTypeApiName` (branded string)     | Programmatic identifier                      |
| `displayName`     | `DisplayName?`                           | Human-readable name                          |
| `description`     | `string?`                                | Textual description                          |
| `toolDescription` | `string?`                                | Description for AI/LLM tool usage            |
| `rid`             | `ActionTypeRid` (branded string)         | Unique Resource Identifier                   |
| `status`          | `ReleaseStatus`                          | `ACTIVE`, `EXPERIMENTAL`, `DEPRECATED`       |
| `parameters`      | `Record<ParameterId, ActionParameterV2>` | Input parameter definitions                  |
| `operations`      | `Array<LogicRule>`                       | The mutation operations this action performs |

#### Action Parameters (from `ActionParameterV2`)
| Field         | Type                  | Description                            |
|---------------|-----------------------|----------------------------------------|
| `displayName` | `DisplayName`         | Human-readable name                    |
| `description` | `string?`             | Textual description                    |
| `dataType`    | `ActionParameterType` | Union of all supported parameter types |
| `required`    | `boolean`             | Whether the parameter is mandatory     |
| `typeClasses` | `Array<TypeClass>`    | Semantic type class annotations        |

**ActionParameterType** is a union of:
- Primitive types: `string`, `boolean`, `integer`, `long`, `double`, `date`, `timestamp`, `attachment`, `marking`, `mediaReference`, `geoshape`, `geohash`, `objectType`, `vector`
- Complex types: `object` (reference to an Object Type), `objectSet`, `interfaceObject`, `struct`, `array` (wrapping any subtype)

#### Logic Rules (from `LogicRule`)
| Rule Type               | Description                              |
|-------------------------|------------------------------------------|
| `createObject`          | Creates a new object of a specified type |
| `modifyObject`          | Modifies an existing object              |
| `deleteObject`          | Deletes an existing object               |
| `createLink`            | Creates a link between two objects       |
| `deleteLink`            | Deletes an existing link                 |
| `createInterfaceObject` | Creates an object via an interface       |
| `modifyInterfaceObject` | Modifies an object via an interface      |
| `deleteInterfaceObject` | Deletes an object via an interface       |

#### Full Logic Rules (from `ActionLogicRule` -- more detailed)
Adds: `createOrModifyObject`, `createOrModifyObjectV2`, `batchedFunction`, `function`, `createInterface`, `modifyInterface`, `createInterfaceLink`, `deleteInterfaceLink`

#### OSDK TypeScript Representation
```typescript
export interface ActionDefinition<T_signatures = never> {
  type: "action";
  apiName: string;
  osdkMetadata?: OsdkMetadata;
  __DefinitionMetadata?: ActionCompileTimeMetadata<T_signatures> & ActionMetadata;
}

// Generated action has:
// - ParamsDefinition: compile-time param metadata
// - Params: runtime param types
// - Signatures: applyAction() and batchApplyAction() methods
```

#### Modified Entities Tracking
```typescript
modifiedEntities?: Partial<Record<string, {
  created: boolean;
  modified: boolean;
}>>;
```
Tracks which Object Types the action creates and/or modifies.

#### Validation Response
```typescript
interface ValidateActionResponseV2 {
  result: "VALID" | "INVALID";
  submissionCriteria: Array<{ configuredFailureMessage?: string; result: "VALID" | "INVALID" }>;
  parameters: Record<string, {
    result: "VALID" | "INVALID";
    evaluatedConstraints: Array<ParameterEvaluatedConstraint>;
    required: boolean;
  }>;
}
```

Parameter constraints include: `arraySize`, `groupMember`, `objectPropertyValue`, `objectQueryResult`, `oneOf`, `range`, `stringLength`, `stringRegexMatch`, `unevaluable`.

#### Relationships to Other Concepts
- **Object Type**: Actions create/modify/delete objects; parameters can reference Object Types
- **Link Type**: Actions can create/delete links
- **Interface**: Actions can operate through interfaces (create/modify/delete interface objects)
- **Properties**: Actions modify property values
- **Functions**: Function-backed actions use Functions for complex logic
- **Roles**: Actions are scoped by permissions (submission criteria)

#### Sub-concepts
- **ActionMode**: `RUN` (execute), `VALIDATE` (dry run), `ASYNC` (background)
- **ActionResults**: `ObjectEdits` (detailed) or `LargeScaleObjectEdits` (summary only)
- **Side Effects**: Notifications, webhooks, media uploads, attachment handling

#### Constraints
- Parameters can be required or optional
- Null values differ from undefined: null clears prefills and property values; undefined leaves them unchanged
- Validation runs submission criteria and parameter constraints
- Actions execute atomically -- all logic rules succeed or all fail

---

### 6. Roles

#### Definition
Roles are the central permissioning mechanism in the Ontology, granting access to ontological resources at both the ontology level and individual resource level. Roles determine who can read, write, execute, or administer specific Object Types, Actions, Queries, and other Ontology elements.

#### Properties/Fields
Roles are not directly represented in the OSDK TypeScript types -- they are a platform-level concept managed through the Foundry UI (Ontology Manager) and enforced server-side. The SDK surfaces roles indirectly through:
- **Required Scopes**: API endpoints declare scopes like `api:ontologies-read`
- **Submission Criteria**: Actions define who can submit them
- **Property Security**: Properties carry marking-based access controls

#### Relationships to Other Concepts
- **Object Type**: Read/write permissions per Object Type
- **Action Type**: Submission criteria control who can execute actions
- **Properties**: Property-level security with marking requirements
- **Functions/Queries**: Execution permissions
- **Interface**: Access control through implementing types

#### Sub-concepts
- **OAuth Scopes**: `api:ontologies-read`, etc.
- **Markings**: Security classification labels (conjunctive and disjunctive)
- **PropertySecurity**: Per-property marking requirements
  - `propertyMarkings`: Contains `conjunctive`, `disjunctive`, `containerConjunctive`, `containerDisjunctive` marking sets
  - `unsupportedPolicy`: Property backed by restricted view
  - `errorComputingSecurity`: Server could not compute

#### Constraints
- Markings use conjunction (ALL must be satisfied) and disjunction (ANY can satisfy a set)
- Container markings (from dataset/project) may differ from property markings but both must be satisfied

---

### 7. Functions (Queries)

#### Definition
Functions (exposed as "Queries" in the API) are the computation layer over the Ontology. They accept typed parameters (primitives, objects, object sets, structs, unions, aggregations) and return typed outputs. Functions are authored in TypeScript or Python, published with version numbers, and can be called from applications, actions, and other functions.

#### Properties/Fields (from `QueryTypeV2` and `QueryMetadata`)
| Field         | Type                                    | Description                 |
|---------------|-----------------------------------------|-----------------------------|
| `apiName`     | `QueryApiName` (branded string)         | Programmatic identifier     |
| `displayName` | `DisplayName?`                          | Human-readable name         |
| `description` | `string?`                               | Textual description         |
| `rid`         | `FunctionRid` (branded string)          | Unique Resource Identifier  |
| `version`     | `FunctionVersion` (string)              | Semver-style version        |
| `parameters`  | `Record<ParameterId, QueryParameterV2>` | Input parameter definitions |
| `output`      | `QueryDataType`                         | Return type definition      |

#### Query Data Types (from `QueryDataTypeDefinition`)
| Type                          | Description                                                                                  |
|-------------------------------|----------------------------------------------------------------------------------------------|
| Primitives                    | `double`, `float`, `integer`, `long`, `boolean`, `string`, `date`, `timestamp`, `attachment` |
| `object`                      | Reference to a specific Object Type                                                          |
| `interface`                   | Reference to an Interface Type                                                               |
| `objectSet`                   | Set of objects of a specific type                                                            |
| `interfaceObjectSet`          | Set of objects implementing an interface                                                     |
| `set`                         | Set of values                                                                                |
| `array`                       | Ordered collection                                                                           |
| `union`                       | Discriminated union of types                                                                 |
| `struct`                      | Named record of typed fields                                                                 |
| `map`                         | Key-value pairs                                                                              |
| `twoDimensionalAggregation`   | Key-value aggregation (e.g., group by X, aggregate Y)                                        |
| `threeDimensionalAggregation` | Nested aggregation (group by X, then Y, aggregate Z)                                         |

#### OSDK TypeScript Representation
```typescript
export interface QueryDefinition<T = any> {
  type: "query";
  apiName: string;
  version?: string;
  isFixedVersion?: boolean;
  osdkMetadata?: OsdkMetadata;
  __DefinitionMetadata?: QueryCompileTimeMetadata<T> & QueryMetadata;
}

// Generated query has:
// - Signature: callable function type
// - Parameters: typed input interface
// - ReturnType: typed output
```

#### Relationships to Other Concepts
- **Object Type**: Parameters and outputs can reference Object Types
- **Interface**: Parameters and outputs can reference Interfaces
- **ObjectSet**: Parameters can accept ObjectSets; outputs can return them
- **Action Type**: Function-backed actions delegate to Functions
- **Ontology**: Listed in `OntologyFullMetadata.queryTypes`

#### Sub-concepts
- **AggregationKeyDataType**: For aggregation return types, with `keyType` and `valueType`
- **RangeAggregationKeyDataType**: Aggregation keys with `keySubtype` for range buckets
- **Compute Modules**: TypeScript/Python runtime environment for authoring Functions

#### Constraints
- Functions are versioned; queries can be pinned to a fixed version or float to latest
- Query parameters support nullable flag
- Struct parameters define their field schemas inline

---

### 8. Interfaces

#### Definition
An Interface is an abstract Ontology type that describes the shape and capabilities of an Object Type. Interfaces enable polymorphism -- multiple Object Types can implement the same Interface, allowing applications to interact with diverse types through a common contract. Interfaces can extend other interfaces (inheritance hierarchy).

#### Properties/Fields (from `InterfaceType`)
| Field                      | Type                                                              | Description                                 |
|----------------------------|-------------------------------------------------------------------|---------------------------------------------|
| `rid`                      | `InterfaceTypeRid` (branded string)                               | Unique Resource Identifier                  |
| `apiName`                  | `InterfaceTypeApiName` (branded string)                           | API name in UpperCamelCase                  |
| `displayName`              | `DisplayName`                                                     | Human-readable name                         |
| `description`              | `string?`                                                         | Textual description                         |
| `properties`               | `Record<SharedPropertyTypeApiName, InterfaceSharedPropertyType>`  | V1: Shared property definitions (legacy)    |
| `allProperties`            | `Record<SharedPropertyTypeApiName, InterfaceSharedPropertyType>`  | V1: Including inherited properties          |
| `propertiesV2`             | `Record<InterfacePropertyApiName, InterfacePropertyType>`         | V2: Interface-scoped property definitions   |
| `allPropertiesV2`          | `Record<InterfacePropertyApiName, ResolvedInterfacePropertyType>` | V2: Including inherited, fully resolved     |
| `extendsInterfaces`        | `Array<InterfaceTypeApiName>`                                     | Direct parent interfaces                    |
| `allExtendsInterfaces`     | `Array<InterfaceTypeApiName>`                                     | All ancestor interfaces (transitive)        |
| `implementedByObjectTypes` | `Array<ObjectTypeApiName>`                                        | Which Object Types implement this interface |
| `links`                    | `Record<InterfaceLinkTypeApiName, InterfaceLinkType>`             | Direct link type definitions                |
| `allLinks`                 | `Record<InterfaceLinkTypeApiName, InterfaceLinkType>`             | All links including inherited               |

#### InterfaceSharedPropertyType (V1)
| Field              | Type                           | Description                                            |
|--------------------|--------------------------------|--------------------------------------------------------|
| `rid`              | `SharedPropertyTypeRid`        | Shared property RID                                    |
| `apiName`          | `SharedPropertyTypeApiName`    | Shared property API name                               |
| `displayName`      | `DisplayName`                  | Human-readable name                                    |
| `description`      | `string?`                      | Description                                            |
| `dataType`         | `ObjectPropertyType`           | Wire data type                                         |
| `required`         | `boolean`                      | Whether the property is required on implementing types |
| `valueTypeApiName` | `ValueTypeApiName?`            | Optional Value Type                                    |
| `valueFormatting`  | `PropertyValueFormattingRule?` | Formatting rules                                       |
| `typeClasses`      | `Array<TypeClass>`             | Semantic annotations                                   |

#### OSDK TypeScript Representation
```typescript
export interface InterfaceDefinition {
  type: "interface";
  apiName: string;
  osdkMetadata?: OsdkMetadata;
  __DefinitionMetadata?: InterfaceMetadata & ObjectInterfaceCompileDefinition;
}

export interface InterfaceMetadata extends ObjectInterfaceBaseMetadata {
  type: "interface";
  implementedBy?: ReadonlyArray<string>;
  links: Record<string, InterfaceMetadata.Link<any, any>>;
}
```

Generated interfaces include `ObjectSet`, `Props`, `PropertyKeys`, and `OsdkInstance` just like Object Types, but with `type: "interface"`.

#### Relationships to Other Concepts
- **Object Type**: Object Types implement Interfaces via `interfaceMap`/`inverseInterfaceMap`
- **Shared Property**: Interfaces define their properties using Shared Property Types
- **Link Type**: Interfaces can define InterfaceLinkTypes that implementing types must provide
- **Action Type**: Actions can create/modify/delete objects through Interfaces
- **Functions**: Query parameters can reference Interfaces and InterfaceObjectSets
- **Other Interfaces**: Interfaces can extend (inherit from) other interfaces

#### Sub-concepts
- **InterfaceLinkType**: Link constraints on interfaces (`rid`, `apiName`, `displayName`, `description`, `linkedEntityApiName`, `cardinality`, `required`)
- **InterfaceToObjectTypeMapping**: Maps shared property API names to local property API names for each implementing type
- **Narrowing**: `narrowToType()` on ObjectSets casts interface-typed sets to specific implementing types

#### Constraints
- Property mappings must be type-compatible (shared property type must match local property type)
- `implementedBy` list tracks all implementing Object Types
- Interface link targets are currently limited to other Interfaces in the OntologyIR (not direct Object Type targets)

---

### 9. Object Views

#### Definition
Object Views are presentation-layer and security-scoped projections of Objects. They define how object data is displayed to users, including which properties are shown, how they are formatted, and what related information (linked objects, metrics, analyses) is presented.

#### Properties/Fields
Object Views are not directly represented in the OSDK TypeScript types or the Foundry Platform API bindings. They are a UI-layer concept managed in the Foundry Ontology Manager. Based on documentation:

| Aspect                | Description                                            |
|-----------------------|--------------------------------------------------------|
| **Core View**         | Read-only display of object properties and linked data |
| **Full Custom View**  | Fully customizable HTML/JS view                        |
| **Panel Object View** | Slide-out panel for quick object inspection            |

#### Relationships to Other Concepts
- **Object Type**: An Object View is associated with one or more Object Types
- **Properties**: Object Views select and format specific properties for display
- **Link Types**: Object Views can display linked objects
- **Roles**: Object Views may be scoped by user roles/permissions

#### OSDK TypeScript Representation
Not directly represented in the SDK types. Object Views are a Foundry UI concept, not an API concept.

---

## Additional Discovered Concepts

### 10. ObjectSet

**Definition**: An ObjectSet is a collection/query over Objects of a specific type (or implementing a specific Interface). It is the primary query mechanism in the Ontology.

**Key Operations**:
- `fetchPage()` / `fetchOne()`: Load objects with property selection
- `where()`: Filter with typed predicate clauses
- `aggregate()`: Run aggregations with group-by
- `union()` / `intersect()` / `subtract()`: Set arithmetic
- `pivotTo()`: Traverse links to related ObjectSets
- `narrowToType()`: Cast interface ObjectSets to specific types
- `nearestNeighbors()`: Semantic/vector similarity search
- `subscribe()`: Real-time subscription to changes
- `withProperties()`: Add derived (computed) properties
- `asyncIter()`: Streaming iteration
- `experimental_asyncIterLinks()`: Batch link loading

### 11. Ontology (Top-Level Container)

**Definition**: The Ontology itself is a top-level container with metadata:
```typescript
export interface OntologyV2 {
  apiName: OntologyApiName;
  displayName: DisplayName;
  description: string;
  rid: OntologyRid;
}
```

**Full Metadata Bundle** (`OntologyFullMetadata`):
```typescript
{
  ontology: OntologyV2;
  objectTypes: Record<ObjectTypeApiName, ObjectTypeFullMetadata>;
  actionTypes: Record<ActionTypeApiName, ActionTypeV2>;
  queryTypes: Record<VersionedQueryTypeApiName, QueryTypeV2>;
  interfaceTypes: Record<InterfaceTypeApiName, InterfaceType>;
  sharedPropertyTypes: Record<SharedPropertyTypeApiName, SharedPropertyType>;
  valueTypes: Record<ValueTypeApiName, OntologyValueType>;
  branch?: BranchMetadata;
}
```

### 12. Value Types

**Definition**: Semantic wrappers around field types that add metadata and constraints. Examples: email addresses, URLs, UUIDs, enumerations.

```typescript
export interface OntologyValueType {
  apiName: ValueTypeApiName;
  displayName: DisplayName;
  description?: string;
  rid: ValueTypeRid;
  status?: ValueTypeStatus;
  fieldType: ValueTypeFieldType;  // date, struct, string, byte, double, optional, integer, union, float, long, reference, boolean, array, binary, short
  version: string;
  constraints: Array<ValueTypeConstraint>;
}
```

### 13. Structs

**Definition**: Composite data types with multiple named, typed fields. Used in properties and action/query parameters.

From `StructType` in the Foundry API:
- Contains `structFieldTypes: Array<{ apiName, rid, dataType, displayName?, description? }>`
- Nested field types use the same `ObjectPropertyType` union

### 14. TypeClass

**Definition**: Semantic annotation on properties and parameters:
```typescript
export interface TypeClass {
  kind: string;
  name: string;
}
```

### 15. Derived Properties

**Definition**: Computed properties added to ObjectSets at query time (not stored on the Object Type). Created via `withProperties()` on ObjectSets:
- Absolute value, arithmetic, traversal-based derivations
- Defined using `DerivedProperty.Creator` functions

### 16. Ontology Transactions / Edit History

**Definition**: The system tracks all edits to objects over time:
- `ObjectEditHistoryEntry`: Individual edit records
- `EditsHistoryFilters`: Filter by time range, action type, user
- `EditsHistorySortOrder`: Chronological ordering
- Objects track creation, modification, and deletion events

### 17. AIP Agents

**Definition**: AI-powered agents that interact with the Ontology. The Foundry Platform API includes:
- `Agent` / `AgentVersion`: Agent definitions and versioning
- `Content`: Structured content types
- `Session` / `SessionTrace`: Conversation sessions with agents
- Actions have `toolDescription` field specifically for LLM tool-calling

### 18. Compute Modules

**Definition**: The runtime environment for authoring Functions (TypeScript or Python). The `typescript-compute-module` package provides:
- `ComputeModule` class for defining compute logic
- `QueryRunner` for executing queries
- Resource and service abstractions for Foundry platform integration

### 19. Branching

**Definition**: Ontology supports branching (similar to git branches):
- Most API endpoints accept an optional `branch` parameter
- `BranchMetadata` is part of `OntologyFullMetadata`
- Enables parallel development and review workflows

---

## Concept Relationship Map

```
                         +-----------+
                         | Ontology  |
                         +-----+-----+
                               |
           +-------------------+-------------------+
           |         |         |         |         |
    +------v---+ +---v----+ +-v------+ +v-------+ +v-----------+
    |ObjectType| |Action  | |Query/  | |Interface| |SharedProp  |
    |          | |Type    | |Function| |         | |Type        |
    +----+-----+ +---+----+ +---+----+ +----+----+ +-----+-----+
         |            |          |           |             |
    +----v-----+      |          |      +----v----+        |
    | Property |<-----+----------+----->|InterfSPT|<-------+
    +----+-----+      |          |      +---------+
         |            |          |           |
    +----v-----+  +---v----+    |      +----v--------+
    |LinkType  |  |LogicRule|   |      |InterfLink   |
    |(connects |  |(create/ |   |      |Type         |
    | ObjTypes)|  | modify/ |   |      +-----------  +
    +----------+  | delete) |   |
                  +----------+  |
                                |
                         +------v-------+
                         | ObjectSet    |
                         | (query/      |
                         |  traverse/   |
                         |  aggregate)  |
                         +--------------+
```

### Key Relationships Summary

| From       | To                                                                              | Relationship                                                |
|------------|---------------------------------------------------------------------------------|-------------------------------------------------------------|
| Ontology   | ObjectType, ActionType, QueryType, InterfaceType, SharedPropertyType, ValueType | Contains                                                    |
| ObjectType | Property                                                                        | Owns (1:N)                                                  |
| ObjectType | LinkType                                                                        | Participates in (N:M, via ObjectTypeFullMetadata.linkTypes) |
| ObjectType | Interface                                                                       | Implements (N:M, via implementsInterfaces2)                 |
| ObjectType | SharedPropertyType                                                              | Maps to local properties (via sharedPropertyTypeMapping)    |
| Interface  | SharedPropertyType                                                              | References (via properties record)                          |
| Interface  | Interface                                                                       | Extends (inheritance hierarchy)                             |
| Interface  | InterfaceLinkType                                                               | Defines (1:N)                                               |
| Interface  | ObjectType                                                                      | Implemented by (1:N, via implementedByObjectTypes)          |
| ActionType | ObjectType                                                                      | References (via parameters and modifiedEntities)            |
| ActionType | LogicRule                                                                       | Contains (1:N operations)                                   |
| ActionType | LinkType                                                                        | Can create/delete links                                     |
| QueryType  | ObjectType                                                                      | Parameters/output can reference                             |
| QueryType  | Interface                                                                       | Parameters/output can reference                             |
| Property   | ValueType                                                                       | Optionally references                                       |
| Property   | PropertySecurity                                                                | Carries security markings                                   |
| LinkType   | ObjectType                                                                      | Connects two Object Types (bidirectional)                   |

---

## OSDK Type System Analysis

### Architecture Layers

The OSDK uses a three-layer type architecture:

1. **Wire Types** (`foundry-platform-typescript`): Raw API types matching the HTTP wire format. These are auto-generated from Palantir's internal API specs. Key file: `_components.ts` with ~6000+ lines of type definitions.

2. **SDK Definition Types** (`@osdk/client` / `packages/api`): Hand-crafted TypeScript types that provide compile-time safety. Key interfaces: `ObjectTypeDefinition`, `InterfaceDefinition`, `ActionDefinition`, `QueryDefinition`.

3. **Generated Types** (from `foundry-sdk-generator`): Per-ontology generated code that instantiates the SDK types with concrete schemas. Each Object Type, Action, Query, and Interface gets its own `.ts` file.

### The `__DefinitionMetadata` Pattern

Every definition type uses a phantom type field `__DefinitionMetadata?` to carry compile-time information without runtime cost:
```typescript
interface Employee extends ObjectTypeDefinition {
  __DefinitionMetadata?: {
    // All compile-time type info lives here
    properties: { ... };
    links: { ... };
    props: Employee.Props;  // Runtime-typed property values
    // ...
  };
}
```

This pattern enables:
- `CompileTimeMetadata<T>` extracts metadata via `NonNullable<T["__DefinitionMetadata"]>`
- `PropertyKeys<T>` extracts property names
- `Osdk.Instance<T>` constructs the runtime object shape
- Full type inference for `$link`, `$as`, `$clone`, `where`, `aggregate`, etc.

### Key Design Patterns

1. **Dual Interface+Namespace+Const**: Generated types use TypeScript declaration merging:
   ```typescript
   // Type-level (compile-time schema)
   export interface Employee extends ObjectTypeDefinition { ... }
   // Namespace (helper types)
   export namespace Employee { type PropertyKeys = ...; interface Props { ... } }
   // Value-level (runtime marker)
   export const Employee: Employee = { type: "object", apiName: "Employee", ... };
   ```

2. **Branded Strings**: All API names and RIDs use `LooselyBrandedString<T>` for nominal typing:
   ```typescript
   export type ObjectTypeApiName = LooselyBrandedString<"ObjectTypeApiName">;
   ```

3. **Property Mapping Chain**: `WirePropertyTypes` -> `PropertyValueWireToClient` -> runtime TS types. The chain handles:
   - `long` -> `string` (precision preservation)
   - `attachment` -> `Attachment` (rich object)
   - `geopoint` -> `GeoJSON.Point` (GeoJSON standard)
   - `vector` -> `number[]` (embedding arrays)

4. **ObjectSet Fluent API**: ObjectSets compose via method chaining:
   ```
   client(Employee)          // ObjectSet<Employee>
     .where({ ... })         // filtered ObjectSet
     .pivotTo("ventures")    // ObjectSet<Venture>
     .aggregate({ ... })     // AggregationsResults
   ```

5. **Interface-to-Object Mapping**: The `interfaceMap` / `inverseInterfaceMap` system enables bidirectional property name translation between interfaces and implementing types, powering `$as()` type conversions.

### OntologyIR (Intermediate Representation)

The generator uses an IR format (`OntologyIrOntologyBlockDataV2`) that contains:
- `objectTypes`: Object type block data with property types, display metadata, primary keys, status, implements-interfaces
- `linkTypes`: Link type block data with definition (oneToMany or manyToMany), metadata per direction
- `actionTypes`: Action type block data with parameters, logic rules, validation
- `interfaceTypes`: Interface type block data with properties, extends, links
- `sharedPropertyTypes`: Shared property type block data

The `OntologyIrToFullMetadataConverter` converts this IR into the `OntologyFullMetadata` format consumed by the code generator.

---

## Key Findings

### 1. Nine-Concept Model Confirmed with Extensions
The 9 core concepts (Object Type, Property, Shared Property, Link Type, Action Type, Roles, Functions, Interfaces, Object Views) are all present. Additionally, the code reveals several important supporting concepts: ObjectSet (query model), Value Types (semantic typing), Structs (composite types), TypeClass (semantic annotations), Derived Properties (computed fields), and Branching (parallel development).

### 2. ObjectSet is the Query Backbone
ObjectSets are the central query mechanism. They are not just simple collections but a rich fluent API supporting filtering, aggregation, set arithmetic, link traversal, semantic search, subscriptions, and derived properties. ObjectSets operate on both Object Types and Interface Types.

### 3. Interface System is Mature
Interfaces support full polymorphism with inheritance (`extendsInterfaces`), property mapping (`sharedPropertyTypeMapping`), link constraints (`InterfaceLinkType`), and bidirectional type conversion (`$as`). They are first-class citizens in the type system.

### 4. Action Types are Transactional
Actions are atomic operations with rich validation, parameterization, and tracking. They support both simple CRUD and complex function-backed logic. The `modifiedEntities` tracking enables change propagation and audit.

### 5. Security is Pervasive
Property-level security uses a marking system with conjunctive and disjunctive requirements, including container-level markings. This creates a multi-layered access control system that goes beyond simple role-based access.

### 6. Value Types Add Semantic Layer
Value Types provide reusable semantic constraints (like "email address" or "UUID") on top of base property types, enabling cross-platform validation and display formatting.

### 7. Type Generation is the Primary SDK Pattern
The OSDK does not use runtime introspection. Instead, a code generator produces strongly-typed TypeScript files for each Ontology element. This means the full ontology schema is captured in the generated code at build time.

### 8. Branching Enables Ontology Evolution
The Ontology supports branches similar to git, enabling parallel development of schema changes with review workflows. Most API endpoints accept a branch parameter.

### 9. AI/LLM Integration is First-Class
Actions include a `toolDescription` field specifically for LLM tool-calling, and the platform includes an AIP Agents API with session management. The Ontology is designed to be consumed by AI agents.

### 10. RID System is Universal
Every entity in the system has a Resource Identifier (RID) following the pattern `ri.<service>.<instance>.<type>.<uuid>`. RIDs are used for internal references and cross-service linking.
