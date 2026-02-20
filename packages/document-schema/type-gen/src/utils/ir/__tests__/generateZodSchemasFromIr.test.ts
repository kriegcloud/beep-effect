/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from "path";
import { describe, expect, it } from "vitest";
import type {
  IFieldDef,
  IModelDef,
  IRealTimeDocumentSchema,
  IRecordDef,
  IUnionDef,
} from "../../../lib/pack-docschema-api/pack-docschema-ir/index.js";
import { generateZodSchemasFromIr } from "../generateZodSchemasFromIr.js";
import { formatWithPrettier } from "./formatWithPrettier.js";

describe("generateZodSchemasFromIr", () => {
  const snapshotDir = path.join(__dirname, "__snapshots__", "generateZodSchemasFromIr");
  it("should generate Zod schemas for simple record types", async () => {
    const personField1: IFieldDef = {
      key: "name",
      name: "Name",
      description: "Person name",
      value: {
        type: "value",
        value: {
          type: "string",
          string: { minLength: 2, maxLength: 50 },
        },
      },
      meta: { addedIn: 1 },
    };

    const personField2: IFieldDef = {
      key: "age",
      name: "Age",
      description: "Person age",
      value: {
        type: "value",
        value: {
          type: "integer",
          integer: { minValue: 0, maxValue: 150 },
        },
      },
      meta: { addedIn: 1 },
    };

    const personField3: IFieldDef = {
      key: "email",
      name: "Email",
      description: "Person email",
      isOptional: true,
      value: {
        type: "value",
        value: {
          type: "string",
          string: {},
        },
      },
      meta: { addedIn: 1 },
    };

    const personRecord: IRecordDef = {
      key: "Person",
      name: "Person",
      description: "A person record",
      fields: [personField1, personField2, personField3],
      meta: { addedIn: 1 },
    };

    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "A test schema",
      version: 1,
      primaryModelKeys: ["Person"],
      models: {
        Person: {
          type: "record",
          record: personRecord,
        } as IModelDef,
      },
    };

    const result = await generateZodSchemasFromIr(schema);
    const formatted = await formatWithPrettier(result);

    await expect(formatted).toMatchFileSnapshot(path.join(snapshotDir, "simple-records.ts"));
  });

  it("should generate Zod schemas for array and map types", async () => {
    const arrayField: IFieldDef = {
      key: "tags",
      name: "Tags",
      description: "List of tags",
      value: {
        type: "array",
        array: {
          allowNullValue: false,
          value: {
            type: "string",
            string: {},
          },
        },
      },
      meta: { addedIn: 1 },
    };

    const mapField: IFieldDef = {
      key: "metadata",
      name: "Metadata",
      description: "Key-value metadata",
      value: {
        type: "map",
        map: {
          allowNullValue: false,
          key: {
            type: "string",
            string: {},
          },
          value: {
            type: "unmanagedJson",
            unmanagedJson: {},
          },
        },
      },
      meta: { addedIn: 1 },
    };

    const containerRecord: IRecordDef = {
      key: "Container",
      name: "Container",
      description: "A container record",
      fields: [arrayField, mapField],
      meta: { addedIn: 1 },
    };

    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "A test schema",
      version: 1,
      primaryModelKeys: ["Container"],
      models: {
        Container: {
          type: "record",
          record: containerRecord,
        } as IModelDef,
      },
    };

    const result = await generateZodSchemasFromIr(schema);
    const formatted = await formatWithPrettier(result);

    await expect(formatted).toMatchFileSnapshot(path.join(snapshotDir, "array-and-map-types.ts"));
  });

  it("should generate Zod schemas with datetime fields", async () => {
    const datetimeField: IFieldDef = {
      key: "timestamp",
      name: "Timestamp",
      description: "Event timestamp",
      value: {
        type: "value",
        value: {
          type: "datetime",
          datetime: {},
        },
      },
      meta: { addedIn: 1 },
    };

    const eventRecord: IRecordDef = {
      key: "Event",
      name: "Event",
      description: "An event record",
      fields: [datetimeField],
      meta: { addedIn: 1 },
    };

    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "A test schema",
      version: 1,
      primaryModelKeys: ["Event"],
      models: {
        Event: {
          type: "record",
          record: eventRecord,
        } as IModelDef,
      },
    };

    const result = await generateZodSchemasFromIr(schema);
    const formatted = await formatWithPrettier(result);

    await expect(formatted).toMatchFileSnapshot(path.join(snapshotDir, "datetime-fields.ts"));
  });

  it("should generate Zod schemas with boolean fields", async () => {
    const booleanField: IFieldDef = {
      key: "enabled",
      name: "Enabled",
      description: "Whether feature is enabled",
      value: {
        type: "value",
        value: {
          type: "boolean",
          boolean: {},
        },
      },
      meta: { addedIn: 1 },
    };

    const optionalBooleanField: IFieldDef = {
      key: "isPublic",
      name: "IsPublic",
      description: "Whether feature is public",
      isOptional: true,
      value: {
        type: "value",
        value: {
          type: "boolean",
          boolean: {},
        },
      },
      meta: { addedIn: 1 },
    };

    const booleanArrayField: IFieldDef = {
      key: "flags",
      name: "Flags",
      description: "Array of boolean flags",
      value: {
        type: "array",
        array: {
          allowNullValue: false,
          value: {
            type: "boolean",
            boolean: {},
          },
        },
      },
      meta: { addedIn: 1 },
    };

    const featureRecord: IRecordDef = {
      key: "Feature",
      name: "Feature",
      description: "A feature toggle record",
      fields: [booleanField, optionalBooleanField, booleanArrayField],
      meta: { addedIn: 1 },
    };

    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "A test schema",
      version: 1,
      primaryModelKeys: ["Feature"],
      models: {
        Feature: {
          type: "record",
          record: featureRecord,
        } as IModelDef,
      },
    };

    const result = await generateZodSchemasFromIr(schema);
    const formatted = await formatWithPrettier(result);

    await expect(formatted).toMatchFileSnapshot(path.join(snapshotDir, "boolean-fields.ts"));
  });

  it("should generate Zod schemas for union types", async () => {
    // Define the ObjectNode record
    const objectNodeRecord: IRecordDef = {
      key: "ObjectNode",
      name: "ObjectNode",
      description: "A node in the graph",
      fields: [
        {
          key: "x",
          name: "X",
          description: "X coordinate",
          value: {
            type: "value",
            value: {
              type: "double",
              double: {},
            },
          },
          meta: { addedIn: 1 },
        },
        {
          key: "y",
          name: "Y",
          description: "Y coordinate",
          value: {
            type: "value",
            value: {
              type: "double",
              double: {},
            },
          },
          meta: { addedIn: 1 },
        },
        {
          key: "label",
          name: "Label",
          description: "Node label",
          isOptional: true,
          value: {
            type: "value",
            value: {
              type: "string",
              string: {},
            },
          },
          meta: { addedIn: 1 },
        },
      ],
      meta: { addedIn: 1 },
    };

    // Define the TextBox record
    const textBoxRecord: IRecordDef = {
      key: "TextBox",
      name: "TextBox",
      description: "A text box in the graph",
      fields: [
        {
          key: "x",
          name: "X",
          description: "X coordinate",
          value: {
            type: "value",
            value: {
              type: "double",
              double: {},
            },
          },
          meta: { addedIn: 1 },
        },
        {
          key: "y",
          name: "Y",
          description: "Y coordinate",
          value: {
            type: "value",
            value: {
              type: "double",
              double: {},
            },
          },
          meta: { addedIn: 1 },
        },
        {
          key: "text",
          name: "Text",
          description: "Text content",
          value: {
            type: "value",
            value: {
              type: "string",
              string: {},
            },
          },
          meta: { addedIn: 1 },
        },
      ],
      meta: { addedIn: 1 },
    };

    // Define the Node union
    const nodeUnion: IUnionDef = {
      key: "Node",
      discriminant: "type",
      name: "Node",
      description: "A node in the graph",
      variants: {
        object: "ObjectNode",
        "text-box": "TextBox",
      },
      meta: { addedIn: 1 },
    };

    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "A test schema with unions",
      version: 1,
      primaryModelKeys: ["ObjectNode", "TextBox", "Node"],
      models: {
        ObjectNode: {
          type: "record",
          record: objectNodeRecord,
        } as IModelDef,
        TextBox: {
          type: "record",
          record: textBoxRecord,
        } as IModelDef,
        Node: {
          type: "union",
          union: nodeUnion,
        } as IModelDef,
      },
    };

    const result = await generateZodSchemasFromIr(schema);
    const formatted = await formatWithPrettier(result);

    await expect(formatted).toMatchFileSnapshot(path.join(snapshotDir, "union-types.ts"));
  });

  it("should handle unions defined before their variant records", async () => {
    // Define records
    const fooRecord: IRecordDef = {
      key: "Foo",
      name: "Foo",
      description: "Foo record",
      fields: [
        {
          key: "value",
          name: "Value",
          description: "A value",
          value: {
            type: "value",
            value: {
              type: "string",
              string: {},
            },
          },
          meta: { addedIn: 1 },
        },
      ],
      meta: { addedIn: 1 },
    };

    const barRecord: IRecordDef = {
      key: "Bar",
      name: "Bar",
      description: "Bar record",
      fields: [
        {
          key: "count",
          name: "Count",
          description: "A count",
          value: {
            type: "value",
            value: {
              type: "integer",
              integer: {},
            },
          },
          meta: { addedIn: 1 },
        },
      ],
      meta: { addedIn: 1 },
    };

    // Define union that references the records
    const fooBarUnion: IUnionDef = {
      key: "FooBar",
      discriminant: "type",
      name: "FooBar",
      description: "FooBar union",
      variants: {
        foo: "Foo",
        bar: "Bar",
      },
      meta: { addedIn: 1 },
    };

    // Intentionally put union BEFORE its variant records in primaryModelKeys
    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "Test schema with union before records",
      version: 1,
      primaryModelKeys: ["FooBar", "Foo", "Bar"], // Union comes first!
      models: {
        Foo: {
          type: "record",
          record: fooRecord,
        } as IModelDef,
        Bar: {
          type: "record",
          record: barRecord,
        } as IModelDef,
        FooBar: {
          type: "union",
          union: fooBarUnion,
        } as IModelDef,
      },
    };

    const result = await generateZodSchemasFromIr(schema);
    const formatted = await formatWithPrettier(result);

    // Verify that records come before union in the output
    const lines = formatted.split("\n");
    const fooSchemaIndex = lines.findIndex(line => line.includes("export const FooSchema"));
    const barSchemaIndex = lines.findIndex(line => line.includes("export const BarSchema"));
    const fooBarSchemaIndex = lines.findIndex(line => line.includes("export const FooBarSchema"));

    expect(fooSchemaIndex).toBeGreaterThan(-1);
    expect(barSchemaIndex).toBeGreaterThan(-1);
    expect(fooBarSchemaIndex).toBeGreaterThan(-1);

    // Records should come before the union
    expect(fooSchemaIndex).toBeLessThan(fooBarSchemaIndex);
    expect(barSchemaIndex).toBeLessThan(fooBarSchemaIndex);

    await expect(formatted).toMatchFileSnapshot(path.join(snapshotDir, "union-before-records.ts"));
  });

  it("should generate Zod schemas with custom discriminant", async () => {
    const catRecord: IRecordDef = {
      key: "Cat",
      name: "Cat",
      description: "A cat",
      fields: [
        {
          key: "meow",
          name: "Meow",
          description: "Cat sound",
          value: {
            type: "value",
            value: {
              type: "string",
              string: {},
            },
          },
          meta: { addedIn: 1 },
        },
      ],
      meta: { addedIn: 1 },
    };

    const dogRecord: IRecordDef = {
      key: "Dog",
      name: "Dog",
      description: "A dog",
      fields: [
        {
          key: "bark",
          name: "Bark",
          description: "Dog sound",
          value: {
            type: "value",
            value: {
              type: "string",
              string: {},
            },
          },
          meta: { addedIn: 1 },
        },
      ],
      meta: { addedIn: 1 },
    };

    const animalUnion: IUnionDef = {
      key: "Animal",
      discriminant: "kind",
      name: "Animal",
      description: "An animal union with custom discriminant",
      variants: {
        cat: "Cat",
        dog: "Dog",
      },
      meta: { addedIn: 1 },
    };

    const schema: IRealTimeDocumentSchema = {
      name: "Test Schema",
      description: "A test schema with custom discriminant",
      version: 1,
      primaryModelKeys: ["Cat", "Dog", "Animal"],
      models: {
        Cat: {
          type: "record",
          record: catRecord,
        } as IModelDef,
        Dog: {
          type: "record",
          record: dogRecord,
        } as IModelDef,
        Animal: {
          type: "union",
          union: animalUnion,
        } as IModelDef,
      },
    };

    const result = await generateZodSchemasFromIr(schema);
    const formatted = await formatWithPrettier(result);

    expect(formatted).toContain("z.discriminatedUnion('kind'");
    expect(formatted).toContain("kind: z.literal('cat')");
    expect(formatted).toContain("kind: z.literal('dog')");

    await expect(formatted).toMatchFileSnapshot(
      path.join(snapshotDir, "custom-discriminant.ts"),
    );
  });
});
